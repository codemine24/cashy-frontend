import React from 'react';
import { View } from 'react-native';

export function GoalsSkeleton() {
  return (
    <View className="gap-4">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-card rounded-xl p-4 border border-border animate-pulse"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="w-1/2 h-6 bg-muted rounded-lg" />
            <View className="w-16 h-6 bg-success/20 rounded-full" />
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="w-1/4 h-10 bg-muted rounded-md" />
            <View className="w-1/4 h-10 bg-muted rounded-md items-end" />
          </View>

          <View className="h-2 bg-muted rounded-full w-full mb-1" />

          <View className="flex-row justify-between mt-1">
            <View className="w-16 h-4 bg-muted rounded-md" />
            <View className="w-10 h-4 bg-muted rounded-md" />
          </View>

          <View className="w-24 h-4 bg-muted mt-2 rounded-md" />
        </View>
      ))}
    </View>
  );
}
