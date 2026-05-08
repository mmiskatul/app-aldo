import { StyleSheet, View, Animated } from "react-native";
import { useEffect, useRef } from "react";

const splashImage = require("../../assets/images/image.png");

export default function StartupSplash() {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        tension: 20,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-45deg", "0deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={splashImage} 
        style={[
          styles.logo,
          { transform: [{ scale: scaleAnim }, { rotate: spin }] }
        ]} 
        resizeMode="contain" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 220,
    height: 220,
  },
});
