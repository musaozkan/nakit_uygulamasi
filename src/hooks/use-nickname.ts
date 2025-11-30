import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

const STORAGE_KEY_NICKNAME = 'kese_user_nickname';

// Hafızadan okuma
export const getStoredNickname = async () => {
  return await AsyncStorage.getItem(STORAGE_KEY_NICKNAME);
};

// Hafızaya yazma
export const setStoredNickname = async (name: string) => {
  await AsyncStorage.setItem(STORAGE_KEY_NICKNAME, name);
};

// React Hook'u (Ekranlarda kullanmak için)
export function useNickname() {
  const { wallet } = useWallet();
  const [nickname, setNickname] = useState<string>('');

  const loadNickname = async () => {
    try {
      const stored = await getStoredNickname();
      // Eğer kayıtlı isim varsa onu kullan, yoksa cüzdan ismini, o da yoksa "İsimsiz"
      setNickname(stored || wallet?.name || 'İsimsiz Kese');
    } catch (e) {
      console.error('İsim yüklenemedi', e);
    }
  };

  // Ekran her odaklandığında ismi tazele (Güncel kalsın)
  useFocusEffect(
    useCallback(() => {
      loadNickname();
    }, [wallet?.name])
  );

  const saveNickname = async (newName: string) => {
    if (!newName.trim()) return;
    try {
      await setStoredNickname(newName.trim());
      setNickname(newName.trim());
    } catch (e) {
      console.error('İsim kaydedilemedi', e);
    }
  };

  return { nickname, saveNickname };
}