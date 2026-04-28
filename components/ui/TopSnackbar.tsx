import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { AppMessageType, registerAppMessageHandler } from "../../utils/feedback";

type SnackbarState = {
  title: string;
  message: string;
  type: AppMessageType;
  durationMs: number;
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

    dismissTimerRef.current = setTimeout(() => {
      hideSnackbar();
    }, snackbar.durationMs);
  }, [hideSnackbar, opacity, snackbar, translateY, visible]);

  if (!snackbar) {
    return null;
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
});
