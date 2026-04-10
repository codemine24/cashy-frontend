import React from "react";
import { View } from "react-native";

export function TransactionDetailSkeleton() {
  return (
    <View className="flex-1 bg-background">
      {/* Neutral Header Skeleton */}
      <View className="items-center pt-7 pb-9 px-6 h-[120px] justify-center gap-4 animate-pulse">
        <View className="h-4 w-20 bg-muted rounded-md" />
        <View className="h-8 w-48 bg-muted rounded-xl" />
      </View>

      {/* Content Skeleton */}
      <View className="flex-1 bg-card rounded-t-[28px] pt-12 px-5 gap-8 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="flex-row items-center gap-4">
            <View className="size-6 bg-muted rounded-full" />
            <View className="h-4 w-1/4 bg-muted rounded-md" />
            <View className="flex-1" />
            <View className="h-4 w-1/3 bg-muted rounded-md" />
          </View>
        ))}
      </View>
    </View>
  );
}
