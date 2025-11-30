import { CommonActions, useNavigation } from '@react-navigation/native';
import { useWallet } from '@/providers/KeseWalletProvider';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { CheckCircle2, PartyPopper } from 'lucide-react-native'; // Kutlama ikonu

export default function CompleteScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ walletName: string; mnemonic: string }>();
  const { createWallet, isLoading } = useWallet();
  const [walletCreated, setWalletCreated] = useState(false);

  useEffect(() => {
    // Ekran açılınca otomatik oluşturmaya başla
    createWalletWithWDK();
  }, []);

  const createWalletWithWDK = async () => {
    if (walletCreated) return;

    try {
      const walletName = params.walletName || 'Altın Kesem';
      // Mnemonic virgüle göre ayrılmış gelebilir, boşlukla birleştiriyoruz
      const mnemonic = params.mnemonic ? params.mnemonic.split(',').join(' ') : '';

      if (mnemonic) {
        await createWallet({
          name: walletName,
          mnemonic,
        });
        setWalletCreated(true);
      }
    } catch (error) {
      console.error('Kese oluşturulamadı:', error);
      Alert.alert(
        'Bir Sorun Çıktı',
        'Kese oluşturulurken hata oldu. İnternetini kontrol et tekrar dene.',
        [{ text: 'Tekrar Dene', onPress: () => createWalletWithWDK() }]
      );
    }
  };

  const handleGoToWallet = () => {
    if (!walletCreated) return;

    // Geçmişi sil, direkt Cüzdan ana sayfasına at
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'wallet' }],
      })
    );
  };

  const isProcessing = !walletCreated || isLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <View style={styles.content}>
        {/* İKON ALANI (Animasyonlu gibi dursa yeter) */}
        <View style={styles.iconContainer}>
          {isProcessing ? (
            <View style={styles.loadingCircle}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.successCircle}>
              <PartyPopper size={64} color={colors.black} />
            </View>
          )}
        </View>

        {/* BAŞLIK VE AÇIKLAMA */}
        <Text style={styles.title}>
          {isProcessing ? 'Kese Hazırlanıyor...' : 'Hayırlı Olsun! 🧿'}
        </Text>

        <Text style={styles.subtitle}>
          {isProcessing
            ? 'Senin için sağlam, şifreli ve güvenli dijital kasanı oluşturuyoruz. Birkaç saniye sürer...'
            : 'Kesen başarıyla açıldı. Artık altınlarını güvenle saklayabilir, eşe dosta gönderebilirsin. Bereketli olsun.'}
        </Text>

      </View>

      {/* BUTON */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={handleGoToWallet}
          disabled={isProcessing}
        >
          <Text style={[styles.buttonText, isProcessing && styles.buttonTextDisabled]}>
            {isProcessing ? 'Lütfen Bekle...' : 'Keseyi Aç'}
          </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  loadingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary, // Altın sarısı zemin
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  button: {
    backgroundColor: colors.primary,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  buttonDisabled: {
    backgroundColor: colors.card,
    shadowOpacity: 0,
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
});