import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../../../store/useAppStore';
import apiClient from '../../../api/apiClient';
import { getCurrentUser } from '../../../api/auth';
import { getApiDisplayMessage, logApiError } from '../../../utils/apiErrors';
import { useTranslation } from '../../../utils/i18n';
import { showErrorMessage } from '../../../utils/feedback';
import { normalizeOrigin } from '../../../utils/settingsNavigation';

// Components
import Header from '../../../components/ui/Header';
import ProfileImageEdit, { ProfileImageFile } from '../../../components/settings/edit-profile/ProfileImageEdit';
import FormInput from '../../../components/settings/edit-profile/FormInput';
import RestaurantDetailsForm from '../../../components/settings/edit-profile/RestaurantDetailsForm';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { origin } = useLocalSearchParams<{ origin?: string | string[] }>();
  const settingsOrigin = normalizeOrigin(origin);
  const profile = useAppStore((state) => state.profile);
  const appLanguage = useAppStore((state) => state.appLanguage);
  const setProfile = useAppStore((state) => state.setProfile);
  const setUser = useAppStore((state) => state.setUser);
  const tokens = useAppStore((state) => state.tokens);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savePhase, setSavePhase] = useState<'idle' | 'saving'>('idle');
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
    interior_photo: null as ProfileImageFile | null,
    exterior_photo: null as ProfileImageFile | null,
    remove_profile_image: false,
    remove_interior_photo: false,
    remove_exterior_photo: false,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      restaurant_name: profile?.restaurant_name || '',
      restaurant_type: profile?.restaurant_type || '',
      city_location: profile?.city_location || '',
      number_of_seats: profile?.number_of_seats?.toString() || '',
      profile_image: null,
      interior_photo: null,
      exterior_photo: null,
      remove_profile_image: false,
      remove_interior_photo: false,
      remove_exterior_photo: false,
    }));
  }, [profile]);

  const updateField = (field: string, value: string | boolean | ProfileImageFile | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await apiClient.get('/api/v1/restaurant/settings/profile');
        if (!isMounted) {
          return;
        }
        setProfile(response.data);
      } catch (error) {
        if (isMounted) {
          logApiError('settings.edit_profile.load', error);
          showErrorMessage(getApiDisplayMessage(error, t('unable_to_load_profile')));
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [setProfile, t]);

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
      if (formData.interior_photo) {
        data.append('interior_photo', {
          uri: formData.interior_photo.uri,
          name: formData.interior_photo.name,
          type: formData.interior_photo.mimeType,
        } as any);
      } else if (formData.remove_interior_photo) {
        data.append('remove_interior_photo', 'true');
        data.append('interior_photo_url', '');
      }
      if (formData.exterior_photo) {
        data.append('exterior_photo', {
          uri: formData.exterior_photo.uri,
          name: formData.exterior_photo.name,
          type: formData.exterior_photo.mimeType,
        } as any);
      } else if (formData.remove_exterior_photo) {
        data.append('remove_exterior_photo', 'true');
        data.append('exterior_photo_url', '');
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
      const refreshedProfile = await apiClient.get('/api/v1/restaurant/settings/profile');
      setProfile(refreshedProfile.data);
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser, tokens);

      router.replace({
        pathname: '/(tabs)/settings',
        params: {
          ...(settingsOrigin ? { origin: settingsOrigin } : {}),
          notice: 'profile-updated',
          noticeKey: String(Date.now()),
        },
      } as any);
    } catch (error: any) {
      logApiError('settings.edit_profile.save', error);
      setSavePhase('idle');
      showErrorMessage(getApiDisplayMessage(error, t('failed_to_save_profile_changes')));
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
          {loadingProfile ? (
            <View style={styles.inlineLoader}>
              <ActivityIndicator color="#FA8C4C" size="small" />
            </View>
          ) : null}
          <ProfileImageEdit 
            profileImageUrl={
              formData.remove_profile_image
                ? null
                : formData.profile_image?.uri || profile?.profile_image_url || null
            }
            editable={false}
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

          <View style={styles.restaurantPhotosSection}>
            <Text style={styles.sectionTitle}>{t('restaurant_photos')}</Text>
            <View style={styles.restaurantPhotosRow}>
              {([
                { key: 'interior', uri: profile?.interior_photo_url || null, label: t('interior_photo') },
                { key: 'exterior', uri: profile?.exterior_photo_url || null, label: t('exterior_photo') },
              ]).map(({ key, uri, label }) => {
                return (
                  <View key={key} style={styles.restaurantPhotoItem}>
                    <View style={styles.restaurantPhotoButton}>
                      {uri ? (
                        <Image source={{ uri }} style={styles.restaurantPhoto} />
                      ) : (
                        <View style={styles.restaurantPhotoPlaceholder}>
                          <Feather name="camera" size={moderateScale(20)} color="#FA8C4C" />
                          <Text style={styles.restaurantPhotoPlaceholderText}>{t('upload_photo')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.restaurantPhotoLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

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
          <View style={styles.statusBlock}>
            <ActivityIndicator color="#FA8C4C" size="large" />
            <Text style={styles.loadingTitle}>{`Updating${'.'.repeat(loadingDots)}`}</Text>
          </View>
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
  inlineLoader: {
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
    letterSpacing: 1,
    marginBottom: verticalScale(14),
  },
  restaurantPhotosSection: {
    marginTop: verticalScale(20),
  },
  restaurantPhotosRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  restaurantPhotoItem: {
    flex: 1,
  },
  restaurantPhotoButton: {
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  restaurantPhoto: {
    width: '100%',
    height: verticalScale(110),
    borderRadius: scale(12),
    backgroundColor: '#F3F4F6',
  },
  restaurantPhotoPlaceholder: {
    width: '100%',
    height: verticalScale(110),
    borderRadius: scale(12),
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(8),
  },
  restaurantPhotoPlaceholderText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#FA8C4C',
  },
  restaurantPhotoLabel: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#6B7280',
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
});
