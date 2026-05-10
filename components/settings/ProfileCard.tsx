import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useAppStore } from '../../store/useAppStore';
import ProfilePlaceholderAvatar from '../ui/ProfilePlaceholderAvatar';

interface ProfileCardProps {
  onEditProfile: () => void;
}

export default function ProfileCard({ onEditProfile }: ProfileCardProps) {
  const profile = useAppStore((state) => state.profile);
  const hasProfileImage = !!profile?.profile_image_url;
  const locationParts = [profile?.restaurant_name, profile?.city_location].filter(Boolean);

  return (
    <TouchableOpacity style={styles.container} onPress={onEditProfile} activeOpacity={0.85}>
      <View style={styles.infoRow}>
        {hasProfileImage ? (
          <Image
            source={{ uri: profile?.profile_image_url || undefined }}
            style={styles.avatar}
          />
        ) : (
          <ProfilePlaceholderAvatar size={scale(70)} style={styles.avatar} />
        )}
        <View style={styles.textContainer}>
          {profile?.full_name ? <Text style={styles.name}>{profile.full_name}</Text> : null}
          {profile?.email ? <Text style={styles.email}>{profile.email}</Text> : null}
          {locationParts.length > 0 ? <Text style={styles.location}>{locationParts.join(' • ')}</Text> : null}
        </View>
        <View style={styles.editIconBadge}>
          <Feather name="edit-2" size={moderateScale(14)} color="#FA8C4C" />
        </View>
      </View>
    </TouchableOpacity>
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
  },
  avatar: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    borderWidth: 3,
    borderColor: '#FFFFFF',
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
  editIconBadge: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scale(12),
  },
});
