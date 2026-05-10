import { Redirect, Stack, useSegments } from "expo-router";
import { hasCompletedOnboarding } from "../../api/auth";
import StartupSplash from "../../components/app/StartupSplash";
import { getRestrictedAccessStatus, hasActiveSubscription, useAppStore } from "../../store/useAppStore";

export default function AuthLayout() {
  const segments = useSegments();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const currentLeaf = (segments as string[])[1];
  const isAuthSession = Boolean(user && tokens?.access_token);

  if (!hasHydrated) {
    return <StartupSplash />;
  }

  if (isAuthSession) {
    if (getRestrictedAccessStatus(user) !== null) {
      return <Redirect href="/(tabs)/settings/restricted-access" />;
    }
    if (hasActiveSubscription(user) && !hasCompletedOnboarding(user) && currentLeaf !== "setup") {
      return <Redirect href="/(auth)/setup" />;
    }
    if (hasActiveSubscription(user) && hasCompletedOnboarding(user) && currentLeaf !== "subscription") {
      return <Redirect href="/(tabs)/home" />;
    }
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="subscription-status" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password-form" options={{ headerShown: false }} />
    </Stack>
  );
}
