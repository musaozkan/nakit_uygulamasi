import { AssetTicker, NetworkType, WDKService } from '@tetherto/wdk-react-native-provider';

export interface GasFeeEstimate {
  fee?: number;
  error?: string;
}

// Sadece kullandığımız ağların adresleri kalsın
const QUOTE_RECIPIENTS = {
  [AssetTicker.USDT]: {
    networks: {
      [NetworkType.ETHEREUM]: '0x8d42eb95360bf68d65e5a810986b2ebd88c5e606',
      [NetworkType.POLYGON]: '0x8d42eb95360bf68d65e5a810986b2ebd88c5e606',
    },
  },
  [AssetTicker.XAUT]: {
    networks: {
      [NetworkType.ETHEREUM]: '0x8d42eb95360bf68d65e5a810986b2ebd88c5e606',
    },
  },
};

export const getNetworkType = (networkId: string): NetworkType => {
  const networkMap: Record<string, NetworkType> = {
    ethereum: NetworkType.ETHEREUM,
    polygon: NetworkType.POLYGON,
  };
  return networkMap[networkId] || NetworkType.POLYGON;
};

export const getAssetTicker = (tokenId: string): AssetTicker => {
  const assetMap: Record<string, AssetTicker> = {
    usdt: AssetTicker.USDT,
    xaut: AssetTicker.XAUT,
  };
  return assetMap[tokenId?.toLowerCase()] || AssetTicker.USDT;
};

export const calculateGasFee = async (
  networkId: string,
  tokenId: string,
  amount?: number
): Promise<GasFeeEstimate> => {
  try {
    const networkType = getNetworkType(networkId);
    const assetTicker = getAssetTicker(tokenId);
    
    // @ts-expect-error
    const quoteRecipient = QUOTE_RECIPIENTS[assetTicker]?.networks?.[networkType];

    if (!quoteRecipient) {
        // Desteklenmeyen ağ/token kombinasyonu
        return { fee: 0 }; 
    }

    const gasFee = await WDKService.quoteSendByNetwork(
      networkType,
      0, 
      amount || 1,
      quoteRecipient,
      assetTicker
    );

    return { fee: gasFee };
  } catch (error) {
    console.error('Gas fee calculation failed:', error);
    return {
      fee: undefined,
      error: 'Fee calculation failed',
    };
  }
};