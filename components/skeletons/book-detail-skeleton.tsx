import { ScreenContainer } from "@/components/screen-container";
import React from 'react';
import { View } from 'react-native';

export function BookDetailSkeleton() {
  return (
    <ScreenContainer className="px-4 bg-background">
      <View className="mt-4 gap-6">
        {/* Header Card Skeleton */}
        <View className="bg-card rounded-2xl p-4 border border-border shadow-sm animate-pulse">
          <View className="flex-row justify-between items-center border-b border-border pb-4 mb-4">
            <View className="w-1/4 h-5 bg-muted rounded-md" />
            <View className="w-1/3 h-6 bg-muted rounded-md" />
          </View>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <View className="w-1/4 h-4 bg-muted rounded-md" />
              <View className="w-1/4 h-5 bg-muted rounded-md" />
            </View>
            <View className="flex-row justify-between items-center">
              <View className="w-1/4 h-4 bg-muted rounded-md" />
              <View className="w-1/4 h-5 bg-muted rounded-md" />
            </View>
          </View>
        </View>

        {/* Members Section Skeleton */}
        <View className="bg-card rounded-2xl h-[80px] border border-border shadow-sm animate-pulse" />

        {/* Transactions List Skeleton */}
        <View className="gap-3">
          <View className="w-1/3 h-6 bg-surface rounded-lg my-1 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="rounded-2xl h-[95px] bg-card border border-border animate-pulse"
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
