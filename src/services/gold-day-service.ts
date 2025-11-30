import AsyncStorage from '@react-native-async-storage/async-storage';

export type GoldDayFrequency = 'weekly' | 'monthly';

export interface Participant {
  address: string;
  nickname: string; // "Ali Dayı"
  avatarId: number;
  status: 'joined' | 'paid' | 'pending';
  joinDate: number;
}

export interface GoldDayRoom {
  id: string;
  name: string; // "Ofis Günü"
  asset: 'USDT' | 'XAUT'; // Seçilen varlık
  amount: number; // 50
  frequency: GoldDayFrequency;
  createdAt: number;
  hostAddress: string;
  participants: Participant[];
  currentRound: number;
  status: 'lobby' | 'active' | 'completed';
}

const STORAGE_KEY = 'kese_gold_days';

export const GoldDayService = {
  // Yeni oda oluştur
  async createRoom(
    name: string,
    asset: 'USDT' | 'XAUT',
    amount: number,
    frequency: GoldDayFrequency,
    hostAddress: string
  ): Promise<GoldDayRoom> {
    const newRoom: GoldDayRoom = {
      id: Date.now().toString(), // Basit ID
      name,
      asset,
      amount,
      frequency,
      createdAt: Date.now(),
      hostAddress,
      participants: [
        {
          address: hostAddress,
          nickname: 'Yönetici (Sen)',
          avatarId: 1,
          status: 'joined',
          joinDate: Date.now(),
        },
      ],
      currentRound: 1,
      status: 'lobby',
    };

    // Mevcut odaları çek ve yenisini ekle
    const existing = await this.getRooms();
    const updated = [newRoom, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return newRoom;
  },

  // Odaları listele
  async getRooms(): Promise<GoldDayRoom[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Tek oda getir
  async getRoom(id: string): Promise<GoldDayRoom | undefined> {
    const rooms = await this.getRooms();
    return rooms.find(r => r.id === id);
  },
  
  // (Demo için) Odaya sahte katılımcı ekle
  async addMockParticipant(roomId: string, name: string) {
    const rooms = await this.getRooms();
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return null;
    
    const mockUser: Participant = {
        address: `0x${Math.floor(Math.random()*1000000)}...`,
        nickname: name,
        avatarId: Math.floor(Math.random() * 5) + 1,
        status: 'joined',
        joinDate: Date.now()
    };
    
    rooms[roomIndex].participants.push(mockUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    return rooms[roomIndex];
  },

  async joinRoom(roomId: string, user: { address: string, nickname: string, avatarId: number }) {
    const rooms = await this.getRooms();
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) throw new Error("Oda bulunamadı");

    // Zaten üye mi?
    const isMember = rooms[roomIndex].participants.some(p => p.address === user.address);
    
    if (!isMember) {
      rooms[roomIndex].participants.push({
        address: user.address,
        nickname: user.nickname,
        avatarId: user.avatarId,
        status: 'joined',
        joinDate: Date.now()
      });
      
      await AsyncStorage.setItem('kese_gold_days', JSON.stringify(rooms));
    }
    
    return rooms[roomIndex];
  }
};