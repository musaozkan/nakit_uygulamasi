import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { GoldDayRoom, GoldDayService } from '@/services/gold-day-service';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Copy, Share2, Users, Edit2, Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QRCode } from '@tetherto/wdk-uikit-react-native';
import { toast } from 'sonner-native';

export default function LobbyScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<GoldDayRoom | null>(null);
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [editedDay, setEditedDay] = useState('');

  useEffect(() => {
    loadRoom();
  }, []);

  const loadRoom = async () => {
    if (roomId) {
      const data = await GoldDayService.getRoom(roomId);
      if (data) {
        setRoom(data);
        setEditedDay(data.meetingDay || '');
      }
    }
  };

  const handleStartDay = async () => {
    if (!room) return;
    
    Alert.alert(
      "Günü Başlat",
      "Günü başlattıktan sonra katılımcı ekleyemezsin. Sadece toplanma gününü değiştirebilirsin. Emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Başlat", 
          onPress: async () => {
            await GoldDayService.startRoom(room.id);
            await loadRoom();
            toast.success("Gün başarıyla başlatıldı!");
          }
        }
      ]
    );
  };

  const handleSaveDay = async () => {
    if (!room) return;
    await GoldDayService.updateMeetingDay(room.id, editedDay);
    await loadRoom();
    setIsEditingDay(false);
    toast.success("Toplanma günü güncellendi");
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

  const isActive = room.status === 'active';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title={isActive ? room.name : "Gününüz Başlatılmıştır"} />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* ODA BİLGİSİ */}
        <View style={styles.infoCard}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomDetail}>
            Hedef: <Text style={styles.highlight}>{room.amount} {room.asset}</Text> / {room.frequency === 'weekly' ? 'Haftalık' : 'Aylık'}
          </Text>
          
          {/* Toplanma Günü Düzenleme */}
          <View style={styles.dayContainer}>
            <Text style={styles.dayLabel}>Toplanma Günü:</Text>
            {isEditingDay ? (
              <View style={styles.editDayContainer}>
                <View style={styles.daysContainer}>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => {
                    const isSelected = editedDay === day;
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                        onPress={() => setEditedDay(day)}
                      >
                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity onPress={handleSaveDay} style={styles.saveButton}>
                  <Check size={20} color={colors.black} />
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dayRow}>
                <Text style={styles.dayValue}>{room.meetingDay}</Text>
                <TouchableOpacity onPress={() => setIsEditingDay(true)} style={styles.editIcon}>
                  <Edit2 size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* QR KOD ALANI (Sadece Lobby modunda göster) */}
        {!isActive && (
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
        )}

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

          {/* DEMO BUTONU - SADECE LOBBY MODUNDA */}
          {!isActive && (
            <TouchableOpacity style={styles.demoButton} onPress={handleSimulateJoin}>
              <Text style={styles.demoText}>+ (Demo) Katılımcı Ekle</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* BAŞLAT BUTONU (Sadece Lobby modunda) */}
      {!isActive && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartDay}>
            <Text style={styles.startButtonText}>Tamamla (Günü Başlat)</Text>
          </TouchableOpacity>
        </View>
      )}
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
  dayContainer: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  editIcon: {
    padding: 4,
  },
  editDayContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
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
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.black,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  saveButtonText: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: 14,
  },
});