import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import Input from "../../components/ui/Input";
import { getApiBaseUrl } from "../../utils/api";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";

// @ts-ignore
import SplashLogo from "../../assets/images/splash-logo.svg";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      showErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      const response = await axios.post(`${apiUrl}/api/v1/auth/restaurant/forgot-password`, {
        email: email.trim(),
      });

      console.log("Forgot Password API Response:", response.data);

      showSuccessMessage("Password reset code sent to your email.");

      router.push({
        pathname: "/(auth)/reset-password",
        params: { email: email.trim() }
      } as any);

    } catch (error: any) {
      console.log("Forgot Password API Error:", error.response?.data || error.message);
      let errorMessage = "An unexpected error occurred.";
      const errData = error.response?.data;

      if (errData) {
        if (typeof errData === "string") {
          try {
            const parsed = JSON.parse(errData);
            errorMessage = parsed.error?.message || parsed.message || parsed.detail || errData;
          } catch {
            errorMessage = errData;
          }
        } else {
          errorMessage = errData.error?.message || errData.message || errData.detail || JSON.stringify(errData);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showErrorMessage(errorMessage);
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

          {/* Header Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Forgot Password?</Text>
            <Text style={styles.headerSubtitle}>
              Enter your email address to receive a password reset code.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Email Address"
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leadingIcon={
                <Feather name="mail" size={moderateScale(18)} color="#9CA3AF" />
              }
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRequestReset}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={"#FFFFFF"} />
              ) : (
                <Text style={styles.submitButtonText}>Send Reset Code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Remembered your password?{" "}
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
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  logoSubtitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "700",
    color: "#FA8C4C",
    marginTop: verticalScale(10),
    letterSpacing: 0.5,
  },
  headerContainer: {
    marginBottom: verticalScale(30),
  },
  headerTitle: {
    fontSize: moderateScale(32, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(10),
  },
  headerSubtitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: moderateScale(24, 0.3),
    paddingRight: scale(40),
  },
  formContainer: {
    marginBottom: verticalScale(30),
  },
  submitButton: {
    backgroundColor: "#FA8C4C",
    height: verticalScale(56),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(16),
  },
  submitButtonText: {
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
    color: "#D97706",
  },
});
