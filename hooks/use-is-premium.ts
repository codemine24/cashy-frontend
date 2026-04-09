import { useGetMySubscription } from "@/api/subscription";

/**
 * Hook to check if the current user has an active premium subscription.
 *
 * @returns {Object} { isPremium: boolean, isLoading: boolean, subscription: Subscription | undefined }
 */
export const useIsPremium = () => {
  const { data: subscription, isLoading } = useGetMySubscription();

  const isPremium = !!subscription && subscription.is_active;

  return {
    isPremium,
    isLoading,
    subscription,
  };
};
