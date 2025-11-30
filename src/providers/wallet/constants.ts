import { WalletContextState } from './types';

export const WALLET_CONTEXT_INITIAL_STATE: WalletContextState = {
    wallet: null,
    account: null,
    isLoading: false,
    isInitialized: true,
    isUnlocked: false,
    addresses: null,
    transactions: { list: [], isLoading: false },
    balances: { list: [], isLoading: false },
    error: null,
};

export const STORAGE_KEY_WALLET = 'kese_wallet_data';
export const STORAGE_KEY_ADDRESSES = 'kese_wallet_addresses';

// Sepolia Testnet Contract Addresses
// Note: These are placeholders. Real USDT/XAUT contracts may not exist on Sepolia.
// For testing, we'll use native ETH balance as a fallback.
export const CONTRACT_ADDRESSES = {
    USDT: '', // No valid USDT contract on Sepolia - will use native balance
    XAUT: ''  // No valid XAUT contract on Sepolia - will use native balance
};
