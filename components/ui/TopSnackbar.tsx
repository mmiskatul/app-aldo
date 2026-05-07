import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { AppMessageType, registerAppMessageHandler } from "../../utils/feedback";

type SnackbarState = {
  title: string;
  message: string;
  type: AppMessageType;
  durationMs: number;
  presentation: "snackbar" | "modal";
};

const ICON_BY_TYPE: Record<AppMessageType, keyof typeof Feather.glyphMap> = {
  success: "check-circle",
  error: "x-circle",
  info: "info",
};

export default function TopSnackbar() {
  const insets = useSafeAreaInsets();
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const palette = useMemo(() => {
    switch (snackbar?.type) {
      case "success":
        return {
          background: "#DCFCE7",
          border: "#86EFAC",
          title: "#166534",
          message: "#166534",
          icon: "#16A34A",
        };
      case "error":
        return {
          background: "#FEE2E2",
          border: "#FCA5A5",
          title: "#991B1B",
          message: "#991B1B",
          icon: "#DC2626",
        };
      default:
        return {
          background: "#DBEAFE",
          border: "#93C5FD",
          title: "#1D4ED8",
          message: "#1E3A8A",
          icon: "#2563EB",
        };
    }
  }, [snackbar?.type]);

  useEffect(() => {
    registerAppMessageHandler((payload) => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      setSnackbar({
        title: payload.title,
        message: payload.message,
        type: payload.type,
        durationMs: payload.durationMs,
        presentation: payload.presentation,
      });
      setVisible(true);
    });

    return () => {
      registerAppMessageHandler(null);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const hideSnackbar = React.useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setSnackbar(null);
    });
  }, [opacity, translateY]);

  useEffect(() => {
    if (!visible || !snackbar) {
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    if (snackbar.presentation === "snackbar" && snackbar.durationMs > 0) {
      dismissTimerRef.current = setTimeout(() => {
        hideSnackbar();
      }, snackbar.durationMs);
    }
  }, [hideSnackbar, opacity, snackbar, translateY, visible]);

  if (!snackbar) {
    return null;
  }

  if (snackbar.presentation === "modal") {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={hideSnackbar}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: palette.background,
                borderColor: palette.border,
              },
            ]}
          >
            <TouchableOpacity style={styles.modalCloseButton} onPress={hideSnackbar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={moderateScale(18)} color={palette.message} />
            </TouchableOpacity>
            <View style={[styles.modalIconWrap, { backgroundColor: "#FFFFFF" }]}>
              <Feather
                name={ICON_BY_TYPE[snackbar.type]}
                size={moderateScale(24)}
                color={palette.icon}
              />
            </View>
            <Text style={[styles.modalTitle, { color: palette.title }]}>
              {snackbar.title}
            </Text>
            <Text style={[styles.modalMessage, { color: palette.message }]}>
              {snackbar.message}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            top: insets.top + verticalScale(8),
            transform: [{ translateY }],
            opacity,
            backgroundColor: palette.background,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: "#FFFFFF" }]}>
            <Feather
              name={ICON_BY_TYPE[snackbar.type]}
              size={moderateScale(18)}
              color={palette.icon}
            />
          </View>

          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: palette.title }]} numberOfLines={1}>
              {snackbar.title}
            </Text>
            <Text style={[styles.message, { color: palette.message }]} numberOfLines={3}>
              {snackbar.message}
            </Text>
          </View>

          <TouchableOpacity onPress={hideSnackbar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={moderateScale(18)} color={palette.message} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
  },
  container: {
    width: "92%",
    borderWidth: 1,
    borderRadius: scale(16),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  textWrap: {
    flex: 1,
    paddingRight: scale(10),
  },
  title: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "800",
    marginBottom: verticalScale(2),
  },
  message: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.3),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(24),
  },
  modalCard: {
    width: "100%",
    maxWidth: scale(340),
    borderWidth: 1,
    borderRadius: scale(18),
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(26),
    paddingBottom: verticalScale(24),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 12,
  },
  modalCloseButton: {
    position: "absolute",
    top: verticalScale(12),
    right: scale(12),
    zIndex: 2,
  },
  modalIconWrap: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },
  modalTitle: {
    fontSize: moderateScale(17, 0.3),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  modalMessage: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "500",
    lineHeight: moderateScale(20, 0.3),
    textAlign: "center",
  },
});
