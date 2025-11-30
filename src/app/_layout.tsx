import { DarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { WalletProvider, WDKService } from '@tetherto/wdk-react-native-provider';
import { ThemeProvider } from '@tetherto/wdk-uikit-react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { CHAINS_CONFIG } from "../config/chains";
import { Toaster } from 'sonner-native';
import { colors } from '@/constants/colors';
import { KeseWalletProvider } from '@/providers/KeseWalletProvider';
import { pricingService } from '@/services/pricing-service';

SplashScreen.preventAutoHideAsync();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
  },
};

export default function RootLayout() {
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Initializing services...');

        // Initialize WDK Service
        await WDKService.initialize();
        console.log('✅ WDK Service initialized');

        // Initialize Pricing Service
        await pricingService.initialize();
        console.log('✅ Pricing Service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize services:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        defaultMode="dark"
        brandConfig={{
          primaryColor: colors.primary,
        }}
      >
        <WalletProvider
          config={{
            indexer: {
              apiKey: process.env.EXPO_PUBLIC_WDK_INDEXER_API_KEY!,
              url: process.env.EXPO_PUBLIC_WDK_INDEXER_BASE_URL!,
            },
            chains: CHAINS_CONFIG,
            enableCaching: true,
          }}
        >
          <KeseWalletProvider>
            <NavigationThemeProvider value={CustomDarkTheme}>
              <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                  }}
                />
                <StatusBar style="light" />
              </View>
            </NavigationThemeProvider>
          </KeseWalletProvider>
        </WalletProvider>
        <Toaster
          offset={90}
          toastOptions={{
            style: {
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            },
            titleStyle: { color: colors.text },
            descriptionStyle: { color: colors.text },
          }}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
