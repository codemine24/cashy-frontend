import React from "react";
import { View } from "react-native";

export function WalletsSkeleton() {
  return (
    <View className="gap-2">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-card rounded-2xl p-3 mt-3 border border-border animate-pulse flex-row items-center justify-between"
        >
          {/* Left: Icon and Name/Date */}
          <View className="flex-row items-center flex-1">
            <View className="size-13 items-center justify-center rounded-2xl mr-4 bg-muted animate-pulse" />
            <View className="flex-1 mr-4">
              <View className="w-3/4 h-6 bg-muted rounded-lg animate-pulse mb-2" />
              <View className="w-1/2 h-4 bg-muted rounded-md animate-pulse" />
            </View>
          </View>

          {/* Right: Amount and Options Menu */}
          <View className="flex-row items-center">
            <View className="w-20 h-6 bg-muted rounded-lg animate-pulse mr-1" />
            <View className="size-8 bg-muted rounded-full animate-pulse" />
          </View>
        </View>
      ))}
    </View>
  );
}
