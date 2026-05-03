import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PushNotificationRegistrar from '../components/app/PushNotificationRegistrar';
import AppLaunchSplash from '../components/ui/AppLaunchSplash';
import TopSnackbar from '../components/ui/TopSnackbar';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useAppStore } from '../store/useAppStore';
import { i18n, setI18nLanguage } from '../utils/i18n';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appLanguage = useAppStore((state) => state.appLanguage);
  const [showLaunchSplash, setShowLaunchSplash] = useState(true);

  useEffect(() => {
    void setI18nLanguage(appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const handleLaunchSplashFinish = useCallback(() => {
    setShowLaunchSplash(false);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: i18n.t('modal_title') }} />
          </Stack>
          <PushNotificationRegistrar />
          <TopSnackbar />
          <StatusBar style="dark" />
          {showLaunchSplash ? <AppLaunchSplash onFinish={handleLaunchSplashFinish} /> : null}
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
