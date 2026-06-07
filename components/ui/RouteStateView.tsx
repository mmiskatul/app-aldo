import React from "react";
import { StyleSheet, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { ListRouteSkeleton } from "./RouteSkeletons";
import StateCard from "./StateCard";

interface RouteStateViewProps {
  loading: boolean;
  error?: string | null;
  hasData: boolean;
  loadingItemCount?: number;
  loadingFallback?: React.ReactNode;
  errorTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  retryLabel?: string;
  retryLoading?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

export default function RouteStateView({
  loading,
  error = null,
  hasData,
  loadingItemCount = 4,
  loadingFallback,
  errorTitle,
  emptyTitle,
  emptyDescription,
  retryLabel,
  retryLoading = false,
  onRetry,
  children,
}: RouteStateViewProps) {
  if (loading && !hasData) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    return <ListRouteSkeleton withAction={false} itemCount={loadingItemCount} />;
  }

  if (error && !hasData) {
    return (
      <View style={styles.stateWrap}>
        <StateCard
          title={errorTitle || "Unable to load"}
          description={error}
          tone="error"
          actionLabel={retryLabel}
          actionLoading={retryLoading}
          onAction={onRetry}
        />
      </View>
    );
  }

  if (!hasData && emptyTitle && emptyDescription) {
    return (
      <View style={styles.stateWrap}>
        <StateCard title={emptyTitle} description={emptyDescription} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  stateWrap: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(24),
  },
});
