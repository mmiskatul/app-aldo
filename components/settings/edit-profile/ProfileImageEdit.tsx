import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PhotoPickerModal from '../../ui/PhotoPickerModal';
import { showErrorMessage } from '../../../utils/feedback';
import { buildFileName, inferMimeType } from '../../../utils/fileMetadata';
import { useTranslation } from '../../../utils/i18n';

export type ProfileImageFile = {
  uri: string;
  name: string;
  mimeType: string;
};

interface ProfileImageEditProps {
  profileImageUrl?: string | null;
  onImageChange?: (file: ProfileImageFile) => void;
}

export default function ProfileImageEdit({ profileImageUrl, onImageChange }: ProfileImageEditProps) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(profileImageUrl || null);
  const hasProfileImage = !!localImageUri;

  React.useEffect(() => {
    setLocalImageUri(profileImageUrl || null);
  }, [profileImageUrl]);

  const handleCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        showErrorMessage(t('camera_permission_required'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const mimeType = inferMimeType(asset.fileName || asset.uri, (asset as any).mimeType);
        setLocalImageUri(asset.uri);
        onImageChange?.({
          uri: asset.uri,
          name: buildFileName(asset.fileName, asset.uri, 'profile-photo', mimeType),
          mimeType,
        });
      }
    } catch (error) {
      console.log("Error selecting camera photo:", error);
      showErrorMessage(t('image_capture_failed'));
    }
  };

  const handleGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showErrorMessage(t('gallery_permission_required'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const mimeType = inferMimeType(asset.fileName || asset.uri, (asset as any).mimeType);
        setLocalImageUri(asset.uri);
        onImageChange?.({
          uri: asset.uri,
          name: buildFileName(asset.fileName, asset.uri, 'profile-photo', mimeType),
          mimeType,
        });
      }
    } catch (error) {
      console.log("Error selecting gallery photo:", error);
      showErrorMessage(t('image_pick_failed'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        {hasProfileImage ? (
          <Image
            source={{ uri: localImageUri || undefined }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Feather name="image" size={moderateScale(22)} color="#D1D5DB" />
          </View>
        )}
        <TouchableOpacity style={styles.cameraButton} onPress={() => setModalVisible(true)}>
          <Feather name="camera" size={moderateScale(14)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.changeText}>{t('change_photo')}</Text>
      </TouchableOpacity>

      <PhotoPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCamera={handleCamera}
        onSelectGallery={handleGallery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 4,
    borderColor: '#FFE4D1',
  },
  avatarPlaceholder: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FA8C4C',
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  changeText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});
