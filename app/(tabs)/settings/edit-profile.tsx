import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../../store/useAppStore';
import apiClient from '../../../api/apiClient';
import { getCurrentUser } from '../../../api/auth';
import { getApiErrorMessage } from '../../../utils/api';
import { useTranslation } from '../../../utils/i18n';
import { showErrorMessage, showSuccessMessage } from '../../../utils/feedback';

// Components
import Header from '../../../components/ui/Header';
import ProfileImageEdit, { ProfileImageFile } from '../../../components/settings/edit-profile/ProfileImageEdit';
import FormInput from '../../../components/settings/edit-profile/FormInput';
import RestaurantDetailsForm from '../../../components/settings/edit-profile/RestaurantDetailsForm';

const SAVE_SUCCESS_SOUND = require('../../../assets/sounds/save-success.wav');

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  const appLanguage = useAppStore((state) => state.appLanguage);
  const setProfile = useAppStore((state) => state.setProfile);
  const setUser = useAppStore((state) => state.setUser);
  const tokens = useAppStore((state) => state.tokens);
  const [loading, setLoading] = useState(false);
  const [savePhase, setSavePhase] = useState<'idle' | 'saving' | 'success'>('idle');
  const [loadingDots, setLoadingDots] = useState(1);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    restaurant_name: profile?.restaurant_name || '',
    restaurant_type: profile?.restaurant_type || '',
    city_location: profile?.city_location || '',
    number_of_seats: profile?.number_of_seats?.toString() || '',
    profile_image: null as ProfileImageFile | null,
    remove_profile_image: false,
  });

  const updateField = (field: string, value: string | boolean | ProfileImageFile | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: ProfileImageFile | null) => {
    setFormData((prev) => ({
      ...prev,
      profile_image: file,
      remove_profile_image: false,
    }));
  };

  useEffect(() => {
    if (savePhase !== 'saving') {
      setLoadingDots(1);
      return;
    }

    const intervalId = setInterval(() => {
      setLoadingDots((current) => (current % 3) + 1);
    }, 420);

    return () => clearInterval(intervalId);
  }, [savePhase]);

  const playSuccessCue = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptic feedback failed:', error);
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const { sound } = await Audio.Sound.createAsync(SAVE_SUCCESS_SOUND, {
        shouldPlay: true,
        volume: 0.55,
      });

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || !status.didJustFinish) {
          return;
        }
        void sound.unloadAsync();
      });
    } catch (error) {
      console.log('Success audio failed:', error);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      t('remove_photo_title'),
      t('remove_photo_message'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('remove_photo'),
          style: 'destructive',
          onPress: () => {
            setFormData((prev) => ({
              ...prev,
              profile_image: null,
              remove_profile_image: true,
            }));
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setSavePhase('saving');
    try {
      const data = new FormData();
      data.append('full_name', formData.full_name);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.restaurant_name) data.append('restaurant_name', formData.restaurant_name);
      if (formData.restaurant_type) data.append('restaurant_type', formData.restaurant_type);
      if (formData.city_location) data.append('city_location', formData.city_location);
      if (formData.number_of_seats) data.append('number_of_seats', formData.number_of_seats);
      if (appLanguage) data.append('preferred_language', appLanguage);

      if (formData.profile_image) {
        data.append('profile_image', {
          uri: formData.profile_image.uri,
          name: formData.profile_image.name,
          type: formData.profile_image.mimeType,
        } as any);
      } else if (formData.remove_profile_image) {
        data.append('profile_image_url', '');
      }

      const response = await apiClient.put('/api/v1/restaurant/settings/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data) => data,
      });

      if (response.data) {
        setProfile(response.data);
      }
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser, tokens);

      setSavePhase('success');
      await playSuccessCue();
      await new Promise((resolve) => setTimeout(resolve, 850));
      router.replace({
        pathname: '/(tabs)/settings',
        params: {
          notice: 'profile-updated',
          noticeKey: Date.now().toString(),
        },
      } as any);
    } catch (error: any) {
      console.error(
        'Error saving profile:',
        JSON.stringify(error.response?.data || error.message, null, 2)
      );
      setSavePhase('idle');
      showErrorMessage(getApiErrorMessage(error, t('failed_to_save_profile_changes')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title={t('edit_profile')} showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <ProfileImageEdit 
            profileImageUrl={
              formData.remove_profile_image
                ? null
                : formData.profile_image?.uri || profile?.profile_image_url || null
            }
            onImageChange={handleImageChange}
            onRemoveImage={handleRemovePhoto}
            removeDisabled={loading}
          />

          <View style={styles.formSection}>
            <FormInput 
              label={t('user_name')} 
              value={formData.full_name} 
              onChangeText={(text) => updateField('full_name', text)} 
            />
            <FormInput 
              label={t('email_address')} 
              value={formData.email} 
              editable={false} 
              keyboardType="email-address" 
            />
            <FormInput 
              label={t('phone_number')} 
              value={formData.phone} 
              onChangeText={(text) => updateField('phone', text)} 
              keyboardType="phone-pad" 
            />
          </View>

          <View style={styles.separator} />

          <RestaurantDetailsForm 
            restaurantName={formData.restaurant_name}
            restaurantType={formData.restaurant_type}
            cityLocation={formData.city_location}
            numberOfSeats={formData.number_of_seats}
            onChangeRestaurantName={(text) => updateField('restaurant_name', text)}
            onChangeRestaurantType={(text) => updateField('restaurant_type', text)}
            onChangeCityLocation={(text) => updateField('city_location', text)}
            onChangeNumberOfSeats={(text) => updateField('number_of_seats', text)}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>{t('save_changes')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          {savePhase === 'success' ? (
            <View style={styles.statusBlock}>
              <View style={styles.successIconWrap}>
                <Feather name="check" size={moderateScale(34)} color="#FFFFFF" />
              </View>
              <Text style={styles.loadingTitle}>Updated</Text>
            </View>
          ) : (
            <View style={styles.statusBlock}>
              <ActivityIndicator color="#FA8C4C" size="large" />
              <Text style={styles.loadingTitle}>{`Updating${'.'.repeat(loadingDots)}`}</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: verticalScale(60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: scale(20),
    paddingBottom: verticalScale(40),
  },
  formSection: {
    marginTop: verticalScale(24),
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: verticalScale(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(32),
    gap: scale(12),
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    shadowColor: '#FA8C4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  statusBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(180),
    paddingHorizontal: scale(20),
  },
  loadingTitle: {
    marginTop: verticalScale(14),
    fontSize: moderateScale(20, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successIconWrap: {
    width: scale(76),
    height: scale(76),
    borderRadius: scale(38),
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 14,
  },
});
