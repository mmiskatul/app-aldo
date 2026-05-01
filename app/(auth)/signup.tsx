import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import axios from "axios";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// @ts-ignore
import SplashLogo from "../../assets/images/splash-logo.svg";
import Input from "../../components/ui/Input";
import { useAppStore } from "../../store/useAppStore";
import { getApiBaseUrl } from "../../utils/api";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";

const getApiErrorMessage = (error: any, fallback: string) => {
  const errData = error.response?.data;
  if (!errData) {
    return error.message || fallback;
  }
  if (typeof errData === "string") {
    return errData;
  }
  return errData.error?.message || errData.message || errData.detail || fallback;
};

export default function AuthSignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setPendingRegistration = useAppStore((state) => state.setPendingRegistration);

  const [restaurantName, setRestaurantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!restaurantName || !ownerName || !email || !password) {
      showErrorMessage("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      showErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const normalizedPayload = {
        restaurant_name: restaurantName.trim(),
        owner_full_name: ownerName.trim(),
        email: email.trim().toLowerCase(),
        password,
      };
      const apiUrl = getApiBaseUrl();
      const response = await axios.post(
        `${apiUrl}/api/v1/auth/restaurant/register`,
        normalizedPayload
      );

      const data = response.data;
      console.log("Signup API Response:", data);
      setPendingRegistration(normalizedPayload);

      showSuccessMessage(data.message || "Account created successfully.");
      router.push("/(auth)/verify" as any);
      
    } catch (error: any) {
      console.log("Signup API Error:", error.response?.data || error.message);
      const errorMessage = getApiErrorMessage(
        error,
        "An unexpected error occurred during signup."
      );

      if (
        error.response?.data?.error?.code === "conflict" ||
        errorMessage === "An account with this email already exists"
      ) {
        showErrorMessage("An account with this email already exists.");
      } else {
        showErrorMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, verticalScale(20)),
              paddingBottom: Math.max(insets.bottom, verticalScale(20)),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <SplashLogo width={scale(120)} height={scale(120)} />
            <Text style={styles.logoSubtitle}>
              AI POWERED RESTAURANT INTELLIGENCE
            </Text>
          </View>

          {/* Hero Image Block */}
          <View style={styles.heroContainer}>
            <ImageBackground
              source={require("../../assets/images/signup-hero.png")}
              style={styles.heroImage}
              imageStyle={{ borderRadius: scale(16) }}
            >
              {/* <View style={styles.heroOverlay}>
                <Text style={styles.heroText}>Elevate your dining experience with data.</Text>
              </View> */}
            </ImageBackground>
          </View>

          {/* Header Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Create Your Account</Text>
            <Text style={styles.headerSubtitle}>
              Start managing your restaurant data with AI-powered insights.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Restaurant Name"
              placeholder="e.g. The Golden Bistro"
              value={restaurantName}
              onChangeText={setRestaurantName}
              leadingIcon={
                <Feather name="home" size={moderateScale(18)} color="#9CA3AF" />
              }
            />

            <Input
              label="Owner Full Name"
              placeholder="John Doe"
              value={ownerName}
              onChangeText={setOwnerName}
              leadingIcon={
                <Feather name="user" size={moderateScale(18)} color="#9CA3AF" />
              }
            />

            <Input
              label="Email Address"
              placeholder="owner@restaurant.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leadingIcon={
                <Feather name="mail" size={moderateScale(18)} color="#9CA3AF" />
              }
            />

            <Input
              label="Password"
              placeholder="••••••••"
              isPassword
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={() =>
                setIsPasswordVisible(!isPasswordVisible)
              }
              value={password}
              onChangeText={setPassword}
              leadingIcon={
                <Feather name="lock" size={moderateScale(18)} color="#9CA3AF" />
              }
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              isPassword
              isPasswordVisible={isConfirmPasswordVisible}
              onTogglePasswordVisibility={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leadingIcon={
                <Feather
                  name="shield"
                  size={moderateScale(18)}
                  color="#9CA3AF"
                />
              } // Alternative lock/shield icon
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={"#FFFFFF"} />
              ) : (
                <Text style={styles.createButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text
                style={styles.footerHighlight}
                onPress={() => router.back()}
              >
                Login
              </Text>
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {isLoading ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FA8C4C" />
            <Text style={styles.loadingText}>Creating account...</Text>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  logoSubtitle: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "700",
    color: "#FA8C4C",
    marginTop: verticalScale(4),
    letterSpacing: 0.5,
  },
  heroContainer: {
    width: "100%",
    height: verticalScale(100),
    marginBottom: verticalScale(24),
    borderRadius: scale(16),
  },
  heroImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: scale(16),
    padding: scale(16),
    justifyContent: "flex-end",
  },
  heroText: {
    color: "#FFFFFF",
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    width: "70%",
  },
  headerContainer: {
    marginBottom: verticalScale(24),
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  headerSubtitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: moderateScale(22, 0.3),
    textAlign: "center",
    paddingHorizontal: scale(10),
  },
  formContainer: {
    marginBottom: verticalScale(24),
  },
  createButton: {
    backgroundColor: "#FA8C4C",
    height: verticalScale(56),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(10),
  },
  createButtonText: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footerContainer: {
    alignItems: "center",
    paddingBottom: verticalScale(20),
  },
  footerText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "500",
    color: "#6B7280",
  },
  footerHighlight: {
    fontWeight: "700",
    color: "#FA8C4C",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: scale(200),
    paddingHorizontal: scale(20),
  },
  loadingText: {
    marginTop: verticalScale(14),
    fontSize: moderateScale(20, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
