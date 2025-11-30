import { assetConfig } from '@/config/assets';
import { useLocalSearchParams } from 'expo-router';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

import { useWallet } from '@/providers/KeseWalletProvider';
import { AssetSelector, type Token } from '@tetherto/wdk-uikit-react-native';
import { useKeseAssets } from '@/hooks/use-kese-assets';
import formatAmount from '@/utils/format-amount';
import { addToRecentTokens, getRecentTokens } from '@/utils/recent-tokens';
import Header from '@/components/header';

export default function SelectTokenScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const params = useLocalSearchParams();
  const { wallet } = useWallet();
  const { assets } = useKeseAssets();

  // Get the scanned address from params (passed from QR scanner)
  const { scannedAddress } = params as { scannedAddress?: string };
  const [recentTokens, setRecentTokens] = useState<string[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const loadRecentTokens = async () => {
      const recent = await getRecentTokens('send');
      setRecentTokens(recent);
    };
    loadRecentTokens();
  }, []);

  // Convert KeseAssets to UI Kit Tokens
  useEffect(() => {
    if (!assets) {
      setTokens([]);
      return;
    }

    const formattedTokens: Token[] = assets.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      balance: asset.formattedBalance,
      balanceUSD: `${formatAmount(asset.fiatValue)} USD`,
      icon: asset.config.icon,
      color: asset.config.color,
      hasBalance: asset.balance > 0,
    }));

    setTokens(formattedTokens);
  }, [assets]);

  const handleSelectToken = useCallback(
    async (token: Token) => {
      // Don't allow selection of tokens with zero balance
      if (!token.hasBalance) {
        return;
      }

      // Save token to recent tokens
      const updatedRecent = await addToRecentTokens(token.name, 'send');
      setRecentTokens(updatedRecent);

      router.push({
        pathname: '/send/select-network',
        params: {
          tokenId: token.id,
          tokenSymbol: token.symbol,
          tokenName: token.name,
          tokenBalance: token.balance,
          tokenBalanceUSD: token.balanceUSD,
          ...(scannedAddress && { scannedAddress }),
        },
      });
    },
    [router, scannedAddress]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Send funds" style={styles.header} />
      <AssetSelector
        tokens={tokens}
        recentTokens={recentTokens}
        onSelectToken={handleSelectToken}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 16,
  },
});
