import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function BottomSheetModalWrapper({
  visible,
  title,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View className="px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center border-b border-border py-3">
          <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 items-center justify-center"
          >
            <Text className="text-xl text-foreground">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {children}

        {/* Footer */}
        {footer}
      </View>
    </BottomSheetModal>
  );
}
