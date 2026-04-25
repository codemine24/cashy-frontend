import { useCreateCategory, useUpdateCategory } from "@/api/category";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import ApplyButton from "../ui/modal/apply-button";
import BottomSheetModalWrapper from "../ui/modal/bottom-sheet-modal-wrapper";

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialName?: string;
  initialIcon?: string;
  categoryId?: string;
}

const COMMON_ICONS = [
  // Food & Snacks
  "🍔",
  "🍕",
  "🍜",
  "🍲",
  "🍿",
  "🍪",
  "🍩",
  "🍫",
  "☕",
  "🍺",
  // Travel & Transport
  "✈️",
  "🏨",
  "🌍",
  "🗺️",
  "🚗",
  "🚘",
  "🚕",
  "🚌",
  "🚲",
  "⛽",
  // Fashion & Shopping
  "👗",
  "👠",
  "👜",
  "👔",
  "🛍️",
  "🛒",
  "🍎",
  "🥦",
  "💄",
  "💎",
  // Home & Rent
  "🏠",
  "🏢",
  "🔑",
  "🛌",
  "💡",
  "💧",
  // Bills & Payments
  "🧾",
  "📄",
  "📃",
  "💵",
  "💸",
  "💰",
  "💳",
  "🏧",
  "🏦",
  "🏦",
  // Work, Tech & Others
  "💼",
  "📈",
  "📉",
  "💹",
  "📱",
  "💻",
  "📷",
  "🔋",
  "⚙️",
  "🧱",
  // Health, Entertainment & Edu
  "💊",
  "🏥",
  "🏃",
  "🧘",
  "🎬",
  "🎮",
  "🎤",
  "📚",
  "🎓",
  "🎨",
  "🎹",
  "🎸",
];

export function CategoryModal({
  visible,
  onClose,
  isEditing = false,
  initialName = "",
  initialIcon = "📝",
  categoryId,
}: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState(initialName);
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const inputRef = useRef<TextInput>(null);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  // Reset form when modal opens/closes or initialName changes
  useEffect(() => {
    if (visible) {
      setCategoryName(initialName);
      setSelectedIcon(initialIcon || "📝");
      // Auto-focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400); // Delay to match modal animation
    }
  }, [visible, initialName, initialIcon]);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Category name cannot be empty",
      });
      return;
    }

    try {
      if (isEditing && categoryId) {
        await updateCategoryMutation.mutateAsync({
          id: categoryId,
          category: {
            title: categoryName.trim(),
            icon: selectedIcon,
          },
        });
      } else {
        await createCategoryMutation.mutateAsync({
          title: categoryName.trim(),
          color: "#00929A",
          icon: selectedIcon,
        });
      }

      onClose();
      setCategoryName("");

      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Category ${isEditing ? "updated" : "created"} successfully`,
        });
      }, 500);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    }
  };

  const handleClose = () => {
    setCategoryName("");
    onClose();
  };

  const isPending =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <BottomSheetModalWrapper
      visible={visible}
      title={isEditing ? "Rename Category" : "New Category"}
      onClose={handleClose}
      footer={
        <ApplyButton
          onApply={handleSave}
          applyDisabled={isPending}
          title={
            isPending
              ? isEditing
                ? "RENAMING..."
                : "ADDING..."
              : isEditing
                ? "RENAME CATEGORY"
                : "ADD NEW CATEGORY"
          }
        />
      }
    >
      <View className="flex-col gap-2">
        {/* Category name input */}
        <Text className="text-sm font-normal text-foreground">
          Category Name
        </Text>
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-12 h-12 bg-surface rounded-lg items-center justify-center border border-border">
            <Text className="text-2xl">{selectedIcon}</Text>
          </View>
          <TextInput
            ref={inputRef}
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="e.g. Travel, Utilities, Groceries"
            placeholderTextColor="#9ca3af"
            className="flex-1 bg-surface rounded-lg px-4 py-3 border border-border text-foreground"
            editable={!isPending}
            onSubmitEditing={handleSave}
          />
        </View>

        {/* Icon Selection */}
        <Text className="text-sm font-normal text-foreground">
          Icon (Emoji)
        </Text>
        <View className="bg-surface rounded-lg border border-border mb-1">
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ padding: 8 }}
          >
            <View className="flex-row gap-2">
              {COMMON_ICONS.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 items-center justify-center rounded-lg ${selectedIcon === icon ? "bg-primary/20 border border-primary" : "bg-background border border-border"}`}
                >
                  <Text className="text-2xl">{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </BottomSheetModalWrapper>
  );
}
