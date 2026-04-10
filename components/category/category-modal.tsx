import { useCreateCategory, useUpdateCategory } from "@/api/category";
import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialName?: string;
  categoryId?: string;
}

export function CategoryModal({
  visible,
  onClose,
  isEditing = false,
  initialName = "",
  categoryId,
}: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState(initialName);
  const inputRef = useRef<TextInput>(null);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  // Reset form when modal opens/closes or initialName changes
  useEffect(() => {
    if (visible) {
      setCategoryName(initialName);
      // Auto-focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400); // Delay to match modal animation
    }
  }, [visible, initialName]);

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
          category: { title: categoryName.trim() },
        });
      } else {
        await createCategoryMutation.mutateAsync({
          title: categoryName.trim(),
          color: "#00929A",
          icon: "",
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
        <TextInput
          ref={inputRef}
          value={categoryName}
          onChangeText={setCategoryName}
          placeholder="e.g. Travel, Utilities, Groceries"
          placeholderTextColor="#9ca3af"
          className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-3"
          editable={!isPending}
          onSubmitEditing={handleSave}
        />

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isPending}
            className={`flex-1 rounded-lg py-3 items-center justify-center ${isPending ? "bg-primary/50" : "bg-primary"}`}
          >
            <Text className="text-primary-foreground font-semibold text-base">
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
