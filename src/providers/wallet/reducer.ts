import { WalletAction, WalletContextState } from './types';
import { WALLET_CONTEXT_INITIAL_STATE } from './constants';

export const walletReducer = (state: WalletContextState, action: WalletAction): WalletContextState => {
    switch (action.type) {
        case 'SET_WALLET':
            return { ...state, wallet: action.payload };
        case 'SET_ACCOUNT':
            return { ...state, account: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_INITIALIZED':
            return { ...state, isInitialized: action.payload };
        case 'SET_UNLOCKED':
            return { ...state, isUnlocked: action.payload };
        case 'SET_ADDRESSES':
            return { ...state, addresses: action.payload };
        case 'SET_TRANSACTIONS':
            return { ...state, transactions: action.payload };
        case 'SET_BALANCES':
            return { ...state, balances: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'CLEAR_WALLET':
            return { ...WALLET_CONTEXT_INITIAL_STATE, isInitialized: state.isInitialized };
        default:
            return state;
    }
};
