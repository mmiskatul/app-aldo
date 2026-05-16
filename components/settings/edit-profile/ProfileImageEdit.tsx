import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PhotoPickerModal from '../../ui/PhotoPickerModal';
import ProfilePlaceholderAvatar from '../../ui/ProfilePlaceholderAvatar';
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
  onImageChange?: (file: ProfileImageFile | null) => void;
  onRemoveImage?: () => void;
  removeDisabled?: boolean;
  editable?: boolean;
  allowRemove?: boolean;
}

export default function ProfileImageEdit({
  profileImageUrl,
  onImageChange,
  onRemoveImage,
  removeDisabled = false,
  editable = true,
  allowRemove = true,
}: ProfileImageEditProps) {
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
          <ProfilePlaceholderAvatar size={scale(100)} style={styles.avatar} />
        )}
        {editable ? (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setModalVisible(true)}
            accessibilityLabel={t('change_photo')}
          >
            <Feather name="camera" size={moderateScale(14)} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>
      {editable ? (
        <View style={styles.actionsRow}>
          {hasProfileImage && allowRemove ? (
            <TouchableOpacity
              onPress={onRemoveImage}
              style={styles.iconActionButton}
              disabled={removeDisabled}
              accessibilityLabel={t('remove_photo')}
            >
              <Feather
                name="trash-2"
                size={moderateScale(16)}
                color={removeDisabled ? "#FCA5A5" : "#EF4444"}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {editable ? (
        <PhotoPickerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelectCamera={handleCamera}
          onSelectGallery={handleGallery}
        />
      ) : null}
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  iconActionButton: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
