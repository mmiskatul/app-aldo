import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PushNotificationRegistrar from '../components/app/PushNotificationRegistrar';

import TopSnackbar from '../components/ui/TopSnackbar';
import { useAppStore } from '../store/useAppStore';
import { i18n, setI18nLanguage } from '../utils/i18n';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);
void SystemUI.setBackgroundColorAsync("#FFFFFF").catch(() => undefined);

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFFFFF",
  },
};

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const appLanguage = useAppStore((state) => state.appLanguage);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  useEffect(() => {
    void setI18nLanguage(appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    if (hasHydrated) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [hasHydrated]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: "#FFFFFF" } }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: i18n.t('modal_title') }} />
          </Stack>
          <PushNotificationRegistrar />
          <TopSnackbar />
          <StatusBar style="dark" />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
