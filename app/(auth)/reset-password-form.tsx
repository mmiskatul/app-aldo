import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// @ts-ignore
import SplashLogo from "../../assets/images/splash-logo.svg";

export default function ResetPasswordFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !code) {
      Alert.alert("Error", "Verification details are missing. Please restart the reset process.");
      router.replace("/(auth)/forgot-password" as any);
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = getApiBaseUrl();
      const response = await axios.post(`${apiUrl}/api/v1/auth/restaurant/reset-password`, {
        email,
        code,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      Alert.alert(
        "Success",
        response.data?.message || "Restaurant account password reset successful",
        [{ text: "OK", onPress: () => router.replace("/(auth)" as any) }]
      );
    } catch (error: any) {
      console.log("Reset Password API Error:", error.response?.data || error.message);
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
          errorMessage =
            errData.error?.message || errData.message || errData.detail || JSON.stringify(errData);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
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
          <View style={styles.logoContainer}>
            <SplashLogo width={scale(120)} height={scale(120)} />
            <Text style={styles.logoSubtitle}>AI POWERED RESTAURANT INTELLIGENCE</Text>
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Create New Password</Text>
            <Text style={styles.headerSubtitle}>
              Your code is ready. Enter and confirm your new password to complete the reset.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="New Password"
              placeholder="********"
              isPassword
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
              value={newPassword}
              onChangeText={setNewPassword}
              leadingIcon={<Feather name="lock" size={moderateScale(18)} color="#9CA3AF" />}
            />

            <Input
              label="Confirm New Password"
              placeholder="********"
              isPassword
              isPasswordVisible={isConfirmPasswordVisible}
              onTogglePasswordVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leadingIcon={<Feather name="shield" size={moderateScale(18)} color="#9CA3AF" />}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Need a different code?{" "}
              <Text style={styles.footerHighlight} onPress={() => router.back()}>
                Go back
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
    marginBottom: verticalScale(20),
  },
  logoSubtitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "700",
    color: "#FA8C4C",
    marginTop: verticalScale(10),
    letterSpacing: 0.5,
  },
  headerContainer: {
    marginBottom: verticalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(32, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(10),
  },
  headerSubtitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: moderateScale(22, 0.3),
    paddingRight: scale(20),
  },
  formContainer: {
    marginBottom: verticalScale(20),
  },
  submitButton: {
    backgroundColor: "#FA8C4C",
    height: verticalScale(56),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(10),
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
