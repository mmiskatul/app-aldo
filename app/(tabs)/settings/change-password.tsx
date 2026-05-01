import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';
import { changeRestaurantPassword } from '../../../api/settings';
import { showErrorMessage, showSuccessMessage } from '../../../utils/feedback';
import { useTranslation } from '../../../utils/i18n';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const profile = useAppStore((state) => state.profile);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentHasMinLength = currentPassword.length >= 8;
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const isDifferentFromCurrent =
    !!newPassword && !!currentPassword && newPassword !== currentPassword;
  const canSubmit =
    currentHasMinLength &&
    hasMinLength &&
    hasNumber &&
    hasLetter &&
    passwordsMatch &&
    isDifferentFromCurrent &&
    !isSaving;

  const handleSave = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await changeRestaurantPassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showSuccessMessage(response.message, t('password_changed'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showErrorMessage(
        err?.message || t('something_went_wrong'),
        t('change_password_failed')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const AvatarRight = () => (
    profile?.profile_image_url ? (
      <Image
        source={{ uri: profile.profile_image_url }}
        style={styles.avatar}
      />
    ) : (
      <View style={styles.avatarPlaceholder} />
    )
  );

  return (
    <View style={styles.safeArea}>
      <Header
        title={t('change_password')}
        showBack={true}
        rightComponent={<AvatarRight />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.heroTitle}>{t('secure_account_title')}</Text>
          <Text style={styles.heroDesc}>
            {t('secure_account_desc')}
          </Text>

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>{t('current_password')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={t('enter_current_password')}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showCurrent ? 'eye' : 'eye-off'}
                  size={moderateScale(18)}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>{t('new_password')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('enter_new_password')}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showNew ? 'eye' : 'eye-off'}
                  size={moderateScale(18)}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.validationBox}>
              <View style={styles.valRow}>
                <Feather
                  name={hasMinLength ? 'check-circle' : 'circle'}
                  size={moderateScale(14)}
                  color={hasMinLength ? '#10B981' : '#9CA3AF'}
                />
                <Text
                  style={[styles.valText, hasMinLength && styles.validText]}
                >
                  {t('password_minimum_characters')}
                </Text>
              </View>
              <View style={styles.valRow}>
                <Feather
                  name={hasNumber ? 'check-circle' : 'circle'}
                  size={moderateScale(14)}
                  color={hasNumber ? '#10B981' : '#9CA3AF'}
                />
                <Text style={[styles.valText, hasNumber && styles.validText]}>
                  {t('password_one_number')}
                </Text>
              </View>
              <View style={styles.valRow}>
                <Feather
                  name={hasLetter ? 'check-circle' : 'circle'}
                  size={moderateScale(14)}
                  color={hasLetter ? '#10B981' : '#9CA3AF'}
                />
                <Text style={[styles.valText, hasLetter && styles.validText]}>
                  {t('password_one_letter')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>{t('confirm_password')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('confirm_new_password')}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showConfirm ? 'eye' : 'eye-off'}
                  size={moderateScale(18)}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {!passwordsMatch && confirmPassword.length > 0 ? (
              <Text style={styles.errorText}>{t('passwords_do_not_match')}</Text>
            ) : null}
            {passwordsMatch && !isDifferentFromCurrent && confirmPassword.length > 0 ? (
              <Text style={styles.errorText}>
                {t('password_must_differ')}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
            disabled={!canSubmit}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? t('saving') : t('save_changes')}
            </Text>
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
  flex: {
    flex: 1,
  },
  avatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
  },
  avatarPlaceholder: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#E5E7EB',
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
  validText: {
    color: '#10B981',
  },
  errorText: {
    marginTop: verticalScale(8),
    color: '#DC2626',
    fontSize: moderateScale(13, 0.3),
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
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
  },
});
