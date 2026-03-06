import { ScreenContainer } from "@/components/screen-container";
import { Check, X } from "@/lib/icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// A small functional component for comparison rows
function ComparisonRow({ feature, free, pro }: { feature: string; free: boolean; pro: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-border">
      <Text className="flex-1 text-base text-foreground font-medium pr-2">{feature}</Text>
      <View className="w-16 items-center">
        {free ? (
          <Check size={20} className="text-green-500" />
        ) : (
          <X size={20} className="text-muted-foreground" />
        )}
      </View>
      <View className="w-16 items-center">
        {pro ? (
          <Check size={20} className="text-green-500" />
        ) : (
          <X size={20} className="text-muted-foreground" />
        )}
      </View>
    </View>
  );
}

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "lifetime">("lifetime");
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: "Subscription" }} />
      <ScreenContainer edges={["top"]} className="bg-background relative">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 260 + insets.bottom }}
          className="px-5 pt-6"
        >
          {/* Header area */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              Trusted by 500,000+ users Globally
            </Text>
            <Text className="text-sm font-medium text-muted-foreground text-center px-2">
              Join thousands who have scaled their wealth and boosted productivity with Cashflow Pro.
            </Text>
          </View>

          {/* Comparison Table */}
          <View className="bg-card rounded-3xl border border-border p-5 mb-8">
            <Text className="text-xl font-bold text-foreground mb-4 mt-2">Whats included in Pro</Text>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <Text className="flex-1 text-sm text-muted-foreground font-medium">Features</Text>
              <Text className="w-16 text-center text-sm text-foreground font-medium">Free</Text>
              <Text className="w-16 text-center text-sm text-amber-500 font-bold">Pro</Text>
            </View>

            {/* 5 Comparisons */}
            <ComparisonRow feature="Basic Budgeting" free={true} pro={true} />
            <ComparisonRow feature="Unlimited Transactions" free={false} pro={true} />
            <ComparisonRow feature="Advanced Analytics" free={false} pro={true} />
            <ComparisonRow feature="Unlimited Categories" free={false} pro={true} />
            <ComparisonRow feature="Cloud Backup & Sync" free={false} pro={true} />
          </View>

        </ScrollView>

        {/* Sticky Bottom Area */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border px-5"
          style={{ paddingBottom: Math.max(insets.bottom, 20), paddingTop: 20 }}
        >
          {/* Packages */}
          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPlan("free")}
              className={`flex-1 rounded-2xl border-2 p-4 pt-5 ${selectedPlan === "free" ? "border-foreground bg-card" : "border-border bg-card/50"
                }`}
            >
              <Text className="text-lg font-semibold text-center text-foreground mb-2">Free</Text>
              <Text className="text-2xl font-bold text-center text-foreground mt-auto">$0</Text>
              <Text className="text-xs text-center text-muted-foreground mt-1">Forever</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPlan("lifetime")}
              className={`flex-1 rounded-2xl border-2 p-4 pt-5 relative ${selectedPlan === "lifetime" ? "border-amber-500 bg-amber-500/10" : "border-border bg-card/50"
                }`}
            >
              <View className="absolute -top-3.5 self-center bg-amber-500 px-3 py-1 rounded-full">
                <Text className="text-[10px] font-bold text-white tracking-wider">Limited offer</Text>
              </View>
              <Text className="text-lg font-semibold text-center text-foreground mb-2">Lifetime</Text>

              <View className="items-center justify-center mt-auto flex-col gap-0.5">
                <Text className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground">
                  $14.99
                </Text>
                <Text className="text-2xl font-bold text-foreground">
                  $4.99
                </Text>
              </View>
              <Text className="text-xs text-center text-muted-foreground mt-1">One-time payment</Text>
            </TouchableOpacity>
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className={`rounded-full py-4 items-center justify-center ${selectedPlan === "lifetime" ? "bg-amber-500" : "bg-foreground"
              }`}
          >
            <Text className={`font-bold text-lg ${selectedPlan === "lifetime" ? "text-white" : "text-background"
              }`}>
              {selectedPlan === "lifetime" ? "Get Started for $4.99" : "Continue with Free"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScreenContainer>
    </>
  );
}