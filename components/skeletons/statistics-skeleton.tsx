import { useTheme } from "@/context/theme-context";
import { cn } from "@/utils/cn";
import React from "react";
import { ScrollView, View } from "react-native";

export function StatisticsSkeleton() {
  const { isDark } = useTheme();

  return (
    <View className="flex-1">
      {/* Wallet Filter Chips Skeleton */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={cn(
                "px-10 py-5 rounded-full border animate-pulse",
                isDark ? "bg-card border-border" : "bg-white border-border/50",
              )}
            />
          ))}
        </ScrollView>
      </View>

      {/* Period Tabs Skeleton */}
      <View className="mb-4 border-b border-border/30">
        <View className="flex-row items-center justify-around">
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} className="py-2 px-1 items-center flex-1">
              <View className="w-12 h-3 bg-muted rounded-full animate-pulse mb-3" />
            </View>
          ))}
        </View>
      </View>

      {/* Summary Cards Skeleton */}
      <View className="mb-6">
        <View className="flex-row gap-2">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={cn(
                "flex-1 border border-border rounded-2xl shadow-sm p-3 animate-pulse",
                isDark ? "bg-card" : "bg-white",
              )}
            >
              <View className="w-8 h-2 bg-muted rounded-full mb-2" />
              <View className="w-16 h-5 bg-muted rounded-lg" />
            </View>
          ))}
        </View>
      </View>

      {/* Chart Cards Skeleton */}
      <View className="flex-col gap-y-6">
        {[1, 2].map((i) => (
          <View
            key={i}
            className={cn(
              "border border-border p-4 pb-6 rounded-3xl shadow-sm animate-pulse",
              isDark ? "bg-card" : "bg-white",
            )}
          >
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-8 h-8 bg-muted rounded-lg" />
              <View className="w-32 h-4 bg-muted rounded-full" />
            </View>
            <View className="flex-row gap-6">
              <View className="w-32 h-32 bg-muted rounded-full mx-auto" />
              <View className="flex-1 gap-y-2 justify-center">
                {[1, 2, 3, 4].map((j) => (
                  <View key={j} className="flex-row items-center gap-x-2">
                    <View className="w-2 h-2 rounded-full bg-muted" />
                    <View className="flex-1 h-2 bg-muted rounded-full" />
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* Export Card Skeleton */}
        <View
          className={cn(
            "border border-border p-4 rounded-3xl shadow-sm animate-pulse",
            isDark ? "bg-card" : "bg-white",
          )}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-muted rounded-lg" />
              <View className="w-24 h-4 bg-muted rounded-full" />
            </View>
          </View>
          <View className="w-full h-3 bg-muted rounded-full mb-4" />
          <View className="w-full h-12 bg-muted rounded-lg" />
        </View>
      </View>

      <View className="h-20" />
    </View>
  );
}
