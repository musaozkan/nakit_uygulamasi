import AsyncStorage from '@react-native-async-storage/async-storage';

// KESE Konseptine Özel "Bizden" Emojiler
const avatarOptions = [
  { id: 1, emoji: '🧿', color: '#2D9CDB' }, // Nazar Boncuğu (Vazgeçilmez)
  { id: 2, emoji: '🪙', color: '#FFD700' }, // Tam Altın
  { id: 3, emoji: '🏺', color: '#D35400' }, // Küp (Eskiler küpe saklardı)
  { id: 4, emoji: '💰', color: '#27AE60' }, // Para Kesesi
  { id: 5, emoji: '👰', color: '#E91E63' }, // Düğün/Çeyiz Parası
  { id: 6, emoji: '🕋', color: '#2C3E50' }, // Hac/Umre Birikimi
  { id: 7, emoji: '🏠', color: '#8E44AD' }, // Ev Hayali
  { id: 8, emoji: '🚗', color: '#C0392B' }, // Araba Sevdası
  { id: 9, emoji: '✈️', color: '#3498DB' }, // Tatil/Gezme
  { id: 10, emoji: '🎓', color: '#34495E' }, // Okul/Torun Harçlığı
  { id: 11, emoji: '🦁', color: '#F39C12' }, // Aslan Parçası
  { id: 12, emoji: '🔒', color: '#7F8C8D' }, // Çelik Kasa
];

const STORAGE_KEY_AVATAR = 'wallet_avatar';

export const getAvatar = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY_AVATAR);
  if (stored) {
    const id = parseInt(stored);
    return avatarOptions.find(a => a.id === id) || avatarOptions[0];
  }
  return avatarOptions[0];
};

export const setAvatar = async (avatarId: number) => {
  await AsyncStorage.setItem(STORAGE_KEY_AVATAR, avatarId.toString());
};

export const clearAvatar = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY_AVATAR);
};

export default avatarOptions;