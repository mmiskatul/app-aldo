import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "../../utils/i18n";
interface ChatInputProps {
  onSend?: (text: string, file?: any) => void;
}
interface ChatInputProps {
  onSend?: (text: string, file?: any) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const handleSend = () => {
    if ((inputText.trim() || selectedFile) && onSend) {
      onSend(inputText, selectedFile);
      setInputText("");
      setSelectedFile(null);
    }
  };

  const handlePickDocument = async () => {
    setShowAttachmentMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/csv"],
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
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
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

        <TextInput
          style={styles.textInput}
          placeholder={t('chat_placeholder')}
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
                <Text style={styles.modalTitle}>{t('choose_attachment') || 'Choose Attachment'}</Text>
                
                <View style={styles.modalOptions}>
                  <TouchableOpacity 
                    style={styles.modalOption} 
                    onPress={() => handlePickImage(true)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: '#F0F9FF' }]}>
                      <Feather name="camera" size={moderateScale(24)} color="#0EA5E9" />
                    </View>
                    <Text style={styles.modalOptionText}>{t('camera') || 'Camera'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalOption} 
                    onPress={() => handlePickImage(false)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: '#FFF7ED' }]}>
                      <Feather name="image" size={moderateScale(24)} color="#FA8C4C" />
                    </View>
                    <Text style={styles.modalOptionText}>{t('gallery') || 'Gallery'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalOption} 
                    onPress={handlePickDocument}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
                      <Feather name="file-text" size={moderateScale(24)} color="#4B5563" />
                    </View>
                    <Text style={styles.modalOptionText}>{t('document') || 'Document'}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAttachmentMenu(false)}>
                  <Text style={styles.cancelButtonText}>{t('cancel') || 'Cancel'}</Text>
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
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(10),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    padding: scale(24),
    paddingBottom: verticalScale(40),
  },
  modalTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(24),
    textAlign: 'center',
  },
  modalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(32),
  },
  modalOption: {
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  modalOptionText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '500',
    color: '#374151',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '600',
    color: '#374151',
  },
});
