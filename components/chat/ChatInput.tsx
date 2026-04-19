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
import * as DocumentPicker from "expo-document-picker";
import { Image, Text } from "react-native";
interface ChatInputProps {
  onSend?: (text: string, file?: any) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    if ((inputText.trim() || selectedFile) && onSend) {
      onSend(inputText, selectedFile);
      setInputText("");
      setSelectedFile(null);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "text/csv"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (e) {
      console.error("Error picking document:", e);
    }
  };



  const dynamicBottomPadding = isKeyboardVisible 
    ? Platform.OS === 'android' ? keyboardHeight + verticalScale(5) : verticalScale(15)
    : verticalScale(65);

  return (
    <View style={[styles.container, { paddingBottom: dynamicBottomPadding }]}>
      {selectedFile && (
        <View style={styles.attachmentPreviewContainer}>
          {selectedFile.mimeType?.startsWith('image/') || selectedFile.name?.match(/\.(jpg|jpeg|png)$/i) ? (
            <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.fileIconPreview}>
              <Feather name="file" size={moderateScale(24)} color="#FA8C4C" />
            </View>
          )}
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName} numberOfLines={1}>{selectedFile.name}</Text>
          </View>
          <TouchableOpacity style={styles.removeAttachment} onPress={() => setSelectedFile(null)}>
            <Feather name="x" size={moderateScale(12)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.plusButton} onPress={handlePickFile}>
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
  attachmentPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: scale(8),
    borderRadius: scale(8),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewImage: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: scale(6),
  },
  fileIconPreview: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: scale(6),
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: scale(10),
  },
  attachmentName: {
    fontSize: moderateScale(12, 0.3),
    color: '#374151',
    fontWeight: '500',
  },
  removeAttachment: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(13, 0.3),
    color: "#111827",
    paddingHorizontal: scale(1),
    maxHeight: verticalScale(100),
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
