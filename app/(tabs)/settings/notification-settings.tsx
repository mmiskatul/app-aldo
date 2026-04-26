import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../../components/ui/Header';
import { ListRouteSkeleton } from '../../../components/ui/RouteSkeletons';
import { useAppStore } from '../../../store/useAppStore';
import {
  RestaurantNotificationSettings,
  getRestaurantNotificationSettings,
  updateRestaurantNotificationSettings,
} from '../../../api/settings';

type NotificationKey = keyof RestaurantNotificationSettings;

interface NotificationOption {
  id: NotificationKey;
  title: string;
  description: string;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    id: 'push_notifications',
    title: 'Push Notifications',
    description: 'Receive instant alerts on your device.',
  },
  {
    id: 'email_notifications',
    title: 'Email Notifications',
    description: 'Get updates and reports in your inbox.',
  },
  {
    id: 'daily_summary_notifications',
    title: 'Daily Summary Alerts',
    description: 'A quick overview of performance every morning.',
  },
  {
    id: 'low_stock_alerts',
    title: 'Low Stock Alerts',
    description: 'Get notified when inventory drops below threshold.',
  },
  {
    id: 'marketing_notifications',
    title: 'Marketing Notifications',
    description: 'Receive product news, offers, and feature updates.',
  },
];

const DEFAULT_SETTINGS: RestaurantNotificationSettings = {
  push_notifications: true,
  email_notifications: true,
  daily_summary_notifications: true,
  low_stock_alerts: true,
  marketing_notifications: false,
};

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((state) => state.profile);
  const [settings, setSettings] =
    useState<RestaurantNotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<NotificationKey | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurantNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          'Failed to load notification settings.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleSwitch = async (id: NotificationKey) => {
    const nextValue = !settings[id];
    const previous = settings;
    setSavingKey(id);
    setSettings({ ...settings, [id]: nextValue });

    try {
      const updated = await updateRestaurantNotificationSettings({
        [id]: nextValue,
      });
      setSettings(updated);
    } catch (err: any) {
      setSettings(previous);
      Alert.alert(
        'Update failed',
        err?.response?.data?.message ??
          err?.message ??
          'Could not update notification settings.'
      );
    } finally {
      setSavingKey(null);
    }
  };

  const AvatarRight = () => (
    <Image
      source={{
        uri:
          profile?.profile_image_url ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      }}
      style={styles.avatar}
    />
  );

  return (
    <View style={styles.safeArea}>
      <Header
        title="Notification Settings"
        showBack={true}
        rightComponent={<AvatarRight />}
      />

      {loading ? (
        <ListRouteSkeleton withAction={false} itemCount={4} />
      ) : error ? (
        <View style={styles.centerState}>
          <Feather name="alert-circle" size={moderateScale(42)} color="#EF4444" />
          <Text style={styles.stateTitle}>Unable to load settings</Text>
          <Text style={styles.stateDescription}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSettings}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: verticalScale(40) + insets.bottom },
          ]}
        >
          <View style={styles.listContainer}>
            {NOTIFICATION_OPTIONS.map((option) => {
              const disabled = savingKey !== null && savingKey !== option.id;
              return (
                <View
                  key={option.id}
                  style={[styles.optionContainer, disabled && styles.optionDisabled]}
                >
                  <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#E5E7EB', true: '#FA8C4C' }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                    ios_backgroundColor="#E5E7EB"
                    onValueChange={() => toggleSwitch(option.id)}
                    value={settings[option.id]}
                    disabled={savingKey !== null}
                    style={Platform.OS === 'ios' ? styles.iosSwitch : undefined}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
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
  },
  listContainer: {
    gap: verticalScale(16),
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(16),
  },
  optionDisabled: {
    opacity: 0.7,
  },
  textContainer: {
    flex: 1,
    paddingRight: scale(16),
  },
  optionTitle: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  optionDescription: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    lineHeight: 18,
  },
  iosSwitch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  stateTitle: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  stateDescription: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: verticalScale(20),
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
  },
});
