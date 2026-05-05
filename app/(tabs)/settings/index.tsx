import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Components
import LanguageSelector from '../../../components/settings/LanguageSelector';
import ProfileCard from '../../../components/settings/ProfileCard';
import SettingsList from '../../../components/settings/SettingsList';
import Header from '../../../components/ui/Header';
import { useCachedFocusRefresh } from '../../../hooks/useCachedFocusRefresh';
import { useAppStore } from '../../../store/useAppStore';
import { getApiDisplayMessage, logApiError } from '../../../utils/apiErrors';
import { showErrorMessage, showSuccessMessage } from '../../../utils/feedback';
import { useTranslation } from '../../../utils/i18n';
import apiClient from '../../../api/apiClient';
import { unregisterPushDevice } from '../../../api/settings';
import { getExistingPushDeviceId } from '../../../utils/pushNotifications';
import { buildSettingsHref, normalizeOrigin } from '../../../utils/settingsNavigation';

const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { origin, notice, noticeKey } = useLocalSearchParams<{
    origin?: string | string[];
    notice?: string;
    noticeKey?: string;
  }>();
  const settingsOrigin = normalizeOrigin(origin);
  const logout = useAppStore((state) => state.logout);
  const profile = useAppStore((state) => state.profile);
  const profileFetchedAt = useAppStore((state) => state.profileFetchedAt);
  const setProfile = useAppStore((state) => state.setProfile);
  const handledNoticeKeyRef = React.useRef<string | null>(null);

  const handleLogout = React.useCallback(async () => {
    try {
      const deviceId = await getExistingPushDeviceId();
      if (deviceId) {
        await unregisterPushDevice({ device_id: deviceId });
      }
    } catch (error) {
      console.log('[push] unregister on logout skipped:', error);
    } finally {
      logout();
      router.replace('/(auth)' as any);
    }
  }, [logout, router]);

  const fetchProfile = React.useCallback(async (silent = false) => {
    try {
      const response = await apiClient.get('/api/v1/restaurant/settings/profile');
      setProfile(response.data);
    } catch (error) {
      logApiError('settings.profile', error);
      if (!silent || !profile) {
        showErrorMessage(getApiDisplayMessage(error, 'Unable to load profile.'), 'Load failed');
      }
    }
  }, [profile, setProfile]);

  useCachedFocusRefresh({
    hasCache: Boolean(profile),
    fetchedAt: profileFetchedAt,
    ttlMs: PROFILE_CACHE_TTL_MS,
    loadOnEmpty: () => {
      void fetchProfile(false);
    },
    refreshStale: () => {
      void fetchProfile(true);
    },
  });

  React.useEffect(() => {
    if (notice !== 'profile-updated' || !noticeKey) {
      return;
    }
    if (handledNoticeKeyRef.current === noticeKey) {
      return;
    }
    handledNoticeKeyRef.current = noticeKey;

    showSuccessMessage(t('profile_updated_successfully'));
  }, [notice, noticeKey, t]);

  return (
    <View style={styles.safeArea}>
      <Header title={t('settings_title')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProfileCard
          onEditProfile={() => router.push(buildSettingsHref('/(tabs)/settings/edit-profile', settingsOrigin))}
        />

        <LanguageSelector />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account_settings')}</Text>
          <SettingsList
            items={[
              { icon: 'credit-card', label: t('manage_subscription'), iconBg: '#FFF7ED', iconColor: '#FA8C4C', onPress: () => router.push(buildSettingsHref('/(tabs)/settings/manage-subscription', settingsOrigin)) },
              { icon: 'bell', label: t('notification_settings'), iconBg: '#FFF7ED', iconColor: '#FA8C4C', onPress: () => router.push(buildSettingsHref('/(tabs)/settings/notification-settings', settingsOrigin)) },
              { icon: 'lock', label: t('change_password'), iconBg: '#FFF7ED', iconColor: '#FA8C4C', onPress: () => router.push(buildSettingsHref('/(tabs)/settings/change-password', settingsOrigin)) },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('support_legal')}</Text>
          <SettingsList
            items={[
              { icon: 'file-text', label: t('terms_of_service'), iconBg: '#F0F9FF', iconColor: '#0EA5E9', onPress: () => router.push(buildSettingsHref('/(tabs)/settings/terms-of-service', settingsOrigin)) },
              { icon: 'shield', label: t('privacy_policy'), iconBg: '#F0F9FF', iconColor: '#0EA5E9', onPress: () => router.push(buildSettingsHref('/(tabs)/settings/privacy', settingsOrigin)) },
              { icon: 'help-circle', label: t('help_center'), iconBg: '#F0F9FF', iconColor: '#0EA5E9', onPress: () => router.push(buildSettingsHref('/(tabs)/settings/help-center', settingsOrigin)) },
            ]}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            void handleLogout();
          }}
        >
          <Feather name="log-out" size={moderateScale(18)} color="#EF4444" />
          <Text style={styles.logoutText}>{t('sign_out')}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: scale(20),
    paddingBottom: verticalScale(80),
  },
  section: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 1,
    marginBottom: verticalScale(16),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(32),
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
  },
  logoutText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: scale(8),
  },
});
