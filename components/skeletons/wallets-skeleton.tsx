import React from 'react';
import { View } from 'react-native';

export function WalletsSkeleton() {
  return (
    <View className="gap-4">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-card rounded-2xl p-5 border border-border animate-pulse shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="w-1/2 h-6 bg-muted rounded-lg" />
            <View className="size-8 bg-muted rounded-full" />
          </View>
          <View className="w-1/3 h-8 bg-muted rounded-lg mb-3" />
          <View className="flex-row gap-2">
            <View className="w-1/4 h-5 bg-muted rounded-md" />
            <View className="w-1/4 h-5 bg-muted rounded-md" />
          </View>
        </View>
      ))}
    </View>
  );
}
