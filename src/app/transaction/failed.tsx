import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransactionFailedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const reason = params.reason as string;

  const handleHomePress = () => {
    // Navigate back to wallet (dashboard)
    router.dismissAll();
    router.replace('/wallet');
  };

  const handleRetryPress = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <XCircle size={80} color={colors.danger} />
        </View>
        
        <Text style={styles.title}>İşlem Başarısız</Text>
        
        <Text style={styles.subtitle}>
          {reason || 'Bir hata oluştu. Lütfen tekrar deneyin.'}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={handleRetryPress}>
          <Text style={[styles.buttonText, styles.retryButtonText]}>Tekrar Dene</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleHomePress}>
          <Text style={styles.buttonText}>Ana Sayfa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryButtonText: {
    color: colors.text,
  },
});
