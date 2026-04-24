import { ScreenContainer } from "@/components/screen-container";
import { Check, ChevronLeft } from "@/lib/icons";
import { router, Stack } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SuccessScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Success",
          animation: "none",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate("/settings")}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-amber-500 rounded-full items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
              <Check size={48} className="text-white" />
            </View>
            <Text
              className="text-3xl font-bold text-foreground text-center mb-2"
              numberOfLines={1}
            >
              You&apos;re all set!
            </Text>
            <Text className="text-lg text-muted-foreground text-center">
              Welcome to Cashy Premium.
            </Text>
          </View>

          <View className="bg-card border border-border rounded-3xl p-6 w-full mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              Unlimited access unlocked:
            </Text>
            <View className="gap-y-4">
              {[
                "Create unlimited wallets",
                "Create unlimited loans",
                "Wallet can be shared with unlimited members",
                "Attach file with transaction",
              ].map((feature, i) => (
                <View key={i} className="flex-row items-center">
                  <View className="w-6 h-6 bg-amber-500/10 rounded-full items-center justify-center mr-3">
                    <Check size={14} className="text-amber-500" />
                  </View>
                  <Text className="text-base text-foreground font-medium">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace("/settings" as any)}
            className="rounded-xl py-4 w-full bg-amber-500 items-center justify-center shadow-lg"
          >
            <Text
              className="text-lg font-bold text-background"
              numberOfLines={1}
            >
              Start Using Pro
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </>
  );
}
