import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { GoldDayService } from '@/services/gold-day-service';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { Check, ChevronRight } from 'lucide-react-native';
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

export default function CreateGoldDayScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { wallet } = useWallet();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<'USDT' | 'XAUT'>('XAUT');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !amount) {
      toast.error('Lütfen isim ve tutar girin');
      return;
    }

    setIsCreating(true);
    try {
      const room = await GoldDayService.createRoom(
        name,
        selectedAsset,
        parseFloat(amount),
        frequency,
        '0xHost' // Mock address if wallet not ready
      );

      // Lobiye yönlendir
      router.replace({
        pathname: '/gold-day/lobby',
        params: { roomId: room.id },
      });
    } catch (error) {
      console.error(error);
      toast.error('Oda oluşturulamadı');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Gün Başlat" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Yeni Altın Günü</Text>
          <Text style={styles.subtitle}>Kuralları belirle, QR kodunu oluştur ve arkadaşlarını davet et.</Text>

          {/* 1. İSİM */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gün İsmi</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Ofis Tayfa, Kuzenler..."
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 2. VARLIK SEÇİMİ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Neyle Toplanacak?</Text>
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

          {/* 3. TUTAR */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kişi Başı Tutar ({selectedAsset})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Text style={styles.helperText}>
              {selectedAsset === 'XAUT' ? 'Örn: 0.25 (Çeyrek Altın)' : 'Örn: 100 USDT'}
            </Text>
          </View>

          {/* 4. SIKLIK */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ne Sıklıkla?</Text>
            <View style={styles.frequencyContainer}>
              {['weekly', 'monthly'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[styles.freqButton, frequency === freq && styles.freqButtonSelected]}
                  onPress={() => setFrequency(freq as any)}
                >
                  <Text style={[styles.freqText, frequency === freq && styles.freqTextSelected]}>
                    {freq === 'weekly' ? 'Haftalık' : 'Aylık'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={isCreating}>
          <Text style={styles.createButtonText}>
            {isCreating ? 'Oluşturuluyor...' : 'Odayı Kur ve QR Oluştur'}
          </Text>
          {!isCreating && <ChevronRight size={20} color={colors.black} />}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
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
  frequencyContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  freqButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  freqButtonSelected: {
    backgroundColor: colors.primary,
  },
  freqText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  freqTextSelected: {
    color: colors.black,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.card,
  },
  createButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
});