import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

// @ts-ignore
import SplashLogo from '../assets/images/splash-logo.svg';

function AnimatedSplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    // Hide native splash screen once our animated component is ready
    SplashScreen.hideAsync().catch(() => {});

    // Start animation
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });

    // After animation delay, complete and transition to the main app
    const timeout = setTimeout(() => {
      // Fade out the whole splash screen
      opacity.value = withTiming(0, { duration: 400 }, () => {
        // onAnimationComplete can safely trigger a state update
      });
      setTimeout(() => {
        onAnimationComplete();
      }, 400); 
    }, 2500); 
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Animated.View style={[styles.splashLogo, animatedStyle]}>
        <SplashLogo width="100%" height="100%" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  splashLogo: {
    width: 250,
    height: 250,
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);

  if (!appReady) {
    return <AnimatedSplashScreen onAnimationComplete={() => setAppReady(true)} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
