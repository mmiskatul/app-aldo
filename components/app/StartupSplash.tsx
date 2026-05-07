import { Image, StyleSheet, View } from "react-native";

const splashImage = require("../../assets/images/image.png");

export default function StartupSplash() {
  return (
    <View style={styles.container}>
      <Image source={splashImage} style={styles.logo} resizeMode="contain" />
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
