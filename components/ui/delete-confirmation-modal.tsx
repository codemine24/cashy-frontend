import { Button } from "@/components/ui/button";
import { H3, Muted } from "@/components/ui/typography";
import { CrossIcon } from "@/icons/cross-icon";
import { Modal, TouchableOpacity, View } from "react-native";

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-background rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <H3 className="flex-1">{title || "Delete Item"}</H3>
            <TouchableOpacity
              onPress={onClose}
              className="p-1"
            >
              <CrossIcon className="size-4 text-foreground" />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Muted className="mb-6">
            {message || itemName
              ? `Are you sure you want to delete "${itemName}"?`
              : "Are you sure you want to delete this item? This action cannot be undone."}
          </Muted>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Button
              onPress={onClose}
              className="flex-1"
              variant="outline"
            >
              <View className="flex-row items-center justify-center">
                <Muted className="text-foreground font-medium">{cancelText}</Muted>
              </View>
            </Button>

            <Button
              onPress={handleConfirm}
              className="flex-1 bg-destructive"
              disabled={isLoading}
            >
              <View className="flex-row items-center justify-center">
                <Muted className="text-white font-medium">
                  {isLoading ? "Deleting..." : confirmText}
                </Muted>
              </View>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
