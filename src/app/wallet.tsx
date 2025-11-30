import { BalanceLoader } from '@/components/BalanceLoader';
import { useWallet } from '@/providers/KeseWalletProvider';
import { AssetTicker } from '@tetherto/wdk-react-native-provider';
import { Balance } from '@tetherto/wdk-uikit-react-native';
import { useRouter } from 'expo-router';
import { useKeseAssets } from '@/hooks/use-kese-assets';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  User,
  Send,
  Users,
  QrCode,
  PlusCircle,
  Home,
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeftRight,
  Calendar,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AssetConfig, assetConfig } from '../config/assets';
import { FiatCurrency, pricingService } from '../services/pricing-service';
import formatAmount from '@/utils/format-amount';
import formatTokenAmount from '@/utils/format-token-amount';
import formatUSDValue from '@/utils/format-usd-value';
import useWalletAvatar from '@/hooks/use-wallet-avatar';
import { colors } from '@/constants/colors';

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
  const router = useRouter();

  const { wallet, isUnlocked, refreshWalletBalance, addresses, transactions: walletTransactions, balances } = useWallet();
  const { goldAsset, cashAsset, totalValue, isLoading } = useKeseAssets();
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [showGrams, setShowGrams] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const avatar = useWalletAvatar();
  const scrollY = useRef(new Animated.Value(0)).current;

  const hasWallet = !!wallet;

  // Helper to get balance for a specific symbol
  const getBalanceForSymbol = (symbol: string) => {
    const balanceItem = balances.list.find(b => b.symbol === symbol);
    if (!balanceItem) return { balance: 0, formatted: '0.00' };

    const balanceInWei = BigInt(balanceItem.balance);
    const decimals = balanceItem.decimals || 18;
    const divisor = BigInt(10 ** decimals);
    const balanceInEth = Number(balanceInWei) / Number(divisor);

    return {
      balance: balanceInEth,
      formatted: balanceInEth.toFixed(4)
    };
  };

  useEffect(() => {
    if (hasWallet && !isUnlocked) {
      router.replace('/authorize');
    }
  }, [hasWallet, isUnlocked, router]);

  const borderOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const getTransactions = async () => {
    if (!walletTransactions) return [];

    const walletAddresses = addresses
      ? Object.values(addresses).map(addr => addr?.toLowerCase())
      : [];

    const result = await Promise.all(
      walletTransactions.list
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map(async (tx, index) => {
          if (!['USDT', 'USD₮', 'XAUT', 'XAU₮'].includes(tx.token)) return null;

          const fromAddress = tx.from?.toLowerCase();
          const isSent = walletAddresses.includes(fromAddress);
          const amount = parseFloat(tx.amount);
          const config = assetConfig[tx.token];

          let fiatAmount = 0;
          try {
            fiatAmount = await pricingService.getFiatValue(
              amount,
              tx.token as AssetTicker,
              FiatCurrency.USD
            );
          } catch (e) { }

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

  const handleSendPress = () => router.push('/send/select-token');
  const handleQRPress = () => {
    // BYPASS: Doğrudan Takı Tak ekranına git (Test için)
    router.push({
      pathname: '/send/attach-jewelry',
      params: {
        scannedAddress: '0xMockAddressForTesting123456789',
      },
    });

    /* 
    router.push({
      pathname: '/scan-qr',
      params: {
        title: 'Takı Tak',
        subtitle: 'Düğün veya nişan sahibinin QR kodunu okut.',
        returnRoute: '/send/attach-jewelry',
      },
    });
    */
  };

  const handleSeeAllActivity = () => router.push('/activity');
  const handleCreateWallet = () => router.push('/wallet-setup/name-wallet');

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleStartGoldDay = () => {
    router.push('/gold-day/create');
  };

  // Güne Katıl da QR açar, akıllı QR ekranımız davetiyeyi tanır
  const handleJoinGoldDay = () => {
    router.push({
      pathname: '/scan-qr',
      params: {
        title: 'Güne Katıl',
        subtitle: 'Arkadaşının gösterdiği Gün Davetiyesi QR kodunu okut.',
      },
    });
  };

  const handleGoldDayList = () => {
    router.push('/gold-day/list');
  };

  const handleRefresh = async () => {
    if (!wallet) return;
    setRefreshing(true);
    try {
      await refreshWalletBalance();
    } catch (error) {
      console.error('Bakiye yenilenemedi:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getTransactions().then(setTransactions);
  }, [walletTransactions?.list, addresses]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const renderAssetCard = (title: string, symbol: 'XAUT' | 'USDT', isGold: boolean) => {
    // 1 XAUT = ~31.1035 Grams (Troy Ounce to Grams)
    const GRAMS_PER_XAUT = 31.1035;

    const balanceData = getBalanceForSymbol(symbol);
    let displayAmount = balanceData.formatted;
    let displayUnit: string = symbol;

    if (isGold && showGrams) {
      // Convert to Grams
      const rawAmount = balanceData.balance;
      displayAmount = (rawAmount * GRAMS_PER_XAUT).toFixed(2);
      displayUnit = 'Gram Altın';
    }

    return (
      <TouchableOpacity
        style={[styles.keseCard, isGold && styles.goldCard]}
        onPress={() => {
          if (wallet) {
            router.push({
              pathname: '/token-details',
              params: {
                walletId: wallet.id,
                token: symbol,
              },
            });
          }
        }}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: isGold ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)' }]}>
            <Image
              source={isGold ? assetConfig.xaut.icon : assetConfig.usdt.icon}
              style={styles.cardIcon}
            />
          </View>
          <Text style={[styles.cardTitle, isGold && { color: colors.gold }]}>{title}</Text>

          {/* Gold Unit Toggle Button */}
          {isGold && (
            <TouchableOpacity
              style={styles.unitToggleButton}
              onPress={() => setShowGrams(!showGrams)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeftRight size={16} color={colors.gold} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardBalance}>
          <Text style={[styles.cardAmount, isGold && { color: colors.gold }]}>
            {hideBalances ? '****' : displayAmount} {displayUnit}
          </Text>
          <Text style={styles.cardFiat}>
            {hideBalances ? '****' : '0.00'} USD
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Üst Bar */}
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
          <View>
            <Text style={styles.greetingText}>Hoşgeldin,</Text>
            <Text style={styles.walletName}>{wallet?.name || 'Misafir'}</Text>
          </View>
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
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            title="Yenilemek için çek"
            titleColor={colors.textSecondary}
            progressViewOffset={insets.top}
          />
        }
      >
        {!hasWallet && !isLoading ? (
          <TouchableOpacity onPress={handleCreateWallet} style={styles.createWalletContainer}>
            <Text style={styles.createWalletText}>Hemen KESE'ni Oluştur</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.totalBalanceContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity onPress={() => setHideBalances(!hideBalances)}>
                <Text style={[styles.totalBalanceLabel, { marginBottom: 0 }]}>Toplam Varlık</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setHideBalances(!hideBalances)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {hideBalances ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <BalanceLoader />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.balanceText}>
                  {hideBalances ? '****' : formatAmount(totalValue)}
                </Text>
                <Text style={styles.currencyText}> USD</Text>
              </View>
            )}
          </View>
        )}

        {/* HIZLI İŞLEMLER */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>

            {/* Gün Başlat */}
            <TouchableOpacity style={styles.quickActionButton} onPress={handleStartGoldDay}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Users size={24} color={colors.gold} />
              </View>
              <Text style={styles.quickActionText}>Gün Başlat</Text>
            </TouchableOpacity>

            {/* YENİ EKLENEN: Güne Katıl */}
            <TouchableOpacity style={styles.quickActionButton} onPress={handleJoinGoldDay}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <UserPlus size={24} color={colors.gold} />
              </View>
              <Text style={styles.quickActionText}>Güne Katıl</Text>
            </TouchableOpacity>

            {/* YENİ EKLENEN: Gün Listesi */}
            <TouchableOpacity style={styles.quickActionButton} onPress={handleGoldDayList}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Calendar size={24} color={colors.gold} />
              </View>
              <Text style={styles.quickActionText}>Günlerim</Text>
            </TouchableOpacity>

            {/* Takı Tak */}
            <TouchableOpacity style={styles.quickActionButton} onPress={handleQRPress}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(46, 204, 113, 0.15)' }]}>
                <QrCode size={24} color="#2ECC71" />
              </View>
              <Text style={styles.quickActionText}>Takı Tak</Text>
            </TouchableOpacity>

            {/* Kese Doldur */}
            <TouchableOpacity style={styles.quickActionButton} onPress={() => Alert.alert("Bilgi", "Kredi kartı entegrasyonu yakında!")}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
                <PlusCircle size={24} color="#3498DB" />
              </View>
              <Text style={styles.quickActionText}>Kese Doldur</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        <View style={styles.cardsContainer}>
          {renderAssetCard('KESE (Altın)', 'XAUT', true)}
          {renderAssetCard('Nakit (Dolar)', 'USDT', false)}
        </View>

        <View style={styles.activitySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Son Hareketler</Text>
            {walletTransactions?.isLoading && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
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
                    {tx.type === 'sent' ? 'Gönderilen' : 'Gelen'}
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
              <Text style={styles.noAssetsText}>Henüz işlem yok</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleSeeAllActivity} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Partial Masking Blocker */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom + 10 + 35, // Safe area + margin + half tab bar height
          backgroundColor: colors.background,
          zIndex: 90,
        }}
      />

      {/* ALT MENÜ */}
      <View style={[styles.bottomBarContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => scrollY && (scrollY as any).setValue(0)}
          >
            <Home size={26} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.floatingSendButton} onPress={handleSendPress} activeOpacity={0.9}>
            <Send size={32} color={colors.black} style={{ marginLeft: -2, marginTop: 2 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={handleSettingsPress}>
            <User size={26} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View >
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
    paddingBottom: 130,
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
    zIndex: 10,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletIconText: {
    fontSize: 20,
  },
  greetingText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  walletName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  createWalletContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    margin: 20,
    borderRadius: 16,
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
    letterSpacing: 1,
  },

  // HIZLI İŞLEMLER
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  actionsScroll: {
    paddingLeft: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // KARTLAR
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  keseCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  goldCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
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

  // AKTİVİTE
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 13,
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
    fontSize: 13,
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
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // ALT MENÜ
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    width: '90%',
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minWidth: 50,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  floatingSendButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFC107', // Toned down gold (Amber)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background, // Keep background color to create a "cutout" effect if it overlaps slightly or looks distinct
  },
  balanceText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
  },
  currencyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  unitToggleButton: {
    marginLeft: 'auto', // Pushes to the right
    padding: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
  },
});