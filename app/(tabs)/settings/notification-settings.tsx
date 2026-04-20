import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  Image,
  Platform
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';

interface NotificationOption {
  id: string;
  title: string;
  description: string;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    id: 'push',
    title: 'Push Notifications',
    description: 'Receive instant alerts on your device.',
  },
  {
    id: 'email',
    title: 'Email Notifications',
    description: 'Get daily and weekly reports in your inbox.',
  },
  {
    id: 'daily_summary',
    title: 'Daily Summary Alerts',
    description: 'A quick overview of performance every morning.',
  },
  {
    id: 'low_inventory',
    title: 'Low Inventory Alerts',
    description: 'Notified when stock levels are below threshold.',
  },
  {
    id: 'subscription',
    title: 'Subscription & Payment Alerts',
    description: 'Updates about your plan and billing.',
  }
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((state) => state.profile);
  
  // Local state tracking toggles based on mockup defaults
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({
    'push': true,
    'email': true,
    'daily_summary': false,
    'low_inventory': true,
    'subscription': true,
  });

  const toggleSwitch = (id: string) => {
    setActiveToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const AvatarRight = () => (
    <Image 
      source={{ uri: profile?.profile_image_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }} 
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

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[
          styles.content, 
          { paddingBottom: verticalScale(40) + insets.bottom }
        ]}
      >
        <View style={styles.listContainer}>
          {NOTIFICATION_OPTIONS.map((option) => (
            <View key={option.id} style={styles.optionContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#FA8C4C' }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSwitch(option.id)}
                value={activeToggles[option.id]}
                style={Platform.OS === 'ios' ? styles.iosSwitch : undefined}
              />
            </View>
          ))}
        </View>
      </ScrollView>
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
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }]
  }
});
