import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="edit-profile" 
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
