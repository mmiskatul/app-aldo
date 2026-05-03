import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Image } from 'expo-image';

interface AppLaunchSplashProps {
  onFinish: () => void;
}

export default function AppLaunchSplash({ onFinish }: AppLaunchSplashProps) {
  const scale = useRef(new Animated.Value(0.78)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  });

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 3.5,
          duration: 2000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onFinish();
      }
    });

    return () => animation.stop();
  }, [onFinish, opacity, rotate, scale]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity,
            transform: [{ scale }, { rotate: rotateInterpolate }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  logoWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: moderateScale(184),
    height: moderateScale(184),
  },
});
