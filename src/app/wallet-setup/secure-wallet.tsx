import { SeedPhrase } from '@/components/SeedPhrase';
import { WDKService } from '@tetherto/wdk-react-native-provider';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { AlertCircle, ChevronLeft, Copy, Eye, EyeOff, Key } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { colors } from '@/constants/colors';
import getErrorMessage from '@/utils/get-error-message';

export default function SecureWalletScreen() {
  const router = useDebouncedNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    walletName?: string;
    avatar?: string;
  }>();
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [showPhrase, setShowPhrase] = useState(true); 
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateMnemonic();
  }, []);

  const generateMnemonic = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const prf = await getUniqueId();
      const mnemonicString = await WDKService.createSeed({ prf });

      if (!mnemonicString) throw new Error('Anahtar oluşturulamadı');
      const words = mnemonicString.split(' ');
      setMnemonic(words);
    } catch (error) {
      console.error('Seed hatası', error);
      setError('Kasa anahtarı oluşturulamadı. Tekrar deneyin.');
      setMnemonic([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPhrase = async () => {
    const phraseText = mnemonic.join(' ');
    await Clipboard.setStringAsync(phraseText);
    toast.success('Anahtar kopyalandı! Bir yere yapıştırın.');
  };

  const handleNext = () => {
    Alert.alert(
      "Anahtarı Kaydettin mi?",
      "Bak bu anahtarı kaybedersen altınların gider. Bir kağıda yazdın mı?",
      [
        { text: "Dur, Yazmadım", style: "cancel" },
        { 
          text: "Yazdım, Devam Et", 
          onPress: () => {
            router.push({
              pathname: './confirm-phrase',
              params: {
                mnemonic: mnemonic.join(','),
                walletName: params.walletName,
                avatar: params.avatar,
              },
            });
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.primary} />
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconHeader}>
           <Key size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Kasa Anahtarın Hazır</Text>
        
        {/* İŞTE BURAYI DÜZELTTİK - BOLD YAPIYORUZ */}
        <Text style={styles.subtitle}>
          Aşağıdaki 12 kelime senin{' '}
          <Text style={styles.boldText}>Altın Kasanın Anahtarıdır</Text>. 
          Bu kelimeleri bir kağıda yaz ve kimsenin bulamayacağı bir yere (mesela yastık altına) sakla.
        </Text>

        <View style={styles.warningBox}>
          <AlertCircle size={24} color={colors.black} style={{marginRight: 10}} />
          <Text style={styles.warningText}>
            DİKKAT: Bu kelimeleri kaybedersen, biz bile paranı kurtaramayız. Sorumluluk sende!
          </Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={generateMnemonic} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.seedContainer}>
                <SeedPhrase
                words={mnemonic}
                editable={false}
                isLoading={isGenerating}
                hidden={!showPhrase}
                />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCopyPhrase}>
                <Copy size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>Kopyala</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.nextButton, (error || mnemonic.length === 0) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={error !== null || mnemonic.length === 0}
        >
          <Text style={styles.nextButtonText}>Anahtarı Yazdım, Devam Et</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24, // Satır aralığını biraz açtım, daha rahat okunsun
  },
  // YENİ EKLENEN STİL:
  boldText: {
    fontWeight: 'bold',
    color: colors.primary, // Rengi de sarı yapalım, iyice patlasın
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    color: colors.black,
    fontSize: 15,
    fontWeight: 'bold',
  },
  seedContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tintedBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.card,
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text,
  }
});