import React from 'react';
import { View } from 'react-native';

export function LoansSkeleton() {
  return (
    <View className="gap-4">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-card rounded-2xl p-4 border border-border animate-pulse shadow-sm"
        >
          <View className="flex-row items-center mb-4">
            <View className="size-12 bg-muted rounded-2xl mr-4" />
            <View className="flex-1">
              <View className="w-1/2 h-5 bg-muted rounded-lg mb-2" />
              <View className="w-1/3 h-4 bg-muted rounded-md" />
            </View>
            <View className="items-end">
              <View className="w-20 h-5 bg-muted rounded-lg mb-2" />
              <View className="w-16 h-4 bg-muted rounded-md" />
            </View>
          </View>
          {/* Progress bar skeleton */}
          <View className="h-2 bg-muted rounded-full mb-2" />
          <View className="flex-row justify-between">
            <View className="w-16 h-3 bg-muted rounded-md" />
            <View className="w-20 h-3 bg-muted rounded-md" />
          </View>
        </View>
      ))}
    </View>
  );
}
