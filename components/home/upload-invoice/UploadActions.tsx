import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import ImagePickerModal from '../../../components/ui/ImagePickerModal';
import { showErrorMessage } from '../../../utils/feedback';
import { buildFileName, inferMimeType, isImageFile } from '../../../utils/fileMetadata';

interface UploadActionsProps {
  onFileSelected: (file: {uri: string, type: 'image' | 'pdf', name: string, mimeType: string} | null) => void;
}

export default function UploadActions({ onFileSelected }: UploadActionsProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const mimeType = inferMimeType(asset.name || asset.uri, asset.mimeType);
        onFileSelected({
          uri: asset.uri,
          type: isImageFile(asset.name || asset.uri, mimeType) ? 'image' : 'pdf',
          name: buildFileName(asset.name, asset.uri, 'invoice-file', mimeType),
          mimeType,
        });
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const openCamera = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showErrorMessage('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const mimeType = inferMimeType(asset.fileName || asset.uri, (asset as any).mimeType);
      onFileSelected({
        uri: asset.uri,
        type: 'image',
        name: buildFileName(asset.fileName, asset.uri, 'photo', mimeType),
        mimeType,
      });
    }
  };

  const openGallery = async () => {
    setModalVisible(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const mimeType = inferMimeType(asset.fileName || asset.uri, (asset as any).mimeType);
      onFileSelected({
        uri: asset.uri,
        type: 'image',
        name: buildFileName(asset.fileName, asset.uri, 'image', mimeType),
        mimeType,
      });
    }
  };

  return (
    <>
      <View style={styles.actionCardsRow}>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
          <Feather name="camera" size={moderateScale(24)} color="#FA8C4C" style={styles.actionIcon} />
          <Text style={styles.actionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={pickDocument}>
          <Feather name="file-text" size={moderateScale(24)} color="#FA8C4C" style={styles.actionIcon} />
          <Text style={styles.actionText}>Upload File</Text>
        </TouchableOpacity>
      </View>

      <ImagePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCameraSelect={openCamera}
        onGallerySelect={openGallery}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    alignItems: 'center',
    paddingVertical: verticalScale(24),
    marginHorizontal: scale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    marginBottom: verticalScale(12),
  },
  actionText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#374151',
  },
});
