import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { GoldDayRoom, GoldDayService } from '@/services/gold-day-service';
import { useFocusEffect } from 'expo-router';
import { ChevronRight, Users } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GoldDayListScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const [rooms, setRooms] = useState<GoldDayRoom[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [])
  );

  const loadRooms = async () => {
    const data = await GoldDayService.getRooms();
    setRooms(data);
  };

  const handlePressRoom = (roomId: string) => {
    router.push({
      pathname: '/gold-day/lobby',
      params: { roomId },
    });
  };

  const renderItem = ({ item }: { item: GoldDayRoom }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePressRoom(item.id)}>
      <View style={styles.cardHeader}>
        <Text style={styles.roomName}>{item.name}</Text>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusLobby]}>
          <Text style={[styles.statusText, item.status === 'active' ? styles.textActive : styles.textLobby]}>
            {item.status === 'active' ? `${item.currentRound}/${item.participants.length}` : 'Bekliyor'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.amount}>
            {item.amount} {item.asset}
          </Text>
          <Text style={styles.frequency}>
            {item.frequency === 'weekly' ? 'Haftalık' : 'Aylık'}
          </Text>
        </View>

        <View style={styles.participantsRow}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={styles.participantsText}>
            {item.participants.length} Katılımcı
          </Text>
        </View>
      </View>

      <ChevronRight size={20} color={colors.textTertiary} style={styles.arrow} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Günlerim" />

      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz bir güne katılmadın.</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/gold-day/create')}
            >
              <Text style={styles.createButtonText}>Yeni Gün Başlat</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusLobby: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  statusActive: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textLobby: {
    color: '#F1C40F',
  },
  textActive: {
    color: '#2ECC71',
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  frequency: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  arrow: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
