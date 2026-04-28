import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PhotoPickerModal from '../../ui/PhotoPickerModal';
import { showErrorMessage } from '../../../utils/feedback';
import { useTranslation } from '../../../utils/i18n';

interface ProfileImageEditProps {
  profileImageUrl?: string | null;
  onImageChange?: (uri: string) => void;
}

export default function ProfileImageEdit({ profileImageUrl, onImageChange }: ProfileImageEditProps) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(profileImageUrl || null);

  React.useEffect(() => {
    if (profileImageUrl && !localImageUri) {
      setLocalImageUri(profileImageUrl);
    }
  }, [profileImageUrl]);

  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      showErrorMessage("You need to allow camera access to take a photo!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      onImageChange?.(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showErrorMessage("You need to allow gallery access to choose a photo!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      onImageChange?.(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: localImageUri || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }} 
          style={styles.avatar}  
        />
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
