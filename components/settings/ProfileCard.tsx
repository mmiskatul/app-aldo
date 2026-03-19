import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface ProfileCardProps {
  onEditProfile: () => void;
}

export default function ProfileCard({ onEditProfile }: ProfileCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }} 
          style={styles.avatar} 
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>Alex Chef</Text>
          <Text style={styles.email}>alex@ristoai.com</Text>
          <Text style={styles.location}>The Grand Bistro • New York, NY</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={onEditProfile}
        activeOpacity={0.8}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
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
