import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import apiClient from "../../api/apiClient";
import { hasCompletedOnboarding } from "../../api/auth";
import AuthLanguageSelector from "../../components/auth/AuthLanguageSelector";
import Input from "../../components/ui/Input";
import { getRestrictedAccessStatus, useAppStore } from "../../store/useAppStore";
import { getApiErrorMessage } from "../../utils/api";
import { showErrorMessage } from "../../utils/feedback";
import { useTranslation } from "../../utils/i18n";

// @ts-ignore
import SplashLogo from "../../assets/images/splash-logo.svg";

export default function AuthLoginScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      showErrorMessage(t("required_fields_no_period"));
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        "[login] POST",
        `${apiClient.defaults.baseURL || ""}/api/v1/auth/restaurant/login`
      );
      const response = await apiClient.post(
        "/api/v1/auth/restaurant/login",
        { email: normalizedEmail, password }
      );

      const data = response.data;

      console.log("Login API Response:", JSON.stringify(data, null, 2));

      // Save user and tokens to store
      setUser(data.user, data.tokens);

      if (getRestrictedAccessStatus(data.user) !== null) {
        router.replace("/(tabs)/settings/restricted-access" as any);
      } else if (!hasCompletedOnboarding(data.user)) {
        router.replace("/(auth)/setup" as any);
      } else {
        // Navigate to the tabs flow
        router.replace("/(tabs)/home" as any);
      }
    } catch (error: any) {
      console.log("Login API Error:", error.response?.data || error.message);

      const errorMessage = getApiErrorMessage(
        error,
        t("login_failed_fallback")
      );
      showErrorMessage(errorMessage, t("login_failed"));
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
          <View style={styles.languageSelector}>
            <AuthLanguageSelector />
          </View>

          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <SplashLogo width={scale(120)} height={scale(120)} />
            <Text style={styles.logoSubtitle}>
              {t("auth_logo_subtitle")}
            </Text>
          </View>

          {/* Header Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{t("login_title")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("login_subtitle")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label={t("email_address")}
              placeholder={t("email_login_placeholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label={t("password")}
              placeholder={t("enter_password")}
              isPassword
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={() =>
                setIsPasswordVisible(!isPasswordVisible)
              }
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={() => router.push("/(auth)/forgot-password" as any)}
            >
              <Text style={styles.forgotPasswordText}>{t("forgot_password")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={"#FFFFFF"} />
              ) : (
                <Text style={styles.loginButtonText}>{t("login_button")}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {t("dont_have_account")}{" "}
              <Text
                style={styles.footerHighlight}
                onPress={() => router.push("/(auth)/signup" as any)}
              >
                {t("signup_link")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {isLoading ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FA8C4C" />
            <Text style={styles.loadingText}>{t("login_loading")}</Text>
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
  languageSelector: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(8),
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(24),
  },
  forgotPasswordText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "600",
    color: "#FA8C4C",
  },
  loginButton: {
    backgroundColor: "#FA8C4C",
    height: verticalScale(56),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
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
