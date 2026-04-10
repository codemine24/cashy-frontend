import { useAddPayment, useUpdatePayment } from "@/api/loan";
import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { BottomSheetModal } from "../bottom-sheet-modal";
import { LoanPayment } from "@/interface/loan";

interface CreatePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  loanId: string;
  editPayment?: LoanPayment | null;
}

export function CreatePaymentModal({
  visible,
  onClose,
  loanId,
  editPayment,
}: CreatePaymentModalProps) {
  const [amount, setAmount] = useState(editPayment?.amount?.toString() || "");
  const [remark, setRemark] = useState(editPayment?.remark || "");
  const addPaymentMutation = useAddPayment();
  const updatePaymentMutation = useUpdatePayment();
  const amountInputRef = useRef<TextInput>(null);

  // Keep internal state synced when editPayment changes while open
  React.useEffect(() => {
    if (visible && editPayment) {
      setAmount(editPayment.amount?.toString() || "");
      setRemark(editPayment.remark || "");
    } else if (visible && !editPayment) {
      setAmount("");
      setRemark("");
    }
  }, [visible, editPayment]);

  // Focus input when modal opens
  React.useEffect(() => {
    if (visible) {
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 400); // Delay to match modal animation
    }
  }, [visible]);

  const handleAction = async () => {
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Please enter a valid amount",
      });
      return;
    }

    const isEdit = !!editPayment;
    try {
      let response: any;
      
      if (isEdit) {
        response = await updatePaymentMutation.mutateAsync({
          payment_id: editPayment.id,
          amount: parseFloat(amount),
          remark: remark || undefined,
        });
      } else {
        response = await addPaymentMutation.mutateAsync({
          loan_id: loanId,
          amount: parseFloat(amount),
          remark: remark || undefined,
        });
      }

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response?.message || (isEdit ? "Payment updated" : "Payment added"),
        });
        handleClose();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.message || "Failed to save payment",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    }
  };

  const handleClose = () => {
    setAmount("");
    setRemark("");
    onClose();
  };

  const isPending =
    addPaymentMutation.isPending || updatePaymentMutation.isPending;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View className="px-6 pt-3 pb-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 border-b border-border pb-3">
          <Text className="text-xl font-bold text-foreground">
            {editPayment ? "Edit Payment" : "Add New Payment"}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            className="w-8 h-8 items-center justify-center"
          >
            <Text className="text-xl text-foreground">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Amount input */}
        <Text className="text-sm font-normal text-foreground mb-2">
          Enter Amount
        </Text>
        <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-3">
          <Text className="text-xl font-bold text-primary mr-2">$</Text>
          <TextInput
            ref={amountInputRef}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-xl font-bold text-foreground"
            keyboardType="decimal-pad"
            editable={!isPending}
            onSubmitEditing={handleAction}
          />
        </View>

        {/* Remark input */}
        <Text className="text-sm font-normal text-foreground mb-2">
          Add a note (Optional)
        </Text>
        <TextInput
          value={remark}
          onChangeText={setRemark}
          placeholder="Add a note..."
          placeholderTextColor="#9ca3af"
          className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-3"
          editable={!isPending}
          onSubmitEditing={handleAction}
        />

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleAction}
            disabled={isPending}
            className={`flex-1 rounded-lg py-3 items-center justify-center ${isPending ? "bg-primary/50" : "bg-primary"}`}
          >
            <Text className="text-primary-foreground font-semibold text-base">
              {isPending
                ? editPayment
                  ? "Updating..."
                  : "Adding..."
                : editPayment
                  ? "+ UPDATE PAYMENT"
                  : "+ ADD PAYMENT"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}
