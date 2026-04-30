import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TopSnackbar from '../components/ui/TopSnackbar';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useAppStore } from '../store/useAppStore';
import { i18n, setI18nLanguage } from '../utils/i18n';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appLanguage = useAppStore((state) => state.appLanguage);

  useEffect(() => {
    void setI18nLanguage(appLanguage);
  }, [appLanguage]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: i18n.t('modal_title') }} />
        </Stack>
        <TopSnackbar />
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
