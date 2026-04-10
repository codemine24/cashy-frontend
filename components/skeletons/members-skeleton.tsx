import React from 'react';
import { View } from 'react-native';

export function MembersSkeleton() {
  return (
    <View className="p-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="bg-card rounded-2xl border border-border p-4 flex-row items-center justify-between animate-pulse"
        >
          <View className="flex-row items-center flex-1">
            <View className="size-11 bg-muted rounded-full mr-3" />
            <View className="flex-1 gap-2.5">
              <View className="h-4 w-1/2 bg-muted rounded-md" />
              <View className="h-3 w-1/3 bg-muted rounded-md" />
            </View>
          </View>
          <View className="h-6 w-16 bg-muted rounded-md" />
        </View>
      ))}
    </View>
  );
}
