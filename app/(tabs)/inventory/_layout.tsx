import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="add-item"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
