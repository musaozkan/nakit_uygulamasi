export const CHAINS_CONFIG = {
  ethereum: {
    // TESTNET: Sepolia
    chainId: 11155111,
    blockchain: "sepolia",

    // Geliştirme için public RPC – istersen kendi Alchemy/Infura Sepolia URL’ini kullan
    provider: "https://rpc.sepolia.org",

    // Candide testnet bundler URL – kendi PROJECT_ID'inle değiştir
    bundlerUrl:
      "https://api.candide.dev/paymaster/v3/sepolia/31a81ae91261beb8f437a4a96729a2aa",

    // Candide’in Sepolia paymaster public endpoint’i (dokümandan doğrula)
    paymasterUrl: "https://api.candide.dev/public/v3/sepolia",

    // Sepolia’daki paymaster sözleşme adresi (Candide panelinden alacaksın)
    paymasterAddress: "<SEPOLIA_PAYMASTER_ADDRESS>",

    entrypointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",

    transferMaxFee: 5000000,
    swapMaxFee: 5000000,
    bridgeMaxFee: 5000000,

    // TEST için:
    // - Sepolia’da gerçek USDT / XAUt olmayabilir, genelde test token kullanılır.
    // - Candide’in verdiği test token adresini veya senin deploy ettiğin mock USDT/XAUt adresini buraya yaz.
    paymasterToken: {
      address: "<SEPOLIA_TEST_USDT_OR_XAUT_ADDRESS>",
    },

    safeModulesVersion: "0.3.0",
  },
};