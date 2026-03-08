import React from 'react';
import { View } from 'react-native';

export function TransactionDetailSkeleton() {
  return (
    <View className="flex-1 justify-between">
      <View className="items-center pt-7 pb-9 px-6 h-[180px] justify-center gap-4 animate-pulse">
        <View className="h-4 w-20 bg-white/20 rounded-md" />
        <View className="h-12 w-48 bg-white/20 rounded-xl" />
        <View className="h-4 w-32 bg-white/20 rounded-md" />
      </View>
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
