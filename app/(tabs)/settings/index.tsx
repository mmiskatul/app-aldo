import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Components
import LanguageSelector from '../../../components/settings/LanguageSelector';
import ProfileCard from '../../../components/settings/ProfileCard';
import SettingsList from '../../../components/settings/SettingsList';
import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from '../../../utils/i18n';
import apiClient from '../../../api/apiClient';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { notice, noticeKey } = useLocalSearchParams<{ notice?: string; noticeKey?: string }>();
  const logout = useAppStore((state) => state.logout);
  const setProfile = useAppStore((state) => state.setProfile);
  const [bannerMessage, setBannerMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/v1/restaurant/settings/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [setProfile]);

  useEffect(() => {
    if (!notice || !noticeKey) {
      return;
    }

    if (notice === 'profile-updated') {
      setBannerMessage('Profile updated successfully.');
    }

    const timeoutId = setTimeout(() => setBannerMessage(''), 3000);
    return () => clearTimeout(timeoutId);
  }, [notice, noticeKey]);

  return (
    <View style={styles.safeArea}>
      <Header title={t('settings_title')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {bannerMessage ? (
          <View style={styles.banner}>
            <Feather name="check-circle" size={moderateScale(16)} color="#166534" />
            <Text style={styles.bannerText}>{bannerMessage}</Text>
          </View>
        ) : null}

        <ProfileCard
          onEditProfile={() => router.push('/(tabs)/settings/edit-profile')}
        />

        <LanguageSelector />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account_settings')}</Text>
          <SettingsList
            items={[
              { icon: 'credit-card', label: t('manage_subscription'), iconBg: '#FFF7ED', iconColor: '#FA8C4C', onPress: () => router.push('/(tabs)/settings/manage-subscription') },
              { icon: 'bell', label: t('notification_settings'), iconBg: '#FFF7ED', iconColor: '#FA8C4C', onPress: () => router.push('/(tabs)/settings/notification-settings') },
              { icon: 'lock', label: t('change_password'), iconBg: '#FFF7ED', iconColor: '#FA8C4C', onPress: () => router.push('/(tabs)/settings/change-password') },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('support_legal')}</Text>
          <SettingsList
            items={[
              { icon: 'file-text', label: 'Terms of Service', iconBg: '#F0F9FF', iconColor: '#0EA5E9', onPress: () => router.push('/(tabs)/settings/terms-of-service') },
              { icon: 'shield', label: 'Privacy Policy', iconBg: '#F0F9FF', iconColor: '#0EA5E9', onPress: () => router.push('/(tabs)/settings/privacy') },
              { icon: 'help-circle', label: t('help_center'), iconBg: '#F0F9FF', iconColor: '#0EA5E9', onPress: () => router.push('/(tabs)/settings/help-center') },
            ]}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            logout();
            router.replace('/(auth)' as any);
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
  banner: {
    marginBottom: verticalScale(16),
    borderRadius: scale(12),
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  bannerText: {
    flex: 1,
    color: '#166534',
    fontSize: moderateScale(13),
    fontWeight: '600',
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
