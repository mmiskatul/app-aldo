import { useRouter } from "expo-router";
import React, { useState } from "react";
import axios from "axios";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import OTPVerification from "../../components/ui/OTPVerification";

// @ts-ignore
import SecurityIcon from "../../assets/images/Security Icon.svg";
import { useAppStore } from "../../store/useAppStore";
import { getApiBaseUrl } from "../../utils/api";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const pendingRegistration = useAppStore((state) => state.pendingRegistration);
  const clearPendingRegistration = useAppStore((state) => state.setPendingRegistration);
  
  const [code, setCode] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const email = pendingRegistration?.email;
  const apiUrl = getApiBaseUrl();

  const getApiErrorMessage = (error: any, fallback: string) =>
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    fallback;

  const handleResendCode = async () => {
    if (!pendingRegistration) {
      showErrorMessage("Missing registration details. Please restart the signup process.");
      return;
    }
    
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/restaurant/register`, pendingRegistration);
      console.log("Resend API Response:", response.data);
      showSuccessMessage(response.data?.message || "Verification code resent to your email.");
    } catch (error: any) {
      console.log("Resend API Error:", error.response?.data || error.message);
      showErrorMessage(getApiErrorMessage(error, "An unexpected error occurred."));
    }
  };

  const handleConfirm = async () => {
    const otp = code.join("");
    if (otp.length !== 4) {
      showErrorMessage("Please enter the 4-digit code.");
      return;
    }

    if (!email) {
      showErrorMessage("Email not found. Please try signing up again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/auth/restaurant/verify-registration`,
        {
          email,
          code: otp,
        }
      );

      const data = response.data;
      setUser(data.user, data.tokens);
      clearPendingRegistration(null);

      showSuccessMessage("Email verified successfully!");
      router.replace("/(auth)/subscription" as any);
      
    } catch (error: any) {
      console.log("Verify API Error:", error.response?.data || error.message);
      const errorMessage = getApiErrorMessage(
        error,
        "An unexpected error occurred during verification."
      );
      showErrorMessage(errorMessage, "Verification Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Top Section */}
            <View style={styles.topSection}>
              <View style={styles.iconContainer}>
                <SecurityIcon width={scale(80)} height={scale(80)} />
              </View>

              <Text style={styles.headerTitle}>Verify Identity</Text>
              <Text style={styles.headerSubtitle}>
                Enter the 4-digit code sent to your email
              </Text>

              {/* OTP Component */}
              <OTPVerification code={code} setCode={setCode} onResend={handleResendCode} />
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={"#FFFFFF"} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: "space-between",
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(40),
  },
  topSection: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: verticalScale(24),
  },
  headerTitle: {
    fontSize: moderateScale(26, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(12),
  },
  headerSubtitle: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "400",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: verticalScale(40),
  },
  bottomSection: {
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "#FA8C4C",
    height: verticalScale(56),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  confirmButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  didNotReceiveButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(10),
  },
  didNotReceiveText: {
    fontSize: moderateScale(14, 0.3),
    color: "#4B5563",
    fontWeight: "500",
  },
});
