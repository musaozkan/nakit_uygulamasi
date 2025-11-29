import { FiatCurrency } from '@/services/pricing-service';
import { NetworkType } from '@tetherto/wdk-react-native-provider';

export interface AssetConfig {
  name: string;
  symbol: string;
  icon: any;
  color: string;
  supportedNetworks: NetworkType[];
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  fiatValue: number;
  fiatCurrency: FiatCurrency;
  icon: string | any;
  color: string;
}

// SADECE BUNLAR KALSIN:
export const assetConfig: Record<string, AssetConfig> = {
  usdt: {
    name: 'USD₮',
    symbol: 'USD₮',
    icon: require('../../assets/images/tokens/tether-usdt-logo.png'),
    color: '#26A17B', // Tether Yeşili
    supportedNetworks: [
      NetworkType.POLYGON, // En ucuz transfer burası
      NetworkType.ETHEREUM,
    ],
  },
  xaut: {
    name: 'XAU₮', // Bizim Altın
    symbol: 'XAU₮',
    icon: require('../../assets/images/tokens/tether-xaut-logo.png'),
    color: '#FFD700', // Altın Sarısı
    supportedNetworks: [NetworkType.ETHEREUM], // Altın genelde Ethereum'da
  },
};