import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../utils/i18n';

interface ProfileCardProps {
  onEditProfile: () => void;
}

export default function ProfileCard({ onEditProfile }: ProfileCardProps) {
  const profile = useAppStore((state) => state.profile);
  const { t } = useTranslation();
  const hasProfileImage = !!profile?.profile_image_url;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        {hasProfileImage ? (
          <Image
            source={{ uri: profile?.profile_image_url || undefined }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{profile?.full_name || 'Loading...'}</Text>
          <Text style={styles.email}>{profile?.email || '-----'}</Text>
          <Text style={styles.location}>{profile?.restaurant_name || '-----'} • {profile?.city_location || '-----'}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={onEditProfile}
        activeOpacity={0.8}
      >
        <Text style={styles.editButtonText}>{t('edit_profile_button')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  textContainer: {
    marginLeft: scale(16),
    flex: 1,
  },
  name: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  email: {
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  location: {
    fontSize: moderateScale(12, 0.3),
    color: '#FA8C4C',
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  editButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
  },
});
