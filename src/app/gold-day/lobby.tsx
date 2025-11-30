import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { GoldDayRoom, GoldDayService } from '@/services/gold-day-service';
import { useLocalSearchParams } from 'expo-router';
import { Copy, Share2, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QRCode } from '@tetherto/wdk-uikit-react-native'; // WDK QR Bileşeni
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';

export default function LobbyScreen() {
  const insets = useSafeAreaInsets();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<GoldDayRoom | null>(null);

  useEffect(() => {
    loadRoom();
  }, []);

  const loadRoom = async () => {
    if (roomId) {
      const data = await GoldDayService.getRoom(roomId);
      if (data) setRoom(data);
    }
  };

  // Demo için: Ekrana dokunarak sahte kullanıcı ekle
  const handleSimulateJoin = async () => {
    if(!room) return;
    const names = ["Ayşe Teyze", "Mehmet Amca", "Fatma Yenge"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    await GoldDayService.addMockParticipant(room.id, randomName);
    loadRoom(); // Yenile
    toast.success(`${randomName} katıldı!`);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(`kese://join/${roomId}`);
    toast.success('Davet linki kopyalandı');
  };

  if (!room) return <View style={styles.container}><Header title="Yükleniyor..." /></View>;

  // QR Payload (JSON formatında güvenli veri)
  const qrPayload = JSON.stringify({
    type: 'invite',
    roomId: room.id,
    name: room.name,
    amount: room.amount,
    asset: room.asset
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Bekleme Salonu" />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* ODA BİLGİSİ */}
        <View style={styles.infoCard}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomDetail}>
            Hedef: <Text style={styles.highlight}>{room.amount} {room.asset}</Text> / {room.frequency === 'weekly' ? 'Haftalık' : 'Aylık'}
          </Text>
        </View>

        {/* QR KOD ALANI */}
        <View style={styles.qrSection}>
          <View style={styles.qrWrapper}>
            <QRCode 
                value={qrPayload} 
                size={220} 
                color={colors.black} 
                backgroundColor={colors.white}
            />
          </View>
          <Text style={styles.qrHint}>Arkadaşın bu kodu okutarak katılabilir</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopyLink}>
              <Copy size={20} color={colors.primary} />
              <Text style={styles.actionText}>Link Kopyala</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Share2 size={20} color={colors.primary} />
              <Text style={styles.actionText}>Paylaş</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KATILIMCI LİSTESİ */}
        <View style={styles.participantsSection}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Katılanlar ({room.participants.length})</Text>
          </View>

          {room.participants.map((p, index) => (
            <View key={index} style={styles.participantRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.nickname.charAt(0)}</Text>
              </View>
              <View style={styles.pInfo}>
                <Text style={styles.pName}>{p.nickname} {index === 0 && '(Sen)'}</Text>
                <Text style={styles.pAddress}>{p.address.slice(0, 6)}...{p.address.slice(-4)}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Onaylı</Text>
              </View>
            </View>
          ))}

          {/* DEMO BUTONU - SADECE GELİŞTİRME İÇİN */}
          <TouchableOpacity style={styles.demoButton} onPress={handleSimulateJoin}>
            <Text style={styles.demoText}>+ (Demo) Katılımcı Ekle</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* BAŞLAT BUTONU */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Herkes Tamam, Günü Başlat</Text>
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
    paddingBottom: 100,
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  roomDetail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  highlight: {
    color: colors.text,
    fontWeight: 'bold',
  },
  qrSection: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
  },
  qrHint: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  participantsSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tintedBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pInfo: {
    flex: 1,
  },
  pName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  pAddress: {
    color: colors.textTertiary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  badge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#2ECC71',
    fontSize: 10,
    fontWeight: 'bold',
  },
  demoButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 10,
  },
  demoText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.card,
  },
  startButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
});