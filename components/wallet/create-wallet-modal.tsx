import { useCreateBook, useUpdateBook } from "@/api/wallet";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { BottomSheetModal } from "../bottom-sheet-modal";

interface CreateBookModalProps {
  visible: boolean;
  onClose: () => void;
  editBook?: { id: string; name: string } | null;
}

export function CreateWalletModal({
  visible,
  onClose,
  editBook,
}: CreateBookModalProps) {
  const [bookName, setBookName] = useState(editBook?.name || "");
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();

  // Keep internal state synced when editBook changes while open
  React.useEffect(() => {
    if (visible && editBook) {
      setBookName(editBook.name);
    } else if (visible && !editBook) {
      setBookName("");
    }
  }, [visible, editBook]);

  const handleAction = async () => {
    if (!bookName.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter a wallet name",
      });
      return;
    }
    const isEdit = !!editBook;
    try {
      if (isEdit) {
        await updateBookMutation.mutateAsync({
          id: editBook.id,
          name: bookName.trim(),
        });
      } else {
        await createBookMutation.mutateAsync(bookName.trim());
      }

      setBookName("");
      onClose();

      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Wallet ${isEdit ? "updated" : "created"} successfully`,
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
    setBookName("");
    onClose();
  };

  const isPending =
    createBookMutation.isPending || updateBookMutation.isPending;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-foreground">
              {editBook ? "Rename Wallet" : "New Wallet"}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Book name input */}
          <Text className="text-sm font-semibold text-foreground mb-2">
            Wallet name
          </Text>
          <TextInput
            value={bookName}
            onChangeText={setBookName}
            placeholder="e.g., January Expenses"
            placeholderClassName="text-muted-foreground"
            className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-8"
            autoFocus
            editable={!isPending}
            onSubmitEditing={handleAction}
          />

          {/* Action buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              disabled={isPending}
              className="flex-1 bg-surface rounded-lg py-3 border border-border items-center justify-center disabled:bg-muted-foreground"
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAction}
              disabled={isPending}
              className={`flex-1 rounded-lg py-3 items-center justify-center ${isPending ? "bg-primary/50" : "bg-primary"}`}
            >
              <Text className="text-white font-semibold">
                {isPending
                  ? editBook
                    ? "Renaming..."
                    : "Creating..."
                  : editBook
                    ? "Rename"
                    : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}
