import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, ChevronLeft, HelpCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function ConfirmPhraseScreen() {
  const router = useDebouncedNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    mnemonic?: string;
    walletName?: string;
    avatar?: string;
  }>();
  
  const [question, setQuestion] = useState<{
    index: number;       // Sorulan sıra (Örn: 3)
    correctWord: string; // Doğru cevap
    options: string[];   // Şıklar
  } | null>(null);

  useEffect(() => {
    if (params.mnemonic) {
      const words = params.mnemonic.split(',');
      
      // Rastgele bir sıra seç (1 ile 12 arası)
      const randomIndex = Math.floor(Math.random() * 12); 
      const correctWord = words[randomIndex];

      // Yanıltıcı kelime havuzu (Basit kelimeler)
      const fakeWordsPool = [
        'elma', 'masa', 'kalem', 'deniz', 'mavi', 'kapi', 'duvar', 'cicek', 
        'kitap', 'yol', 'ev', 'araba', 'gunes', 'ay', 'yildiz'
      ];
      
      // Havuzdan rastgele 2 tane yanlış cevap seç
      const distractors = fakeWordsPool
        .filter(w => w !== correctWord) // Doğru cevapla aynı olmasın
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      // Şıkları karıştır (Doğru + Yanlışlar)
      const options = [correctWord, ...distractors].sort(() => 0.5 - Math.random());

      setQuestion({
        index: randomIndex + 1, // Kullanıcıya 1'den başlayarak göster (0. index 1. sıradır)
        correctWord,
        options
      });
    }
  }, [params.mnemonic]);

  const handleAnswer = (selectedWord: string) => {
    if (!question) return;

    if (selectedWord === question.correctWord) {
      // DOĞRU BİLDİ -> Temsili bir başarı efekti ve geçiş
      Alert.alert(
        "Tebrikler! 🎉",
        "Anahtarı doğru kaydetmişsin. Kesen açılıyor...",
        [{ 
          text: "Kese'ye Gir", 
          onPress: () => {
            router.push({
              pathname: './complete',
              params: {
                walletName: params.walletName,
                avatar: params.avatar,
                mnemonic: params.mnemonic,
              },
            });
          }
        }]
      );
    } else {
      // YANLIŞ BİLDİ
      Alert.alert(
        "Olmadı Dayı!",
        `Kağıdına iyi bak. Biz senden ${question.index}. sıradaki kelimeyi istedik. Tekrar dene.`,
        [{ text: "Tamam Tekrar Bakayım" }]
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.primary} />
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* İkon */}
        <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
                <HelpCircle size={48} color={colors.black} />
            </View>
        </View>

        <Text style={styles.title}>Küçük Bir Kontrol</Text>
        <Text style={styles.subtitle}>
            Kağıda yazdığın anahtara bak ve şu soruyu cevapla:
        </Text>

        {question && (
          <View style={styles.card}>
            <Text style={styles.questionText}>
              <Text style={styles.highlightNumber}>{question.index}. Sıradaki </Text>
              kelime hangisi?
            </Text>

            <View style={styles.optionsGrid}>
              {question.options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionButton}
                  onPress={() => handleAnswer(option)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option}</Text>
                  {/* Seçim yapıldığında yanına tik koymak yerine direkt işlem yapıyoruz, daha basit */}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.hintBox}>
            <CheckCircle2 size={20} color={colors.textSecondary} />
            <Text style={styles.hintText}>
                Merak etme, sadece doğru yazdığından emin olmak istiyoruz.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  questionText: {
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  highlightNumber: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 26,
  },
  optionsGrid: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.background, // Kartın içinde koyu zemin
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  optionText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    opacity: 0.7,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
});