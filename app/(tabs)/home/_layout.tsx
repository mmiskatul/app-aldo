import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="vat"
        options={{
          headerShown: true,
          headerTitle: "VAT Overview",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#111827",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="upload-invoice"
        options={{
          headerShown: true,
          headerTitle: "Upload Invoice",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#111827",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen 
        name="data-management" 
        options={{ 
          headerShown: false,
          presentation: 'card', 
          animation: 'slide_from_right'
        }} 
      />
      <Stack.Screen 
        name="add-daily-data" 
        options={{ 
          headerShown: false,
          presentation: 'card', 
          animation: 'slide_from_right'
        }} 
      />
      <Stack.Screen 
        name="daily-record-details" 
        options={{ 
          headerShown: false,
          presentation: 'card', 
          animation: 'slide_from_right'
        }} 
      />
    </Stack>
  );
}
