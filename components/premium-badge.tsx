import { Crown } from "@/lib/icons";
import React from "react";
import { Text, View } from "react-native";

export const PremiumBadge = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const isSm = size === "sm";

  return (
    <View
      className={`flex-row items-center bg-amber-500/10 border border-amber-500/20 rounded-full ${
        isSm ? "px-1.5 py-0.5" : "px-2.5 py-1"
      }`}
    >
      <Crown
        size={isSm ? 10 : 12}
        className="text-amber-500 mr-1.5"
      />
      <Text
        className={`font-bold text-amber-600 uppercase tracking-tight ${
          isSm ? "text-[8px]" : "text-[10px]"
        }`}
      >
        Pro
      </Text>
    </View>
  );
};
