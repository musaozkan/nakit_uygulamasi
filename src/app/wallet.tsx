import { BalanceLoader } from '@/components/BalanceLoader';
import { AssetTicker, useWallet } from '@tetherto/wdk-react-native-provider';
import { Balance } from '@tetherto/wdk-uikit-react-native';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { useKeseAssets } from '@/hooks/use-kese-assets';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Palette,
  QrCode,
  Settings,
  Shield,
  Star,
  User,
  Send,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AssetConfig, assetConfig } from '../config/assets';
import { FiatCurrency, pricingService } from '../services/pricing-service';
import formatAmount from '@/utils/format-amount';
import formatTokenAmount from '@/utils/format-token-amount';
import formatUSDValue from '@/utils/format-usd-value';
import useWalletAvatar from '@/hooks/use-wallet-avatar';
import { colors } from '@/constants/colors';

type AggregatedBalance = ({
  denomination: string;
  balance: number;
  usdValue: number;
  config: AssetConfig;
} | null)[];

type Transaction = {
  id: number;
  type: string;
  asset: string;
  token: string;
  amount: string;
  icon: any;
  iconColor: string;
  blockchain: string;
  hash: string;
  fiatAmount: number;
  currency: FiatCurrency;
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { wallet, isUnlocked, refreshWalletBalance, addresses, transactions: walletTransactions } = useWallet();
  const { goldAsset, cashAsset, totalValue, isLoading } = useKeseAssets();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const avatar = useWalletAvatar();
  const scrollY = useRef(new Animated.Value(0)).current;

  const hasWallet = !!wallet;

  // Redirect to authorization if wallet is not unlocked
  useEffect(() => {
    if (hasWallet && !isUnlocked) {
      router.replace('/authorize');
    }
  }, [hasWallet, isUnlocked, router]);

  // Animated border opacity based on scroll position
  const borderOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Get real transactions from wallet data
  const getTransactions = async () => {
    if (!walletTransactions) return [];

    // Get the wallet's own addresses for comparison
    const walletAddresses = addresses
      ? Object.values(addresses).map(addr => addr?.toLowerCase())
      : [];

    const result = await Promise.all(
      walletTransactions.list
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5) // Show more transactions since we removed other sections
        .map(async (tx, index) => {
          // Filter out non-KESE assets from activity if desired, or keep them for history?
          // Requirement says "Strictly support ONLY two assets". 
          // But history might be relevant. Let's filter for consistency with the "Clean UI" goal.
          if (!['USDT', 'USD₮', 'XAUT', 'XAU₮'].includes(tx.token)) return null;

          const fromAddress = tx.from?.toLowerCase();
          const isSent = walletAddresses.includes(fromAddress);
          const amount = parseFloat(tx.amount);
          const config = assetConfig[tx.token];

          // Calculate fiat amount using pricing service
          let fiatAmount = 0;
          try {
             fiatAmount = await pricingService.getFiatValue(
              amount,
              tx.token as AssetTicker,
              FiatCurrency.USD
            );
          } catch (e) {
            // ignore
          }

          return {
            id: index + 1,
            type: isSent ? 'sent' : 'received',
            asset: config?.name || tx.token.toUpperCase(),
            token: tx.token,
            amount: `${formatTokenAmount(amount, tx.token as AssetTicker)}`,
            icon: isSent ? ArrowUpRight : ArrowDownLeft,
            iconColor: isSent ? colors.danger : colors.success,
            blockchain: tx.blockchain,
            hash: tx.transactionHash,
            fiatAmount: fiatAmount,
            currency: FiatCurrency.USD,
          };
        })
    );

    return result.filter(Boolean) as Transaction[];
  };

  const handleSendPress = () => {
    router.push('/send/select-token');
  };

  const handleReceivePress = () => {
    router.push('/receive/select-token');
  };

  const handleQRPress = () => {
    router.push('/scan-qr');
  };

  const handleSeeAllActivity = () => {
    router.push('/activity');
  };

  const handleCreateWallet = () => {
    router.push('/wallet-setup/name-wallet');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleRefresh = async () => {
    if (!wallet) return;

    setRefreshing(true);
    try {
      await refreshWalletBalance();
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getTransactions().then(setTransactions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletTransactions?.list, addresses]);

  // Force component to fully mount before enabling RefreshControl on iOS
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const renderAssetCard = (title: string, asset: ReturnType<typeof useKeseAssets>['goldAsset'], isGold: boolean) => {
    return (
      <TouchableOpacity
        style={[styles.keseCard, isGold && styles.goldCard]}
        onPress={() => {
          if (wallet && asset) {
            router.push({
              pathname: '/token-details',
              params: {
                walletId: wallet.id,
                token: asset.id.toUpperCase(),
              },
            });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: isGold ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)' }]}>
             {asset?.config?.icon && <Image source={asset.config.icon} style={styles.cardIcon} />}
          </View>
          <Text style={[styles.cardTitle, isGold && { color: colors.gold }]}>{title}</Text>
        </View>
        
        <View style={styles.cardBalance}>
          <Text style={[styles.cardAmount, isGold && { color: colors.gold }]}>
            {asset ? asset.formattedBalance : '0.00'} {asset?.symbol || (isGold ? 'XAUT' : 'USDT')}
          </Text>
          <Text style={styles.cardFiat}>
            {asset ? formatAmount(asset.fiatValue) : '0.00'} USD
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            borderBottomColor: borderOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(30, 30, 30, 0)', 'rgba(30, 30, 30, 1)'],
            }),
          },
        ]}
      >
        <View style={styles.walletInfo}>
          <View style={styles.walletIcon}>
            <Text style={styles.walletIconText}>{avatar}</Text>
          </View>
          <Text style={styles.walletName}>{wallet?.name || 'KESE Wallet'}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Settings size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        refreshControl={
          mounted ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              title="Pull to refresh"
              titleColor={colors.textSecondary}
              progressViewOffset={insets.top}
            />
          ) : (
            <RefreshControl
              refreshing={false}
              onRefresh={() => {}}
              tintColor={colors.white}
              colors={[colors.white]}
              progressViewOffset={0}
            />
          )
        }
      >
        {/* Total Balance */}
        {!hasWallet && !isLoading ? (
          <TouchableOpacity onPress={handleCreateWallet} style={styles.createWalletContainer}>
            <Text style={styles.createWalletText}>Create Your KESE Wallet</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.totalBalanceContainer}>
            <Text style={styles.totalBalanceLabel}>Total Portfolio</Text>
            <Balance
              value={totalValue}
              currency="USD"
              isLoading={isLoading}
              Loader={BalanceLoader}
            />
          </View>
        )}

        {/* KESE Cards */}
        <View style={styles.cardsContainer}>
          {renderAssetCard('KESE (Altın)', goldAsset, true)}
          {renderAssetCard('Nakit (Dolar)', cashAsset, false)}
        </View>

        {/* Activity */}
        <View style={styles.activitySection}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {walletTransactions.isLoading ? (
              <View style={{ marginRight: 8 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null}
          </View>

          {transactions.length > 0 ? (
            transactions.map(tx => (
              <View key={tx.id} style={styles.transactionRow}>
                <View style={styles.transactionIcon}>
                  <tx.icon size={16} color={tx.iconColor} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>{tx.asset}</Text>
                  <Text style={styles.transactionSubtitle}>
                    {tx.type === 'sent' ? 'Sent' : 'Received'}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={styles.transactionAssetAmount}>{tx.amount}</Text>
                  <Text style={styles.transactionUsdAmount}>{formatUSDValue(tx.fiatAmount)}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noAssetsContainer}>
              <Text style={styles.noAssetsText}>No transactions yet</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleSeeAllActivity}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { marginBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <View style={[styles.navIconContainer, styles.activeNavIcon]}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={{ width: 24, height: 24, tintColor: colors.primary }} 
            />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.qrButton} onPress={handleSendPress}>
          <Send size={24} color={colors.black} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSettingsPress}>
          <User size={24} color={colors.textSecondary} />
          <Text style={styles.actionButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  walletIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  walletIconText: {
    fontSize: 12,
  },
  walletName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
  },
  createWalletContainer: {
    alignItems: 'center',
    padding: 20,
  },
  createWalletText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  totalBalanceContainer: {
    margin: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalBalanceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  keseCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goldCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)', // Very subtle gold tint
    borderColor: colors.gold,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIcon: {
    width: 24,
    height: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardBalance: {
    alignItems: 'flex-start',
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardFiat: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAssetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  transactionUsdAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noAssetsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAssetsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 20,
    left: 72,
    right: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 48,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  qrButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.primary,
    marginBottom: 24, // Lift it up slightly
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  navIconContainer: {
    marginBottom: 4,
  },
  activeNavIcon: {
    // Optional: Add indicator for active state
  },
});
