import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { useWallet } from '@/providers/KeseWalletProvider';
import { useLocalSearchParams } from 'expo-router';
import { Check, ChevronRight, Gift } from 'lucide-react-native';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function AttachJewelryScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { wallet } = useWallet();
  const { scannedAddress } = useLocalSearchParams<{ scannedAddress: string }>();

  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<'USDT' | 'XAUT'>('XAUT');
  const [note, setNote] = useState('');

  const handleNext = () => {
    if (!amount) {
      toast.error('Lütfen bir tutar girin');
      return;
    }

    // Normal gönderim akışına yönlendir, ancak parametrelerle
    router.push({
      pathname: '/send/details',
      params: {
        token: selectedAsset,
        address: scannedAddress,
        amount: amount,
        note: note || 'Düğün Hediyesi 💍', // Varsayılan not
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Takı Tak" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Gift size={48} color={colors.primary} />
          </View>

          <Text style={styles.title}>Ne Takmak İstersin?</Text>
          <Text style={styles.subtitle}>
            Düğün sahibine iletmek istediğin hediyeyi seç.
          </Text>

          {/* Adres Bilgisi */}
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Alıcı Adresi:</Text>
            <Text style={styles.addressValue}>
              {scannedAddress
                ? `${scannedAddress.slice(0, 10)}...${scannedAddress.slice(-10)}`
                : 'Adres Yok'}
            </Text>
          </View>

          {/* VARLIK SEÇİMİ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hediye Türü</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.optionCard, selectedAsset === 'XAUT' && styles.optionSelected]}
                onPress={() => setSelectedAsset('XAUT')}
              >
                <Text style={styles.optionEmoji}>🪙</Text>
                <Text style={[styles.optionTitle, selectedAsset === 'XAUT' && styles.textSelected]}>Altın (XAUT)</Text>
                {selectedAsset === 'XAUT' && <View style={styles.checkIcon}><Check size={16} color={colors.black} /></View>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, selectedAsset === 'USDT' && styles.optionSelected]}
                onPress={() => setSelectedAsset('USDT')}
              >
                <Text style={styles.optionEmoji}>💵</Text>
                <Text style={[styles.optionTitle, selectedAsset === 'USDT' && styles.textSelected]}>Dolar (USDT)</Text>
                {selectedAsset === 'USDT' && <View style={styles.checkIcon}><Check size={16} color={colors.black} /></View>}
              </TouchableOpacity>
            </View>
          </View>

          {/* TUTAR */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Miktar ({selectedAsset})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => {
                // Allow only numbers, dots and commas
                const cleaned = text.replace(/[^0-9.,]/g, '');

                // Replace comma with dot
                const normalized = cleaned.replace(',', '.');

                // Prevent multiple dots
                const parts = normalized.split('.');
                if (parts.length > 2) {
                  return; // Ignore input if more than one dot
                }

                setAmount(normalized);
              }}
            />
            <Text style={styles.helperText}>
              {selectedAsset === 'XAUT' ? 'Örn: 0.25 (Çeyrek Altın)' : 'Örn: 100 USDT'}
            </Text>
          </View>

          {/* NOT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notun Var mı?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mutluluklar dilerim..."
              placeholderTextColor={colors.textTertiary}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Devam Et</Text>
          <ChevronRight size={20} color={colors.black} />
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
    padding: 20,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  addressContainer: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  addressValue: {
    color: colors.text,
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  textSelected: {
    color: colors.primary,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 2,
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.card,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
});
