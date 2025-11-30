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
  const [meetingDay, setMeetingDay] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !amount) {
      toast.error('Lütfen isim ve tutar girin');
      return;
    }

    setIsCreating(true);
    try {
      // TEST LOGIC: If name is "fail", simulate failure
      if (name.toLowerCase() === 'fail') {
        throw new Error('Simulated failure for testing');
      }

      const room = await GoldDayService.createRoom(
        name,
        selectedAsset,
        parseFloat(amount),
        frequency,
        meetingDay || (frequency === 'weekly' ? 'Pazartesi' : '1'), // Default if empty
        '0xHost' // Mock address if wallet not ready
      );

      // Navigate to lobby screen
      router.replace({
        pathname: '/gold-day/lobby',
        params: {
          roomId: room.id,
        }
      });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Oda oluşturulamadı';
      
      // Navigate to failed screen
      router.push({
        pathname: '/transaction/failed',
        params: {
          reason: errorMessage
        }
      });
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

          {/* 5. TOPLANMA GÜNÜ */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Toplanma Günü Seçin</Text>
            <View style={styles.daysContainer}>
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => {
                const isSelected = meetingDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                    onPress={() => setMeetingDay(day)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helperText}>
              Seçilen: {meetingDay ? {
                'Pzt': 'Pazartesi',
                'Sal': 'Salı',
                'Çar': 'Çarşamba',
                'Per': 'Perşembe',
                'Cum': 'Cuma',
                'Cmt': 'Cumartesi',
                'Paz': 'Pazar'
              }[meetingDay] : 'Henüz seçilmedi'}
            </Text>
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.black,
  },
});