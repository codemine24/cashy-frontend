import { useCreateBook, useUpdateBook } from "@/api/wallet";
import React, { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import ApplyButton from "../ui/modal/apply-button";
import BottomSheetModalWrapper from "../ui/modal/bottom-sheet-modal-wrapper";

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
  const inputRef = useRef<TextInput>(null);

  // Keep internal state synced when editBook changes while open
  React.useEffect(() => {
    if (visible && editBook) {
      setBookName(editBook.name);
    } else if (visible && !editBook) {
      setBookName("");
    }
  }, [visible, editBook]);

  // Focus input when modal opens
  React.useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400); // Delay to match modal animation
    }
  }, [visible]);

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
    <BottomSheetModalWrapper
      visible={visible}
      title={editBook ? "Rename Wallet" : "Add New Wallet"}
      onClose={handleClose}
      footer={
        <ApplyButton
          onApply={handleAction}
          applyDisabled={isPending}
          title={
            isPending
              ? "PENDING..."
              : editBook
                ? "RENAME WALLET"
                : "ADD NEW WALLET"
          }
        />
      }
    >
      <View>
        <View className="flex-col gap-2">
          {/* Book name input */}
          <Text className="text-sm font-normal text-foreground">
            Enter Wallet Name
          </Text>
          <TextInput
            ref={inputRef}
            value={bookName}
            onChangeText={setBookName}
            placeholder="e.g., January Expenses"
            placeholderTextColor="#9ca3af"
            className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground   mb-1"
            editable={!isPending}
            onSubmitEditing={handleAction}
          />
        </View>
      </View>
    </BottomSheetModalWrapper>
  );
}
