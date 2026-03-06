import { languages, type LanguageCode } from "@/constants/onboarding";

import { Check, X } from "@/lib/icons";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface LanguageModalProps {
  visible: boolean;
  selectedLanguage: LanguageCode;
  onSelect: (code: LanguageCode) => void;
  onClose: () => void;
}

export function LanguageModal({
  visible,
  selectedLanguage,
  onSelect,
  onClose,
}: LanguageModalProps) {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/40"
      />

      {/* Bottom sheet */}
      <View className="rounded-t-3xl bg-card px-5 pb-10 pt-5">
        {/* Handle bar */}
        <View className="mb-4 items-center">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>

        {/* Header */}
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-card-foreground">
            Select Language
          </Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <X size={22} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Language list */}
        {languages.map((lang) => {
          const isSelected = lang.code === selectedLanguage;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => onSelect(lang.code)}
              activeOpacity={0.7}
              className={`mb-2 flex-row items-center justify-between rounded-xl px-4 py-3.5 ${isSelected ? "bg-primary/10" : "bg-muted"
                }`}
            >
              <View className="flex-row items-center gap-3">
                <Text className={`text-base font-semibold ${isSelected ? "text-primary" : "text-card-foreground"
                  }`}>
                  {lang.label}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {lang.nativeLabel}
                </Text>
              </View>

              {isSelected && (
                <Check size={20} className="text-primary" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
}
