import { Redirect, Stack, useSegments } from 'expo-router';
import { getRestrictedAccessStatus, useAppStore } from '../../../store/useAppStore';

export default function SettingsLayout() {
  const segments = useSegments();
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const isRestrictedAccess = getRestrictedAccessStatus(user) !== null;
  const currentLeaf = (segments as string[])[2];

  if (!user || !tokens?.access_token) {
    return <Redirect href="/(auth)" />;
  }

  if (isRestrictedAccess && currentLeaf !== "help-center" && currentLeaf !== "restricted-access") {
    return <Redirect href="/(tabs)/settings/restricted-access" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="restricted-access" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="terms-of-service" />
      <Stack.Screen name="terms-conditions" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          animation: 'slide_from_right' 
        }} 
      />
      <Stack.Screen
        name="manage-subscription"
        options={{
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="notification-settings"
        options={{
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="tickets" 
        options={{ 
          animation: 'slide_from_right' 
        }} 
      />
      <Stack.Screen 
        name="ticket-detail" 
        options={{ 
          animation: 'slide_from_right' 
        }} 
      />
    </Stack>
  );
}
