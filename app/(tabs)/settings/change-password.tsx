import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';

export default function ChangePasswordScreen() {
  const profile = useAppStore((state) => state.profile);

  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility State
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validations
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);

  const AvatarRight = () => (
    <Image 
      source={{ uri: profile?.profile_image_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }} 
      style={styles.avatar} 
    />
  );

  return (
    <View style={styles.safeArea}>
      <Header 
        title="Change password" 
        showBack={true} 
        rightComponent={<AvatarRight />}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.content}
        >
          <Text style={styles.heroTitle}>Secure Your Account</Text>
          <Text style={styles.heroDesc}>
            Choose a strong, unique password to protect your restaurant's financial data and staff information.
          </Text>

          {/* Current Password */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="........"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                <Feather name={showCurrent ? "eye" : "eye-off"} size={moderateScale(18)} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="........"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                <Feather name={showNew ? "eye" : "eye-off"} size={moderateScale(18)} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            {/* Validation Checklist */}
            <View style={styles.validationBox}>
              <View style={styles.valRow}>
                <Feather 
                  name={hasMinLength ? "check-circle" : "circle"} 
                  size={moderateScale(14)} 
                  color={hasMinLength ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={[styles.valText, hasMinLength && { color: '#10B981' }]}>
                  Minimum 8 characters
                </Text>
              </View>
              <View style={styles.valRow}>
                <Feather 
                  name={hasNumber ? "check-circle" : "circle"} 
                  size={moderateScale(14)} 
                  color={hasNumber ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={[styles.valText, hasNumber && { color: '#10B981' }]}>
                  At least one number
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="........"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Feather name={showConfirm ? "eye" : "eye-off"} size={moderateScale(18)} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, (!hasMinLength || !hasNumber || !currentPassword || newPassword !== confirmPassword) && styles.saveButtonDisabled]}
            disabled={!hasMinLength || !hasNumber || !currentPassword || newPassword !== confirmPassword}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
  },
  content: {
    padding: scale(20),
    paddingBottom: verticalScale(60),
  },
  heroTitle: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  heroDesc: {
    fontSize: moderateScale(14, 0.3),
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: verticalScale(32),
  },
  inputBlock: {
    marginBottom: verticalScale(24),
  },
  inputLabel: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    height: verticalScale(50),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
    letterSpacing: 2,
  },
  eyeBtn: {
    padding: scale(4),
  },
  validationBox: {
    marginTop: verticalScale(12),
    gap: verticalScale(8),
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  valText: {
    fontSize: moderateScale(13, 0.3),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    marginTop: verticalScale(16),
    shadowColor: '#FA8C4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#FCA5A5', // Visual muted queue or keep FA8C4C with lower opacity
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
  },
});
