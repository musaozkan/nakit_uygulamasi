import Header from '@/components/header';
import { clearAvatar } from '@/config/avatar-options';
import { networkConfigs } from '@/config/networks';
import useWalletAvatar from '@/hooks/use-wallet-avatar';
import getDisplaySymbol from '@/utils/get-display-symbol';
import { NetworkType } from '@tetherto/wdk-react-native-provider';
import { useWallet } from '@/providers/KeseWalletProvider';
import * as Clipboard from 'expo-clipboard';
// ⚠️ DİKKAT: Burada da useRouter kullanıyoruz, garanti olsun
import { useRouter } from 'expo-router';
import { Copy, Info, Shield, Trash2, Wallet } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { colors } from '@/constants/colors';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // <-- Düzeltildi
  const { wallet, clearWallet, addresses } = useWallet();
  const avatar = useWalletAvatar();

  const handleDeleteWallet = () => {
    Alert.alert(
      'Keseyi Sil',
      'Bak Dayı, bunu silersen bu telefondaki her şey gider. Eğer o 12 kelimelik "Kasa Anahtarı"nı bir yere yazmadıysan parana bir daha ulaşamazsın. Emin misin?',
      [
        {
          text: 'Vazgeç',
          style: 'cancel',
        },
        {
          text: 'Evet, Sil Gitsin',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWallet();
              await clearAvatar();
              toast.success('Kese başarıyla silindi');
              router.dismissAll();
              router.replace('/');
            } catch (error) {
              console.error('Failed to delete wallet:', error);
              toast.error('Silinirken hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleCopyAddress = async (address: string, networkName: string) => {
    await Clipboard.setStringAsync(address);
    toast.success(`${networkName} adresi kopyalandı`);
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Yok';
    if (address.length <= 15) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const getNetworkName = (network: string) => {
    const config = networkConfigs[network as NetworkType];
    return config?.name || network;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Ayarlar" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Kese Bilgileri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Kese Bilgileri</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kese Adı</Text>
              <Text style={styles.infoValue}>{wallet?.name || 'İsimsiz'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Simge</Text>
              <Text style={styles.infoValue}>{avatar}</Text>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Varlıklar</Text>
              <Text style={styles.infoValue}>
                {wallet?.enabledAssets?.map(asset => getDisplaySymbol(asset)).join(', ') || 'Yok'}
              </Text>
            </View>
          </View>
        </View>

        {/* Adresler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Cüzdan Adresleri</Text>
          </View>

          <View style={styles.addressCard}>
            {addresses &&
              Object.entries(addresses).map(([network, address], index, array) => (
                <TouchableOpacity
                  key={network}
                  style={[
                    styles.addressRow,
                    index === array.length - 1 ? styles.addressRowLast : null,
                  ]}
                  onPress={() => handleCopyAddress(address as string, getNetworkName(network))}
                  activeOpacity={0.7}
                >
                  <View style={styles.addressContent}>
                    <Text style={styles.networkLabel}>{getNetworkName(network)}</Text>
                    <Text style={styles.addressValue}>{formatAddress(address as string)}</Text>
                  </View>
                  <Copy size={18} color={colors.primary} />
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Hakkında */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Uygulama Hakkında</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sürüm</Text>
              <Text style={styles.infoValue}>1.0.0 (KESE MVP)</Text>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Altyapı</Text>
              <Text style={styles.infoValue}>Tether WDK</Text>
            </View>
          </View>
        </View>

        {/* Tehlikeli Bölge */}
        <View style={styles.dangerSection}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Tehlikeli Bölge</Text>
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteWallet}>
            <Trash2 size={20} color={colors.white} />
            <Text style={styles.deleteButtonText}>Keseyi Sil / Sıfırla</Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            DİKKAT: Keseyi sildiğinde içindeki tüm bilgiler bu telefondan silinir. Kasa anahtarın (12 kelime) yedeğin yoksa parana bir daha ulaşamazsın.
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  addressRowLast: {
    borderBottomWidth: 0,
  },
  addressContent: {
    flex: 1,
    marginRight: 12,
  },
  networkLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'monospace', // Adresler için kod fontu
  },
  dangerSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  dangerTitle: {
    color: colors.danger,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // Kırmızının soft hali
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});