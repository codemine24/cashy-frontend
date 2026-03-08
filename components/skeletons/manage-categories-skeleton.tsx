import React from 'react';
import { View } from 'react-native';

export function ManageCategoriesSkeleton() {
  return (
    <View className="px-5 pt-2 gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          className="flex-row items-center justify-between p-4 h-[72px] border border-border bg-card shadow-sm rounded-xl animate-pulse"
        >
          <View className="flex-row items-center flex-1">
            <View className="size-8 bg-muted rounded-full mr-4" />
            <View className="h-5 w-1/2 bg-muted rounded-md" />
          </View>
          <View className="size-6 bg-muted rounded-full" />
        </View>
      ))}
    </View>
  );
}
