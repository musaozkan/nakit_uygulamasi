import WalletManagerEvm, { WalletAccountEvm } from '@tetherto/wdk-wallet-evm';

export interface Transaction {
    id: string;
    type: 'sent' | 'received';
    token: string;
    amount: string;
    timestamp: number;
    blockchain: string;
    transactionHash: string;
    from: string;
    to: string;
}

export interface WalletData {
    id: string;
    name: string;
    address: string;
    usdtAddress: string;
    xautAddress: string;
    enabledAssets: string[];
    mnemonic: string;
    manager: WalletManagerEvm;
}

export interface WalletContextState {
    wallet: WalletData | null;
    account: WalletAccountEvm | null;
    isLoading: boolean;
    isInitialized: boolean;
    isUnlocked: boolean;
    addresses: { [key: string]: string } | null;
    transactions: { list: Transaction[]; isLoading: boolean } | null;
    balances: { list: any[]; isLoading: boolean };
    error: Error | null;
}

export interface WalletContextType extends WalletContextState {
    createWallet: (params: { mnemonic: string; name?: string }) => Promise<void>;
    unlockWallet: () => Promise<boolean>;
    clearWallet: () => Promise<void>;
    refreshWalletBalance: () => Promise<void>;
}

export type WalletAction =
    | { type: 'SET_WALLET'; payload: WalletData | null }
    | { type: 'SET_ACCOUNT'; payload: WalletAccountEvm | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_INITIALIZED'; payload: boolean }
    | { type: 'SET_UNLOCKED'; payload: boolean }
    | { type: 'SET_ADDRESSES'; payload: { [key: string]: string } | null }
    | { type: 'SET_TRANSACTIONS'; payload: { list: Transaction[]; isLoading: boolean } | null }
    | { type: 'SET_BALANCES'; payload: { list: any[]; isLoading: boolean } }
    | { type: 'SET_ERROR'; payload: Error | null }
    | { type: 'CLEAR_WALLET' };
