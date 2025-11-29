import { View, StyleSheet, Text } from 'react-native';
import { useEffect } from 'react';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnBoardingWelcome } from '@/components/onboarding/onboarding-welcome';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/constants/colors';

export default function OnBoardingScreen() {
  const router = useDebouncedNavigation();
  const insets = useSafeAreaInsets();

  const handleCreateWallet = () => {
    // İsim sorma ekranına gider
    router.push('/wallet-setup/name-wallet');
  };

  const handleImportWallet = () => {
    // Import ekranına gider
    router.push('/wallet-setup/import-wallet');
  };

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnBoardingWelcome
        // BAŞLIKLARI DEĞİŞTİRDİK:
        title="KESE'ne Hoşgeldin"
        subtitle="Altınlarını yastık altında değil, dijital kesende sakla. Hem güvenli, hem her an yanında."
        actionButtons={[
          {
            id: 1,
            // "Create Wallet" YERİNE:
            title: 'Yeni Kese Aç', 
            iconName: 'wallet',
            variant: 'filled',
            onPress: handleCreateWallet,
          },
          {
            id: 2,
            // "Import Wallet" YERİNE:
            title: "Eski Kesemi Getir", 
            iconName: 'download',
            variant: 'tinted',
            onPress: handleImportWallet,
          },
        ]}
      />
      
      {/* GÜVEN MESAJI */}
      <View style={styles.trustFooter}>
        <Text style={styles.trustText}>🔒 Devlet güvencesi gibi şifreli kasa sistemi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  trustFooter: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  trustText: {
    color: colors.textSecondary,
    fontSize: 12,
    opacity: 0.7
  }
});