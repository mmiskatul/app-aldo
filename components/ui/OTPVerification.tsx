import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface OTPVerificationProps {
  code: string[];
  setCode: (code: string[]) => void;
  initialTimeLeft?: number;
  onResend?: () => Promise<boolean | void> | boolean | void;
}

export default function OTPVerification({
  code,
  setCode,
  initialTimeLeft = 45,
  onResend,
}: OTPVerificationProps) {
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [isResending, setIsResending] = useState(false);

  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow digits
    const cleanText = text.replace(/[^0-9]/g, "");

    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    // Auto-advance
    if (cleanText.length > 0 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  return (
    <View style={styles.container}>
      {/* OTP Inputs */}
      <View style={styles.otpContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            style={[
              styles.otpInput,
              code[index] !== "" ? styles.otpInputActive : null,
            ]}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Resend Timer */}
      <View style={styles.resendContainer}>
        {timeLeft > 0 ? (
          <>
            <Feather name="clock" size={moderateScale(14)} color="#4B5563" />
            <Text style={styles.resendText}>Resend code in</Text>
            <Text style={styles.resendTimer}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </Text>
          </>
        ) : (
          <TouchableOpacity
            disabled={isResending}
            onPress={async () => {
              if (!onResend) {
                setTimeLeft(initialTimeLeft);
                return;
              }

              setIsResending(true);
              try {
                const result = await onResend();
                if (result !== false) {
                  setTimeLeft(initialTimeLeft);
                }
              } finally {
                setIsResending(false);
              }
            }}
          >
            <Text
              style={[
                styles.resendText,
                { color: isResending ? "#9CA3AF" : "#FA8C4C", fontWeight: "600", marginLeft: 0 },
              ]}
            >
              {isResending ? "Resending..." : "Resend code now"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(12),
    marginBottom: verticalScale(24),
  },
  otpInput: {
    width: scale(60),
    height: verticalScale(60),
    backgroundColor: "#FFF1E8",
    borderRadius: scale(16),
    fontSize: moderateScale(24, 0.3),
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  otpInputActive: {
    borderColor: "#FA8C4C",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: {
    fontSize: moderateScale(14, 0.3),
    color: "#4B5563",
    marginLeft: scale(6),
    marginRight: scale(6),
  },
  resendTimer: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
});
