import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PushNotificationRegistrar from '../components/app/PushNotificationRegistrar';

import TopSnackbar from '../components/ui/TopSnackbar';
import { hasActiveSubscription, useAppStore } from '../store/useAppStore';
import { i18n, setI18nLanguage, useTranslation } from '../utils/i18n';

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

function GlobalSubscriptionOverlay() {
  const router = useRouter();
  const segments = useSegments();
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);

  const isAuthenticated = Boolean(user && tokens?.access_token);
  const hasSubscription = hasActiveSubscription(user);
  const routeGroup = (segments as string[])[0];
  const routeLeaf = (segments as string[]).at(-1);
  const isSubscriptionScreen =
    (routeGroup === '(auth)' && routeLeaf === 'subscription') ||
    routeLeaf === 'success';

  if (!isAuthenticated || hasSubscription || isSubscriptionScreen) {
    return null;
  }

  const subscriptionMessageKey =
    String(user?.subscription_status || '').toLowerCase() === 'expired'
      ? 'subscription_expired_message'
      : 'subscription_canceled_message';

  return (
    <View style={styles.subscriptionOverlay} pointerEvents="auto">
      <View style={styles.subscriptionCard}>
        <Text style={styles.subscriptionTitle}>{t('subscription_status_title')}</Text>
        <Text style={styles.subscriptionSubtitle}>{t(subscriptionMessageKey as any)}</Text>
        <TouchableOpacity
          style={styles.subscriptionButton}
          onPress={() => router.push('/(auth)/subscription' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.subscriptionButtonText}>{t('purchase_subscription')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
          <GlobalSubscriptionOverlay />
          <TopSnackbar />
          <StatusBar style="dark" />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  subscriptionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1200,
    elevation: 1200,
  },
  subscriptionCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#FDE7D8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 22,
  },
  subscriptionButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FA8C4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
