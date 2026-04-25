import apiClient from './apiClient';

export type BillingCycle = '1_month' | '1_year';
export type SubscriptionStatus =
  | 'active'
  | 'trial'
  | 'suspended'
  | 'expired'
  | 'canceled';

export interface RestaurantNotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_notifications: boolean;
  low_stock_alerts: boolean;
  daily_summary_notifications: boolean;
}

export interface RestaurantSubscriptionSettings {
  selection_required: boolean;
  plan_name: string | null;
  billing_cycle: BillingCycle | null;
  status: SubscriptionStatus | null;
  started_at: string | null;
  expires_at: string | null;
  plans_endpoint: string;
  checkout_endpoint: string;
  customer_portal_endpoint: string;
}

export interface UserSubscriptionPlan {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  trial_days: number;
  features: string[];
  is_best_plan: boolean;
}

export interface UserSubscriptionPlanListResponse {
  selection_required: boolean;
  plans: UserSubscriptionPlan[];
  current_subscription: {
    selection_required: boolean;
    plan_name: string | null;
    billing_cycle: BillingCycle | null;
    status: SubscriptionStatus | null;
    started_at: string | null;
    expires_at: string | null;
  };
}

export interface CheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
  publishable_key: string | null;
}

export interface CustomerPortalResponse {
  portal_url: string;
}

export interface PublicLegalDocument {
  key: string;
  title: string;
  content: string;
  updated_at: string | null;
  updated_by: string | null;
}

export interface MessageResponse {
  message: string;
}

const normalizeApiError = (error: any): never => {
  const errorPayload = error?.response?.data?.error;
  const validationErrors = errorPayload?.details?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    const firstError = validationErrors[0];
    const message =
      firstError?.msg ||
      errorPayload?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Request failed';
    throw new Error(String(message));
  }

  const message =
    errorPayload?.message ||
    error?.response?.data?.message ||
    error?.response?.statusText ||
    error?.message ||
    'Request failed';

  throw new Error(String(message));
};

export const getRestaurantNotificationSettings =
  async (): Promise<RestaurantNotificationSettings> => {
    const response = await apiClient.get<RestaurantNotificationSettings>(
      '/api/v1/restaurant/settings/notifications'
    );
    return response.data;
  };

export const updateRestaurantNotificationSettings = async (
  payload: Partial<RestaurantNotificationSettings>
): Promise<RestaurantNotificationSettings> => {
  const response = await apiClient.put<RestaurantNotificationSettings>(
    '/api/v1/restaurant/settings/notifications',
    payload
  );
  return response.data;
};

export const getRestaurantSubscriptionSettings =
  async (): Promise<RestaurantSubscriptionSettings> => {
    const response = await apiClient.get<RestaurantSubscriptionSettings>(
      '/api/v1/restaurant/settings/subscription'
    );
    return response.data;
  };

export const getUserSubscriptionPlans =
  async (): Promise<UserSubscriptionPlanListResponse> => {
    const response = await apiClient.get<UserSubscriptionPlanListResponse>(
      '/api/v1/subscriptions/user/plans'
    );
    return response.data;
  };

export const createSubscriptionCheckoutSession = async (
  billingCycle: BillingCycle,
  startTrial = true,
  planId?: string | null
): Promise<CheckoutSessionResponse> => {
  const response = await apiClient.post<CheckoutSessionResponse>(
    '/api/v1/subscriptions/user/checkout-session',
    {
      plan_id: planId ?? null,
      billing_cycle: billingCycle,
      start_trial: startTrial,
    }
  );
  return response.data;
};

export const createCustomerPortalSession =
  async (): Promise<CustomerPortalResponse> => {
    const response = await apiClient.post<CustomerPortalResponse>(
      '/api/v1/subscriptions/user/customer-portal'
    );
    return response.data;
  };

export const changeRestaurantPassword = async (payload: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<MessageResponse> => {
  try {
    const response = await apiClient.post<MessageResponse>(
      '/api/v1/restaurant/settings/change-password',
      payload
    );
    return response.data;
  } catch (error: any) {
    normalizeApiError(error);
    throw error;
  }
};

export const getTermsOfService =
  async (): Promise<PublicLegalDocument> => {
    const response = await apiClient.get<PublicLegalDocument>(
      '/api/v1/settings/terms-of-service'
    );
    return response.data;
  };

export const getPrivacyPolicy = async (): Promise<PublicLegalDocument> => {
  const response = await apiClient.get<PublicLegalDocument>(
    '/api/v1/settings/privacy-policy'
  );
  return response.data;
};
