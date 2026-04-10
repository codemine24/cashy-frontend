import { useState, useCallback } from 'react';

/**
 * Custom hook for pull-to-refresh with skeleton loading
 * Provides state management and refresh control props for consistent UX
 */
export function usePullToRefreshSkeleton(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const refreshControlProps = {
    refreshing: false, // Never show built-in refreshing state
    onRefresh: handleRefresh,
    tintColor: isPulling && !refreshing ? '#029292' : 'transparent',
    colors: isPulling && !refreshing ? ['#029292'] : ['transparent'],
    onRefreshStart: () => setIsPulling(true),
    onRefreshEnd: () => setIsPulling(false),
  };

  return {
    refreshing,
    isPulling,
    showSkeleton: refreshing, // Show skeleton when refreshing
    refreshControlProps,
  };
}

/**
 * Extended version for screens with search functionality
 * Disables pull-to-refresh when search is active
 */
export function usePullToRefreshSkeletonWithSearch(
  onRefresh: () => Promise<void>,
  searchQuery: string = ''
) {
  const baseHook = usePullToRefreshSkeleton(onRefresh);

  const refreshControlProps = {
    ...baseHook.refreshControlProps,
    tintColor: baseHook.isPulling && !baseHook.refreshing && !searchQuery ? '#029292' : 'transparent',
    colors: baseHook.isPulling && !baseHook.refreshing && !searchQuery ? ['#029292'] : ['transparent'],
  };

  return {
    ...baseHook,
    refreshControlProps,
  };
}
