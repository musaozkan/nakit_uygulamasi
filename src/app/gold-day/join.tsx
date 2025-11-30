import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { GoldDayService } from '@/services/gold-day-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Users, Edit3 } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { toast } from 'sonner-native';
import { useNickname } from '@/hooks/use-nickname'; // İsim servisimizi çağırdık

export default function JoinGoldDayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallet } = useWallet();
  
  const params = useLocalSearchParams();
  const { roomId, roomName, amount, asset } = params as { 
    roomId: string; 
    roomName: string; 
    amount: string;
    asset: string;
  };

  const [isJoining, setIsJoining] = useState(false);
  const [entryName, setEntryName] = useState('');
  const { nickname, saveNickname } = useNickname();

  const handleJoin = async () => {
    if (!wallet) return;
    if (!entryName.trim()) {
      toast.error("Lütfen bir isim gir dayı");
      return;
    }

    setIsJoining(true);

    try {
      // 1. Önce ismi hafızaya kaydet (Güncelle)
      if (entryName !== nickname) {
        await saveNickname(entryName);
      }

      // 2. Odaya bu isimle katıl
      await GoldDayService.joinRoom(roomId, {
        address: wallet.address,
        nickname: entryName, // <-- Kullanıcının girdiği isim
        avatarId: 1 
      });

      toast.success('Hayırlı olsun, güne katıldın!');
      
      // router.replace({
      //   pathname: '/gold-day/lobby',
      //   params: { roomId }
      // });

      // Navigate to success screen
      router.replace({
        pathname: '/transaction/success',
        params: {
          amount: amount,
          symbol: asset,
          // We don't have a txHash here since it's an API call, but we can show a success message
        }
      });

    } catch (error) {
      console.error(error);
      toast.error('Katılma başarısız oldu');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Davetiye Var!" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Users size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>Güne Davet Edildin</Text>
          <Text style={styles.subtitle}>
            Aşağıdaki gruba katılmak üzeresin.
          </Text>

          {/* ODA BİLGİ KARTI */}
          <View style={styles.card}>
            <Text style={styles.roomLabel}>GÜN ADI</Text>
            <Text style={styles.roomName}>{roomName}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomLabel}>KATKI PAYI</Text>
                <Text style={styles.roomValue}>{amount} {asset}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomLabel}>DURUM</Text>
                <Text style={styles.roomValue}>Onay Bekliyor</Text>
              </View>
            </View>
          </View>

          {/* İSİM GİRME ALANI (YENİ EKLENDİ) */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Grupta Görünecek Adın</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={entryName}
                onChangeText={setEntryName}
                placeholder="Adın ne olsun?"
                placeholderTextColor={colors.textTertiary}
              />
              <Edit3 size={20} color={colors.primary} style={{ opacity: 0.8 }} />
            </View>
            <Text style={styles.inputHint}>Bu ismi listedeki herkes görecek.</Text>
          </View>

          <View style={styles.infoBox}>
            <CheckCircle2 size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Cüzdan adresin de güvenlik için grupla paylaşılacak.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.joinButton} 
          onPress={handleJoin}
          disabled={isJoining}
        >
          <Text style={styles.joinButtonText}>
            {isJoining ? 'Katılınıyor...' : 'Onayla ve Katıl'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          disabled={isJoining}
        >
          <Text style={styles.cancelButtonText}>Vazgeç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, alignItems: 'center' },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  
  card: {
    width: '100%', backgroundColor: colors.card, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 24
  },
  roomLabel: { fontSize: 12, color: colors.textTertiary, marginBottom: 4, fontWeight: '600' },
  roomName: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  roomValue: { fontSize: 16, color: colors.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  row: { flexDirection: 'row' },

  // INPUT STYLES
  inputSection: { width: '100%', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: colors.primary
  },
  input: { flex: 1, fontSize: 18, color: colors.text, fontWeight: '500' },
  inputHint: { fontSize: 12, color: colors.textTertiary, marginTop: 6, marginLeft: 4 },

  infoBox: { flexDirection: 'row', marginTop: 10, gap: 12, paddingHorizontal: 12 },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  
  footer: { padding: 20 },
  joinButton: {
    backgroundColor: colors.primary, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  joinButtonText: { fontSize: 18, fontWeight: 'bold', color: colors.black },
  cancelButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
});