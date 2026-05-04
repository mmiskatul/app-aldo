import apiClient from "./apiClient";

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  is_active: boolean;
  email_verified: boolean;
  restaurant_name?: string | null;
  location?: string | null;
  subscription_plan_name?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  account_status?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  subscription_selection_required?: boolean;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getCurrentUser = async (): Promise<AuthenticatedUser> => {
  const response = await apiClient.get<AuthenticatedUser>("/api/v1/auth/me");
  return response.data;
};

export const hasCompletedOnboarding = (user?: Pick<AuthenticatedUser, "onboarding_completed"> | null): boolean => {
  return user?.onboarding_completed === true;
};
