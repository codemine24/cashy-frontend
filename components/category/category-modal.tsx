import { useCreateCategory, useUpdateCategory } from "@/api/category";
import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

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
  "🍔", "🍕", "🍜", "🍲", "🍿", "🍪", "🍩", "🍫", "☕", "🍺",
  // Travel & Transport
  "✈️", "🏨", "🌍", "🗺️", "🚗", "🚘", "🚕", "🚌", "🚲", "⛽",
  // Fashion & Shopping
  "👗", "👠", "👜", "👔", "🛍️", "🛒", "🍎", "🥦", "💄", "💎",
  // Home & Rent
  "🏠", "🏢", "🔑", "🛌", "💡", "💧",
  // Bills & Payments
  "🧾", "📄", "📃", "💵", "💸", "💰", "💳", "🏧", "🏦", "🏦",
  // Work, Tech & Others
  "💼", "📈", "📉", "💹", "📱", "💻", "📷", "🔋", "⚙️", "🧱",
  // Health, Entertainment & Edu
  "💊", "🏥", "🏃", "🧘", "🎬", "🎮", "🎤", "📚", "🎓", "🎨", "🎹", "🎸"
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
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View className="px-6 pt-3 pb-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 border-b border-border pb-3">
          <Text className="text-xl font-bold text-foreground">
            {isEditing ? "Rename Category" : "New Category"}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            className="w-8 h-8 items-center justify-center"
          >
            <Text className="text-xl text-foreground">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Category name input */}
        <Text className="text-sm font-normal text-foreground mb-2">
          Category Name
        </Text>
        <View className="flex-row items-center gap-3 mb-4">
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
        <Text className="text-sm font-normal text-foreground mb-2">
          Icon (Emoji)
        </Text>
        <View className="bg-surface rounded-lg border border-border mb-6">
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

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isPending}
            className={`flex-1 rounded-lg py-3 items-center justify-center ${isPending ? "bg-primary/50" : "bg-primary"}`}
          >
            <Text
              className="text-primary-foreground font-semibold text-base"
              numberOfLines={1}
            >
              {isPending
                ? isEditing
                  ? "Renaming..."
                  : "Adding..."
                : isEditing
                  ? "RENAME CATEGORY"
                  : "+ ADD NEW CATEGORY"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}
