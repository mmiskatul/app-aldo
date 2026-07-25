import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { REVENUECAT_CONSTANTS } from '@/constants/revenuecat';
import { showErrorMessage, showSuccessMessage } from '../utils/feedback';

interface SubscriptionContextType {
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  syncUserSession: (userId: string) => Promise<void>;
  clearUserSession: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  useEffect(() => {
    initRevenueCat();
  }, []);

  const checkEntitlement = (info: CustomerInfo | null) => {
    if (!info) {
      setIsPro(false);
      return;
    }
    const hasPro = typeof info.entitlements.active[REVENUECAT_CONSTANTS.ENTITLEMENT_ID] !== 'undefined';
    setIsPro(hasPro);
  };

  const initRevenueCat = async () => {
    try {
      setIsLoading(true);
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey =
        Platform.OS === 'ios'
          ? process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY
          : process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

      if (apiKey) {
        Purchases.configure({ apiKey });

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        checkEntitlement(info);

        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
          setCurrentOffering(offerings.current);
        }
      }
    } catch (e) {
      console.warn('[SubscriptionContext] Error initializing RevenueCat:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const syncUserSession = async (userId: string) => {
    try {
      if (!userId) return;
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) return;
      const { customerInfo: updatedInfo } = await Purchases.logIn(userId);
      setCustomerInfo(updatedInfo);
      checkEntitlement(updatedInfo);
    } catch (e) {
      console.warn('[SubscriptionContext] Error logging in to RevenueCat:', e);
    }
  };

  const clearUserSession = async () => {
    try {
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) return;
      const updatedInfo = await Purchases.logOut();
      setCustomerInfo(updatedInfo);
      checkEntitlement(updatedInfo);
    } catch (e) {
      console.warn('[SubscriptionContext] Error logging out of RevenueCat:', e);
    }
  };

  const refreshSubscription = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      checkEntitlement(info);

      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
      }
    } catch (e) {
      console.warn('[SubscriptionContext] Error refreshing customer info:', e);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsPurchasing(true);
      const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);
      checkEntitlement(updatedInfo);

      const hasPro = typeof updatedInfo.entitlements.active[REVENUECAT_CONSTANTS.ENTITLEMENT_ID] !== 'undefined';
      if (hasPro) {
        showSuccessMessage('Thank you for subscribing to RistoAI Premium!');
        return true;
      }
      return false;
    } catch (e: any) {
      if (!e.userCancelled) {
        showErrorMessage(e.message || 'An error occurred during purchase.', 'Purchase Failed');
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsRestoring(true);
      const restoredInfo = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);
      checkEntitlement(restoredInfo);

      const hasPro = typeof restoredInfo.entitlements.active[REVENUECAT_CONSTANTS.ENTITLEMENT_ID] !== 'undefined';
      if (hasPro) {
        showSuccessMessage('Your RistoAI Premium subscription has been successfully restored!');
        return true;
      } else {
        showErrorMessage('No active subscription found for this account.', 'No Active Subscription');
        return false;
      }
    } catch (e: any) {
      showErrorMessage(e.message || 'Failed to restore purchases.', 'Restore Error');
      return false;
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        customerInfo,
        currentOffering,
        isLoading,
        isPurchasing,
        isRestoring,
        purchasePackage,
        restorePurchases,
        refreshSubscription,
        syncUserSession,
        clearUserSession,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
