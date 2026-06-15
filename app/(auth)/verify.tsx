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
import { getApiBaseUrl, getApiErrorMessage } from "../../utils/api";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";
import { useTranslation } from "../../utils/i18n";

export default function VerifyIdentityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setUser = useAppStore((state) => state.setUser);
  const pendingRegistration = useAppStore((state) => state.pendingRegistration);
  const clearPendingRegistration = useAppStore((state) => state.setPendingRegistration);
  
  const [code, setCode] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const email = pendingRegistration?.email;
  const apiUrl = getApiBaseUrl();

  const handleResendCode = async () => {
    if (!email) {
      showErrorMessage(t("missing_email_restart_signup"));
      return false;
    }
    
    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/restaurant/resend-verification`, {
        email,
      });
      showSuccessMessage(
        response.data?.debug_verification_code
          ? `Verification code: ${response.data.debug_verification_code}`
          : response.data?.message || t("verification_code_resent")
      );
      setCode(["", "", "", ""]);
      return true;
    } catch (error: any) {
      showErrorMessage(getApiErrorMessage(error, t("unexpected_error")));
      return false;
    }
  };

  const handleConfirm = async () => {
    const otp = code.join("");
    if (otp.length !== 4) {
      showErrorMessage(t("enter_4_digit_code"));
      return;
    }

    if (!email) {
      showErrorMessage(t("email_not_found_signup_again"));
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

      showSuccessMessage(t("email_verified_successfully"));
      router.replace("/(auth)/subscription" as any);
      
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(
        error,
        t("verify_unexpected_error")
      );
      showErrorMessage(errorMessage, t("verification_failed"));
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

              <Text style={styles.headerTitle}>{t("verify_identity")}</Text>
              <Text style={styles.headerSubtitle}>{t("verify_identity_subtitle")}</Text>

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
                <Text style={styles.confirmButtonText}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {isLoading ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FA8C4C" />
            <Text style={styles.loadingText}>{t("verifying")}</Text>
          </View>
        </View>
      ) : null}
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
    minWidth: scale(180),
    paddingHorizontal: scale(20),
  },
  loadingText: {
    marginTop: verticalScale(14),
    fontSize: moderateScale(20, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
