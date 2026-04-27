import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApplyButton({
  onApply,
  applyDisabled,
  title,
}: {
  onApply: () => void;
  applyDisabled: boolean;
  title?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ marginBottom: Math.max(insets.bottom + 12, 20) }}
      className="mt-4"
    >
      <TouchableOpacity
        onPress={onApply}
        disabled={applyDisabled}
        activeOpacity={0.7}
        className={`w-full py-4 rounded-xl items-center ${
          applyDisabled ? "bg-primary/30" : "bg-primary"
        }`}
      >
        <Text
          className={`font-bold text-[15px] ${
            applyDisabled ? "text-white/50" : "text-white"
          }`}
        >
          Apply
        </Text>
      </TouchableOpacity>
    </View>
  );
}
