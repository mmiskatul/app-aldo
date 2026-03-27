import { Stack } from 'expo-router';
import React from 'react';

export default function DocumentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="upload-invoice"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
