import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { hasCompletedOnboarding } from '../../api/auth';
import { registerPushDevice } from '../../api/settings';
import { hasActiveSubscription, useAppStore } from '../../store/useAppStore';
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

const getApiErrorCode = (error: any): string => {
  return String(error?.response?.data?.error?.code || error?.response?.data?.code || '').toLowerCase();
};

export default function PushNotificationRegistrar() {
  const router = useRouter();
  const tokens = useAppStore((state) => state.tokens);
  const user = useAppStore((state) => state.user);
  const lastRegisteredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const isRestaurantUser =
      user?.role === 'restaurant_owner' ||
      user?.role === 'manager' ||
      user?.role === 'staff';

    if (
      !tokens?.access_token ||
      !user?.id ||
      !isRestaurantUser ||
      !hasActiveSubscription(user) ||
      !hasCompletedOnboarding(user)
    ) {
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
      } catch (error: any) {
        const code = getApiErrorCode(error);
        if (error?.response?.status === 403 && (code === 'subscription_required' || code === 'onboarding_required')) {
          lastRegisteredTokenRef.current = null;
          return;
        }
        console.log('[push] registration skipped:', error?.message || error);
      }
    };

    void syncPushRegistration();

    return () => {
      isActive = false;
    };
  }, [
    tokens?.access_token,
    user?.id,
    user?.role,
    user?.onboarding_completed,
    user?.subscription_plan_name,
    user?.subscription_status,
    user?.subscription_selection_required,
  ]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notifications' as any);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}
