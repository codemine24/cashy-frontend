import { Check } from "@/lib/icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function RadioButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center space-y-20 gap-3"
    >
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          selected ? "border-primary bg-primary" : "border-muted-foreground"
        }`}
      >
        {selected && <Check size={12} color="#ffffff" />}
      </View>
      <Text className="text-[15px] text-foreground flex-1">{label}</Text>
    </TouchableOpacity>
  );
}
