import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import WalletManagerEvm, { WalletAccountEvm } from '@tetherto/wdk-wallet-evm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletContextType, WalletData } from './wallet/types';
import { walletReducer } from './wallet/reducer';
import { WALLET_CONTEXT_INITIAL_STATE, STORAGE_KEY_WALLET, STORAGE_KEY_ADDRESSES } from './wallet/constants';

const KeseWalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(KeseWalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a KeseWalletProvider');
    }
    return context;
};

export const KeseWalletProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(walletReducer, WALLET_CONTEXT_INITIAL_STATE);

    // Load wallet from storage on mount
    useEffect(() => {
        loadStoredWallet();
    }, []);

    const loadStoredWallet = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY_WALLET);
            if (stored) {
                const data = JSON.parse(stored);

                if (data && data.mnemonic) {
                    const manager = new WalletManagerEvm(data.mnemonic, {
                        provider: 'https://ethereum-sepolia-rpc.publicnode.com',
                        transferMaxFee: 100000000000000
                    });

                    // Re-derive accounts
                    // Account 0 -> XAUT
                    // Account 1 -> USDT
                    const accountXaut = await manager.getAccount(0);
                    const accountUsdt = await manager.getAccount(1);

                    const accountXautAddress = await accountXaut.getAddress();
                    const accountUsdtAddress = await accountUsdt.getAddress();

                    const walletData: WalletData = {
                        ...data,
                        manager
                    };

                    const addresses = {
                        'XAUT': accountXautAddress,
                        'USDT': accountUsdtAddress
                    };

                    dispatch({ type: 'SET_WALLET', payload: walletData });
                    // We set the primary account as XAUT (Account 0) for now, 
                    // or we might need to change state to support multiple active accounts.
                    // For now, keeping 'account' as the primary one (XAUT).
                    dispatch({ type: 'SET_ACCOUNT', payload: accountXaut });
                    dispatch({ type: 'SET_ADDRESSES', payload: addresses });
                    dispatch({ type: 'SET_UNLOCKED', payload: true });
                }
            }
        } catch (error) {
            console.error('Failed to load stored wallet:', error);
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to load wallet') });
        }
    };

    const saveWalletToStorage = async (wallet: WalletData) => {
        try {
            // Don't save the manager instance
            const { manager, ...rest } = wallet;
            await AsyncStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(rest));
        } catch (error) {
            console.error('Failed to save wallet to storage:', error);
        }
    };

    const createWallet = async ({ mnemonic, name }: { mnemonic: string; name?: string }) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const manager = new WalletManagerEvm(mnemonic, {
                provider: 'https://ethereum-sepolia-rpc.publicnode.com', // Sepolia Testnet
                transferMaxFee: 100000000000000 // 100 Gwei
            });

            // Derive two separate accounts
            // Account 0 -> XAUT
            // Account 1 -> USDT
            const accountXaut = await manager.getAccount(0);
            const addressXaut = await accountXaut.getAddress();

            const accountUsdt = await manager.getAccount(1);
            const addressUsdt = await accountUsdt.getAddress();

            const walletData: WalletData = {
                id: 'default-id',
                name: name || 'My Wallet',
                address: addressXaut, // Default address (XAUT)
                usdtAddress: addressUsdt,
                xautAddress: addressXaut,
                enabledAssets: ['USDT', 'XAUT'],
                mnemonic: mnemonic,
                manager: manager
            };

            const addresses = {
                'XAUT': addressXaut,
                'USDT': addressUsdt
            };

            dispatch({ type: 'SET_WALLET', payload: walletData });
            dispatch({ type: 'SET_ACCOUNT', payload: accountXaut });
            dispatch({ type: 'SET_ADDRESSES', payload: addresses });
            dispatch({ type: 'SET_UNLOCKED', payload: true });

            await saveWalletToStorage(walletData);

        } catch (err) {
            console.error("Failed to create wallet", err);
            dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err : new Error('Unknown error') });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const unlockWallet = async () => {
        // Since we load from storage and re-instantiate, we are effectively unlocking.
        // If we had a password, we would use it here.
        dispatch({ type: 'SET_UNLOCKED', payload: true });
        return true;
    };

    const clearWallet = async () => {
        dispatch({ type: 'CLEAR_WALLET' });
        await AsyncStorage.removeItem(STORAGE_KEY_WALLET);
        await AsyncStorage.removeItem(STORAGE_KEY_ADDRESSES);
    };

    const refreshWalletBalance = async () => {
        if (!state.wallet || !state.account) return;

        try {
            dispatch({ type: 'SET_BALANCES', payload: { ...state.balances, isLoading: true } });

            const { manager } = state.wallet;
            const { CONTRACT_ADDRESSES } = require('./wallet/constants');

            // Derive both accounts
            const accountXaut = await manager.getAccount(0);
            const accountUsdt = await manager.getAccount(1);

            // Helper function to fetch balance
            const fetchBalance = async (account: any, contractAddress: string, symbol: string) => {
                try {
                    if (contractAddress && contractAddress !== '') {
                        return await account.getTokenBalance(contractAddress);
                    } else {
                        return await account.getBalance();
                    }
                } catch (error) {
                    console.warn(`Failed to fetch ${symbol} balance, falling back to native balance`, error);
                    try {
                        return await account.getBalance();
                    } catch (err) {
                        console.error(`Failed to fetch native balance for ${symbol} account`, err);
                        return BigInt(0);
                    }
                }
            };

            // Fetch balances for both accounts
            const [xautBalance, usdtBalance] = await Promise.all([
                fetchBalance(accountXaut, CONTRACT_ADDRESSES.XAUT, 'XAUT'),
                fetchBalance(accountUsdt, CONTRACT_ADDRESSES.USDT, 'USDT')
            ]);

            const balancesList = [
                { symbol: 'XAUT', balance: xautBalance.toString(), decimals: 18 },
                { symbol: 'USDT', balance: usdtBalance.toString(), decimals: 18 }
            ];

            dispatch({ type: 'SET_BALANCES', payload: { list: balancesList, isLoading: false } });

        } catch (error) {
            console.error('Failed to refresh balances:', error);
            dispatch({ type: 'SET_BALANCES', payload: { list: state.balances.list, isLoading: false } });
        }
    };

    const value = {
        ...state,
        createWallet,
        unlockWallet,
        clearWallet,
        refreshWalletBalance
    };

    return (
        <KeseWalletContext.Provider value={value}>
            {children}
        </KeseWalletContext.Provider>
    );
};