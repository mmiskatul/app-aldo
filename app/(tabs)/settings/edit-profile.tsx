import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Components
import Header from '../../../components/ui/Header';
import ProfileImageEdit from '../../../components/settings/edit-profile/ProfileImageEdit';
import FormInput from '../../../components/settings/edit-profile/FormInput';
import RestaurantDetailsForm from '../../../components/settings/edit-profile/RestaurantDetailsForm';

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.safeArea}>
      <Header title="Edit User" showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <ProfileImageEdit />

          <View style={styles.formSection}>
            <FormInput label="User Name" defaultValue="Alexander Chen" />
            <FormInput label="Email Address" defaultValue="alexander.chen@bistroguru.com" keyboardType="email-address" />
            <FormInput label="Phone Number" defaultValue="+1 (555) 123-4567" keyboardType="phone-pad" />
          </View>

          <View style={styles.separator} />

          <RestaurantDetailsForm />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
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
});
