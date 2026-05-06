import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import apiClient from "../../api/apiClient";
import { useAppStore } from "../../store/useAppStore";
import { showErrorMessage } from "../../utils/feedback";
import { normalizeAppLanguage, useTranslation } from "../../utils/i18n";

interface ChatInputProps {
  onSend?: (text: string, file?: any) => void;
}

const WAVEFORM_BAR_COUNT = 22;
const WAVEFORM_IDLE_LEVEL = 0.08;

const getVoiceFileName = (uri: string) => {
  const fallback = `voice-message-${Date.now()}.m4a`;
  const name = uri.split("/").pop();
  if (!name?.includes(".")) {
    return fallback;
  }

  const extension = name.split(".").pop()?.toLowerCase();
  return extension === "m4a" ? name : fallback;
};

const getVoiceErrorMessage = (error: any) => {
  const apiMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.detail;
  if (apiMessage) {
    return String(apiMessage);
  }
  return error?.message || "Could not transcribe voice message.";
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const appLanguage = useAppStore((state) => state.appLanguage);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0.2);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isStartingRecordingRef = useRef(false);
  const isStoppingRecordingRef = useRef(false);
  const waveformLevelsRef = useRef(Array.from({ length: WAVEFORM_BAR_COUNT }, () => WAVEFORM_IDLE_LEVEL));
  const waveformValuesRef = useRef(
    Array.from({ length: WAVEFORM_BAR_COUNT }, () => new Animated.Value(WAVEFORM_IDLE_LEVEL))
  );

  useEffect(() => {
    return () => {
      const recording = recordingRef.current;
      recordingRef.current = null;
      if (recording) {
        void recording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const resetWaveform = (animated = true) => {
    waveformLevelsRef.current = Array.from({ length: WAVEFORM_BAR_COUNT }, () => WAVEFORM_IDLE_LEVEL);
    waveformValuesRef.current.forEach((value) => {
      if (!animated) {
        value.setValue(WAVEFORM_IDLE_LEVEL);
        return;
      }

      Animated.timing(value, {
        toValue: WAVEFORM_IDLE_LEVEL,
        duration: 120,
        useNativeDriver: false,
      }).start();
    });
  };

  const updateWaveform = (level: number, animated = true) => {
    const normalizedLevel = Math.max(WAVEFORM_IDLE_LEVEL, Math.min(1, level));
    const nextLevels = [...waveformLevelsRef.current.slice(1), normalizedLevel];
    waveformLevelsRef.current = nextLevels;

    waveformValuesRef.current.forEach((value, index) => {
      const targetValue = nextLevels[index];
      if (!animated) {
        value.setValue(targetValue);
        return;
      }

      Animated.timing(value, {
        toValue: targetValue,
        duration: 90,
        useNativeDriver: false,
      }).start();
    });
  };

  const startRecording = async () => {
    if (isRecording || isTranscribing || isStartingRecordingRef.current || isStoppingRecordingRef.current) {
      return;
    }

    isStartingRecordingRef.current = true;
    let recording: Audio.Recording | null = null;

    try {
      const previousRecording = recordingRef.current;
      recordingRef.current = null;
      if (previousRecording) {
        await previousRecording.stopAndUnloadAsync().catch(() => undefined);
      }

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        showErrorMessage("Microphone permission is required for voice input.", "Voice Input");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      recording = new Audio.Recording();
      recordingRef.current = recording;
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: ".m4a",
        },
        isMeteringEnabled: true,
      } as Audio.RecordingOptions);
      recording.setProgressUpdateInterval(90);
      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;
        const metering = typeof status.metering === "number" ? status.metering : -60;
        const normalizedLevel = Math.max(WAVEFORM_IDLE_LEVEL, Math.min(1, (metering + 60) / 55));
        setVoiceLevel(normalizedLevel);
        updateWaveform(normalizedLevel);
      });

      await recording.startAsync();
      setIsRecording(true);
      resetWaveform(false);
    } catch (error: any) {
      if (recordingRef.current === recording) {
        recordingRef.current = null;
      }
      if (recording) {
        await recording.stopAndUnloadAsync().catch(() => undefined);
      }
      showErrorMessage(error?.message || "Could not start voice recording.", "Voice Input");
      setIsRecording(false);
      resetWaveform();
    } finally {
      isStartingRecordingRef.current = false;
    }
  };

  const transcribeRecording = async (uri: string) => {
    const formData = new FormData();
    formData.append("language", normalizeAppLanguage(appLanguage));
    formData.append("file", {
      uri,
      name: getVoiceFileName(uri),
      type: "audio/m4a",
    } as any);

    const response = await apiClient.post("/api/v1/restaurant/chat/voice-transcription", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60_000,
    });
    return String(response.data?.text || "").trim();
  };

  const stopRecording = async (sendAfterTranscription = false) => {
    if (isStoppingRecordingRef.current) return;

    const recording = recordingRef.current;
    if (!recording) return;

    isStoppingRecordingRef.current = true;
    recordingRef.current = null;
    setIsRecording(false);
    setIsTranscribing(true);
    setVoiceLevel(0.2);
    resetWaveform();

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("No voice recording was captured.");
      }

      const transcript = await transcribeRecording(uri);
      if (!transcript) {
        throw new Error("No speech was detected. Please try again.");
      }

      setInputText(transcript);
      if (sendAfterTranscription && onSend) {
        onSend(transcript, selectedFile);
        setInputText("");
        setSelectedFile(null);
      }
    } catch (error: any) {
      showErrorMessage(getVoiceErrorMessage(error), "Voice Input");
    } finally {
      isStoppingRecordingRef.current = false;
      setIsTranscribing(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      }).catch(() => undefined);
    }
  };

  const handleVoicePress = async () => {
    if (isTranscribing) return;
    if (isRecording) {
      await stopRecording(true);
      return;
    }
    await startRecording();
  };

  const handleSend = () => {
    if (isRecording) {
      void stopRecording(true);
      return;
    }

    if ((inputText.trim() || selectedFile) && onSend) {
      const messageText = inputText.trim() || "Please review the attached document.";
      onSend(messageText, selectedFile);
      setInputText("");
      setSelectedFile(null);
    }
  };

  const handlePickDocument = async () => {
    setShowAttachmentMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (e) {
      console.error("Error picking document:", e);
    }
  };

  const handlePickImage = async (useCamera: boolean) => {
    setShowAttachmentMenu(false);
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      };

      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const assetWithMime = asset as ImagePicker.ImagePickerAsset & { mimeType?: string };
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || asset.uri.split("/").pop() || "image.jpg",
          mimeType: assetWithMime.mimeType || "image/jpeg",
          size: asset.fileSize,
        });
      }
    } catch (e) {
      console.error("Error picking image:", e);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, verticalScale(12)) },
      ]}
    >
      {selectedFile && (
        <View style={styles.attachmentPreviewContainer}>
          {selectedFile.mimeType?.startsWith("image/") || selectedFile.name?.match(/\.(jpg|jpeg|png)$/i) ? (
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
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => setShowAttachmentMenu(true)}
          disabled={isRecording || isTranscribing}
          accessibilityRole="button"
          accessibilityLabel="Attach file"
        >
          <Feather name="plus" size={moderateScale(18)} color="#6B7280" />
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, (isRecording || isTranscribing) && styles.textInputListening]}
          placeholder={isRecording ? "Recording..." : isTranscribing ? "Transcribing voice..." : t("chat_placeholder")}
          placeholderTextColor="#9CA3AF"
          multiline
          value={inputText}
          onChangeText={setInputText}
          editable={!isTranscribing}
        />

        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
          onPress={handleVoicePress}
          disabled={isTranscribing}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? "Stop voice input" : "Start voice input"}
        >
          <Feather
            name={isRecording ? "mic-off" : "mic"}
            size={moderateScale(17)}
            color={isRecording ? "#FFFFFF" : "#6B7280"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isTranscribing}>
          <Feather
            name="send"
            size={moderateScale(16)}
            color="#FFFFFF"
            style={{ marginLeft: scale(-2) }}
          />
        </TouchableOpacity>
      </View>

      {(isRecording || isTranscribing) && (
        <View style={styles.voiceFrame}>
          <View style={styles.voiceFrameHeader}>
            <View style={styles.voiceFrameIcon}>
              <Feather name={isTranscribing ? "loader" : "mic"} size={moderateScale(14)} color="#EF4444" />
            </View>
            <Text style={styles.listeningText}>
              {isTranscribing ? "Converting voice to text..." : "Recording voice..."}
            </Text>
          </View>

          <View style={styles.waveform} accessibilityLabel="Voice frequency indicator">
            {waveformValuesRef.current.map((value, index) => {
              const height = value.interpolate({
                inputRange: [0, 1],
                outputRange: [verticalScale(4), verticalScale(42)],
              });

              return (
                <Animated.View
                  key={`voice-bar-${index}`}
                  style={[
                    styles.waveformBar,
                    {
                      height,
                      opacity: 0.35 + voiceLevel * 0.65,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      )}

      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAttachmentMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t("choose_attachment") || "Choose Attachment"}</Text>

                <View style={styles.modalOptions}>
                  <TouchableOpacity style={styles.modalOption} onPress={() => handlePickImage(true)}>
                    <View style={[styles.iconContainer, { backgroundColor: "#F0F9FF" }]}>
                      <Feather name="camera" size={moderateScale(24)} color="#0EA5E9" />
                    </View>
                    <Text style={styles.modalOptionText}>{t("camera") || "Camera"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modalOption} onPress={() => handlePickImage(false)}>
                    <View style={[styles.iconContainer, { backgroundColor: "#FFF7ED" }]}>
                      <Feather name="image" size={moderateScale(24)} color="#FA8C4C" />
                    </View>
                    <Text style={styles.modalOptionText}>{t("gallery") || "Gallery"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.modalOption} onPress={handlePickDocument}>
                    <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                      <Feather name="file-text" size={moderateScale(24)} color="#4B5563" />
                    </View>
                    <Text style={styles.modalOptionText}>{t("document") || "Document"}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAttachmentMenu(false)}>
                  <Text style={styles.cancelButtonText}>{t("cancel") || "Cancel"}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
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
  attachmentPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: scale(8),
    borderRadius: scale(8),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: scale(10),
  },
  attachmentName: {
    fontSize: moderateScale(12, 0.3),
    color: "#374151",
    fontWeight: "500",
  },
  removeAttachment: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale(10),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(13, 0.3),
    color: "#111827",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(10),
    maxHeight: verticalScale(100),
  },
  attachButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale(2),
  },
  textInputListening: {
    color: "#111827",
    fontWeight: "600",
  },
  voiceButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(6),
  },
  voiceButtonActive: {
    backgroundColor: "#EF4444",
  },
  sendButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#FA8C4C",
    justifyContent: "center",
    alignItems: "center",
  },
  voiceFrame: {
    marginTop: verticalScale(8),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFF7F7",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  voiceFrameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  voiceFrameIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(8),
  },
  waveform: {
    height: verticalScale(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(8),
    borderRadius: scale(8),
    backgroundColor: "#FFFFFF",
  },
  waveformBar: {
    width: scale(4),
    borderRadius: scale(2),
    backgroundColor: "#EF4444",
    marginHorizontal: scale(1.7),
  },
  listeningText: {
    flex: 1,
    fontSize: moderateScale(12, 0.3),
    color: "#EF4444",
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    padding: scale(24),
    paddingBottom: verticalScale(40),
  },
  modalTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(24),
    textAlign: "center",
  },
  modalOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: verticalScale(32),
  },
  modalOption: {
    alignItems: "center",
  },
  iconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  modalOptionText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "500",
    color: "#374151",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "600",
    color: "#374151",
  },
});
