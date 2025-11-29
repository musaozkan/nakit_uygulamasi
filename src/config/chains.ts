export const CHAINS_CONFIG = {
  ethereum: {
    chainId: 1,
    blockchain: "ethereum",
    provider: "https://eth-mainnet.g.alchemy.com/v2/your-api-key", // TODO: Replace with valid RPC URL
    bundlerUrl: "https://api.candide.dev/paymaster/v3/ethereum/placeholder", // TODO: Replace with valid Bundler URL
    paymasterUrl: "https://api.candide.dev/public/v3/ethereum", // TODO: Replace with valid Paymaster URL
    paymasterAddress: "0x0000000000000000000000000000000000000000", // TODO: Replace with valid Paymaster Address
    entrypointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT on Ethereum
    },
    safeModulesVersion: "0.3.0",
  },
  arbitrum: {
    chainId: 42161,
    blockchain: "arbitrum",
    provider: "https://arb-mainnet.g.alchemy.com/v2/your-api-key", // TODO: Replace with valid RPC URL
    bundlerUrl: "https://api.candide.dev/paymaster/v3/arbitrum/placeholder",
    paymasterUrl: "https://api.candide.dev/public/v3/arbitrum",
    paymasterAddress: "0x0000000000000000000000000000000000000000",
    entrypointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: {
      address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT on Arbitrum
    },
    safeModulesVersion: "0.3.0",
  },
  ton: {
    tonApiClient: {
      url: "https://toncenter.com/api/v2/jsonRPC",
    },
    tonClient: {
      url: "https://toncenter.com/api/v2/jsonRPC",
    },
    paymasterToken: {
      address: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs", // USDT on TON
    },
    transferMaxFee: 5000000,
  },
  polygon: {
    chainId: 137,
    blockchain: "polygon",
    provider: "https://polygon.gateway.tenderly.co/",
    bundlerUrl: "https://api.candide.dev/paymaster/v3/amoy/68f74a6fef23b55eedd92e8a9afe4355",
    paymasterUrl: "https://api.candide.dev/public/v3/polygon",
    paymasterAddress: "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
    entrypointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,
    paymasterToken: {
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT on Polygon
    },
    safeModulesVersion: "0.3.0",
  },
  bitcoin: {
    host: "api.ordimint.com",
    port: 50001,
  },
  // Add more chains as needed
};
