import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { registerPushDevice } from '../../api/settings';
import { useAppStore } from '../../store/useAppStore';
import {
  getPushDeviceId,
  registerForPushNotificationsAsync,
} from '../../utils/pushNotifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PushNotificationRegistrar() {
  const router = useRouter();
  const tokens = useAppStore((state) => state.tokens);
  const user = useAppStore((state) => state.user);
  const lastRegisteredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tokens?.access_token || !user?.id) {
      lastRegisteredTokenRef.current = null;
      return;
    }

    let isActive = true;

    const syncPushRegistration = async () => {
      try {
        const expoPushToken = await registerForPushNotificationsAsync();
        if (!isActive || !expoPushToken) {
          return;
        }
        if (lastRegisteredTokenRef.current === expoPushToken) {
          return;
        }

        const deviceId = await getPushDeviceId();
        if (!isActive) {
          return;
        }

        await registerPushDevice({
          expo_push_token: expoPushToken,
          device_id: deviceId,
          platform:
            Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web'
              ? Platform.OS
              : 'unknown',
          device_name: Platform.OS,
        });
        lastRegisteredTokenRef.current = expoPushToken;
      } catch (error) {
        console.log('[push] registration skipped:', error);
      }
    };

    void syncPushRegistration();

    return () => {
      isActive = false;
    };
  }, [tokens?.access_token, user?.id]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(tabs)/settings/notifications' as any);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}
