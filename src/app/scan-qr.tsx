import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router'; // router hook'u güncelledik
import { X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const qrSize = screenWidth * 0.7;

export default function ScanQRScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // Direkt router kullanıyoruz
  const { returnRoute, ...params } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = useCallback(
    ({ type, data }: { type: string; data: string }) => {
      if (scanned) return;
      setScanned(true);

      // 1. Önce JSON mu diye bak (Gün Davetiyesi Kontrolü)
      try {
        const payload = JSON.parse(data);
        if (payload.type === 'invite' && payload.roomId) {
          // Bingo! Bu bir Gün Davetiyesi
          router.replace({
            pathname: '/gold-day/join',
            params: { 
              roomId: payload.roomId, 
              roomName: payload.name,
              amount: payload.amount,
              asset: payload.asset
            }
          });
          return;
        }
      } catch (e) {
        // JSON değilse normal adrestir, devam et...
      }

      // 2. Normal Cüzdan Adresi Kontrolü
      if (!data || data.length < 10) {
        Alert.alert('Geçersiz QR', 'Okunan kod geçerli bir adres veya davetiye değil.', [
          { text: 'Tekrar Dene', onPress: () => setScanned(false) },
        ]);
        return;
      }

      // Adres ise normal para gönderme akışına devam et
      if (returnRoute) {
        router.replace({
          pathname: returnRoute as any,
          params: { scannedAddress: data, ...params },
        });
      } else {
        router.replace({
          pathname: '/send/select-token',
          params: { scannedAddress: data, ...params },
        });
      }
    },
    [scanned, router, returnRoute, params]
  );

  const handleClose = () => router.back();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <Text style={styles.centerTitle}>Kamera İzni Lazım</Text>
          <Text style={styles.centerText}>QR kodları okuyabilmek için kamerana erişmemiz gerekiyor dayı.</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>İzin Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#FF6501" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Kodu Okut</Text>
        <Text style={styles.subtitle}>Cüzdan adresi veya Gün Davetiyesi okutabilirsin.</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back" onBarcodeScanned={handleBarCodeScanned}>
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  headerSpacer: { width: 24 },
  closeButton: { padding: 4 },
  titleSection: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  cameraContainer: { flex: 1, margin: 20, borderRadius: 24, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: qrSize, height: qrSize, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.primary, borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  centerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  centerText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  permissionButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  permissionButtonText: { color: colors.black, fontSize: 16, fontWeight: 'bold' },
});