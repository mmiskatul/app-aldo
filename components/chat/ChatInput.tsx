import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Voice from "@react-native-voice/voice";

interface ChatInputProps {
  onSend?: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isRecordActive, setIsRecordActive] = useState(false);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsRecordActive(true);
    Voice.onSpeechEnd = () => setIsRecordActive(false);
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        setInputText(e.value[0]);
      }
    };
    Voice.onSpeechError = (e: any) => {
      console.error("Voice framework error:", e.error);
      setIsRecordActive(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = () => {
    if (inputText.trim() && onSend) {
      onSend(inputText);
      setInputText("");
    }
  };

  const handleMicPress = async () => {
    if (isRecordActive) {
      try {
        await Voice.stop();
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
      Alert.alert("Permission Error", "Please ensure your device allows microphone access and speech recognition.");
    }
  };

  const dynamicBottomPadding = isKeyboardVisible 
    ? Platform.OS === 'android' ? keyboardHeight + verticalScale(5) : verticalScale(15)
    : verticalScale(65);

  return (
    <View style={[styles.container, { paddingBottom: dynamicBottomPadding }]}>
      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.plusButton}>
          <Feather name="plus" size={moderateScale(20)} color="#111827" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Ask AI about your restaurant business..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity 
          style={[styles.micButton, isRecordActive && styles.micButtonActive]} 
          onPress={handleMicPress}
        >
          <Feather 
            name="mic" 
            size={moderateScale(18)} 
            color={isRecordActive ? "#FFFFFF" : "#6B7280"} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Feather
            name="send"
            size={moderateScale(16)}
            color="#FFFFFF"
            style={{ marginLeft: scale(-2) }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    backgroundColor: "#FFFFFF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(10),
    paddingHorizontal: scale(3),
    paddingVertical: verticalScale(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  plusButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(13, 0.3),
    color: "#111827",
    paddingHorizontal: scale(1),
    maxHeight: verticalScale(100),
  },
  micButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(8),
  },
  micButtonActive: {
    backgroundColor: '#EF4444', // Red when actively recording
  },
  sendButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#FA8C4C",
    justifyContent: "center",
    alignItems: "center",
  },
});
