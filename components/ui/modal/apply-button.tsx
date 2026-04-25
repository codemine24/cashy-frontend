import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApplyButton({
  onApply,
  applyDisabled,
}: {
  onApply: () => void;
  applyDisabled: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ marginBottom: Math.max(insets.bottom + 8, 20) }}
      className="mt-4"
    >
      <TouchableOpacity
        onPress={onApply}
        disabled={applyDisabled}
        activeOpacity={0.7}
        className={`w-full py-4 rounded-xl items-center ${applyDisabled ? "bg-primary/30" : "bg-primary"
          }`}
      >
        <Text
          className={`font-bold text-[15px] ${applyDisabled ? "text-white/50" : "text-white"
            }`}
        >
          Apply <Text className="text-[12px] text-neutral-400">({Math.max(insets.bottom + 8, 20)})</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
