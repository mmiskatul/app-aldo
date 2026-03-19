import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Components
import LanguageSelector from '../../../components/settings/LanguageSelector';
import ProfileCard from '../../../components/settings/ProfileCard';
import SettingsList from '../../../components/settings/SettingsList';
import Header from '../../../components/ui/Header';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.safeArea}>
      <Header title="Settings" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProfileCard
          onEditProfile={() => router.push('/(tabs)/settings/edit-profile')}
        />

        <LanguageSelector />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
          <SettingsList
            items={[
              { icon: 'credit-card', label: 'Manage Subscription', iconBg: '#FFF7ED', iconColor: '#FA8C4C' },
              { icon: 'bell', label: 'Notification Settings', iconBg: '#FFF7ED', iconColor: '#FA8C4C' },
              { icon: 'lock', label: 'Change Password', iconBg: '#FFF7ED', iconColor: '#FA8C4C' },
              { icon: 'shield', label: 'Two-Factor Authentication', iconBg: '#FFF7ED', iconColor: '#FA8C4C' },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
          <SettingsList
            items={[
              { icon: 'file-text', label: 'Terms & Conditions', iconBg: '#F0F9FF', iconColor: '#0EA5E9' },
              { icon: 'shield', label: 'Privacy Policy', iconBg: '#F0F9FF', iconColor: '#0EA5E9' },
              { icon: 'help-circle', label: 'Help Center', iconBg: '#F0F9FF', iconColor: '#0EA5E9' },
            ]}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Feather name="log-out" size={moderateScale(18)} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
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
