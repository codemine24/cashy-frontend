import { ScreenContainer } from "@/components/screen-container";
import React from 'react';
import { View } from 'react-native';

export function GoalDetailSkeleton() {
  return (
    <ScreenContainer className="p-4 bg-background">
      <View className="gap-6 mt-2">
        {/* Summary Card Skeleton */}
        <View className="bg-card rounded-xl p-6 border border-border shadow-sm animate-pulse">
          <View className="w-24 h-4 bg-muted rounded-md mx-auto mb-1" />
          <View className="w-32 h-10 bg-muted rounded-md mx-auto mb-1" />
          <View className="w-28 h-4 bg-muted rounded-md mx-auto mb-5" />

          <View className="h-3 bg-muted rounded-full w-full mb-2" />

          <View className="flex-row justify-between">
            <View className="w-10 h-4 bg-muted rounded-md" />
            <View className="w-24 h-4 bg-muted rounded-md" />
          </View>

          <View className="flex-row gap-3 mt-5">
            <View className="flex-1 bg-background rounded-lg p-3 border border-border h-16 items-center" />
            <View className="flex-1 bg-background rounded-lg p-3 border border-border h-16 items-center" />
          </View>
        </View>

        {/* Entries list Skeleton */}
        <View className="w-24 h-6 bg-muted rounded-md mb-2 animate-pulse" />
        <View className="gap-3">
          {[1, 2].map((i) => (
            <View
              key={i}
              className="rounded-xl h-[70px] bg-card border border-border animate-pulse"
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
