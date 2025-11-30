import { AssetConfig, assetConfig } from '@/config/assets';
import { FiatCurrency, pricingService } from '@/services/pricing-service';
import formatTokenAmount from '@/utils/format-token-amount';
import getDisplaySymbol from '@/utils/get-display-symbol';
import { AssetTicker } from '@tetherto/wdk-react-native-provider';
import { useWallet } from '@/providers/KeseWalletProvider';
import { useEffect, useState } from 'react';

export type KeseAsset = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  formattedBalance: string;
  fiatValue: number;
  fiatCurrency: FiatCurrency;
  config: AssetConfig;
};

const ALLOWED_ASSETS = ['USDT', 'USD₮', 'XAUT', 'XAU₮'];

export function useKeseAssets() {
  const { balances, wallet } = useWallet();
  const [assets, setAssets] = useState<KeseAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateAssets = async () => {
      if (!balances?.list) {
        setAssets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const balanceMap = new Map<string, { totalBalance: number }>();

      // Sum up balances by denomination
      balances.list.forEach(balance => {
        const current = balanceMap.get(balance.denomination) || { totalBalance: 0 };
        balanceMap.set(balance.denomination, {
          totalBalance: current.totalBalance + parseFloat(balance.value),
        });
      });

      const promises = Array.from(balanceMap.entries()).map(async ([denomination, { totalBalance }]) => {
        // Strict filter
        if (!ALLOWED_ASSETS.includes(denomination)) return null;

        const config = assetConfig[denomination];
        if (!config) return null;

        let fiatValue = 0;
        try {
          fiatValue = await pricingService.getFiatValue(
            totalBalance,
            denomination as AssetTicker,
            FiatCurrency.USD
          );
        } catch (error) {
          console.warn(`Failed to get fiat value for ${denomination}`, error);
        }

        return {
          id: denomination,
          name: config.name,
          symbol: getDisplaySymbol(denomination),
          balance: totalBalance,
          formattedBalance: formatTokenAmount(totalBalance, denomination as AssetTicker, false),
          fiatValue,
          fiatCurrency: FiatCurrency.USD,
          config,
        };
      });

      const result = (await Promise.all(promises)).filter(Boolean) as KeseAsset[];

      // Sort: XAUT first, then USDT
      result.sort((a, b) => {
        if (a.id.includes('XAUT')) return -1;
        if (b.id.includes('XAUT')) return 1;
        return 0;
      });

      setAssets(result);
      setIsLoading(false);
    };

    calculateAssets();
  }, [balances?.list]);

  const goldAsset = assets.find(a => a.id === 'XAUT' || a.id === 'XAU₮');
  const cashAsset = assets.find(a => a.id === 'USDT' || a.id === 'USD₮');

  const totalValue = assets.reduce((sum, asset) => sum + asset.fiatValue, 0);

  return {
    assets,
    goldAsset,
    cashAsset,
    totalValue,
    isLoading: isLoading || balances.isLoading,
  };
}
