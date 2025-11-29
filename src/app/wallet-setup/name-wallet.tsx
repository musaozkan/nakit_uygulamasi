import avatarOptions from '@/config/avatar-options';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { ChevronLeft, Edit3 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

const screenWidth = Dimensions.get('window').width;
// Ekran genişliğine göre 4 sütunlu bir grid için hesaplama
const avatarSize = (screenWidth - 60) / 4; 

export default function NameWalletScreen() {
  const router = useDebouncedNavigation();
  const insets = useSafeAreaInsets();
  const [walletName, setWalletName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);

  const handleNext = () => {
    const finalName = walletName.trim() || "Altın Kesem";
    router.push({
      pathname: './secure-wallet',
      params: { walletName: finalName, avatar: selectedAvatar.emoji },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kese Oluştur</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* 1. CANLI ÖNİZLEME KARTI */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>ÖNİZLEME</Text>
            <View style={styles.previewCard}>
              <View style={[styles.previewAvatar, { backgroundColor: selectedAvatar.color }]}>
                <Text style={styles.previewEmoji}>{selectedAvatar.emoji}</Text>
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewNameTitle}>KESE İSMİ</Text>
                <Text style={styles.previewNameValue} numberOfLines={1}>
                  {walletName.trim() || "Altın Kesem"}
                </Text>
              </View>
            </View>
          </View>

          {/* 2. İSİM GİRME ALANI */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Bu parayı ne için biriktiriyorsun?</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={walletName}
                onChangeText={setWalletName}
                placeholder="Örn: Düğünlük, Hac Parası..."
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />
              <Edit3 size={20} color={colors.primary} style={styles.inputIcon} />
            </View>
          </View>

          {/* 3. İKON SEÇİMİ (VITRIN IZGARA MODELİ) */}
          <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>Kesene bir süs (ikon) seç:</Text>
            
            {/* ScrollView yerine ferah bir GRID yapısı */}
            <View style={styles.avatarGrid}>
              {avatarOptions.map(avatar => {
                const isSelected = selectedAvatar.id === avatar.id;
                return (
                  <TouchableOpacity
                    key={avatar.id}
                    style={[
                      styles.avatarItem,
                      { backgroundColor: isSelected ? avatar.color : colors.cardDark },
                      isSelected && styles.selectedAvatarItem,
                    ]}
                    onPress={() => setSelectedAvatar(avatar)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ALT BUTON */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tamam, Devam Et</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 12,
    letterSpacing: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // PREVIEW SECTION
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 10,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    borderWidth: 3,
    borderColor: colors.card,
  },
  previewEmoji: {
    fontSize: 40,
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  previewNameTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  previewNameValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // INPUT SECTION
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 68,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: colors.text,
    fontWeight: '500',
  },
  inputIcon: {
    opacity: 0.8,
  },

  // AVATAR GRID SECTION (YENİLENEN KISIM)
  avatarSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // İkonları eşit aralıklarla yay
    gap: 12, // Satır ve sütun arası boşluk
  },
  avatarItem: {
    width: avatarSize, // Dinamik hesaplanan büyük boyut
    height: avatarSize,
    borderRadius: avatarSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border, // Seçili olmayanların ince çerçevesi
  },
  selectedAvatarItem: {
    borderColor: colors.primary, // SEÇİLİ OLUNCA KALIN ALTIN ÇERÇEVE
    transform: [{ scale: 1.05 }], // Hafifçe büyüsün
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  avatarEmoji: {
    fontSize: 36, // Emoji boyutu büyüdü
  },

  // FOOTER
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
  },
  nextButton: {
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
  nextButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
});