import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const PUSH_DEVICE_ID_KEY = 'push-device-id';

const buildDeviceId = () =>
  `device-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export const getPushProjectId = (): string | null => {
  const easProjectId =
    Constants.easConfig?.projectId ||
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined);
  return easProjectId || null;
};

export const getPushDeviceId = async (): Promise<string> => {
  const existing = await AsyncStorage.getItem(PUSH_DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }
  const nextId = buildDeviceId();
  await AsyncStorage.setItem(PUSH_DEVICE_ID_KEY, nextId);
  return nextId;
};

export const getExistingPushDeviceId = async (): Promise<string | null> =>
  AsyncStorage.getItem(PUSH_DEVICE_ID_KEY);

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FA8C4C',
    });
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if (finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = getPushProjectId();
  if (!projectId) {
    return null;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenResponse.data || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      Platform.OS === 'android' &&
      message.includes('Default FirebaseApp is not initialized')
    ) {
      return null;
    }
    throw error;
  }
};
