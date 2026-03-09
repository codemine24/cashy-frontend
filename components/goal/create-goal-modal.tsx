import { useCreateGoal, useUpdateGoal } from "@/api/goal";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  editGoal?: { id: string; name: string; target_amount: number } | null;
}

export function CreateGoalModal({ visible, onClose, editGoal }: CreateGoalModalProps) {
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  React.useEffect(() => {
    if (visible && editGoal) {
      setName(editGoal.name);
      setTarget(editGoal.target_amount.toString());
    } else if (visible && !editGoal) {
      setName("");
      setTarget("");
    }
  }, [visible, editGoal]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }
    const targetAmount = parseFloat(target);
    if (!target || isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert("Error", "Please enter a valid target amount");
      return;
    }

    const isEdit = !!editGoal;
    try {
      if (isEdit) {
        // useUpdateGoal only updates name in api/goal.ts
        await updateGoalMutation.mutateAsync({
          id: editGoal.id,
          name: name.trim()
        });
      } else {
        await createGoalMutation.mutateAsync({
          name: name.trim(),
          target_amount: targetAmount,
        });
      }
      setName("");
      setTarget("");
      onClose();

      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Goal ${isEdit ? "updated" : "created"} successfully`
        })
      }, 100);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || `Goal ${isEdit ? "update" : "creation"} failed`
      })
    }
  };

  const isPending = createGoalMutation.isPending || updateGoalMutation.isPending;

  const handleClose = () => {
    setName("");
    setTarget("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="mt-auto bg-background rounded-t-3xl p-6"
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">
                {editGoal ? "Edit Goal" : "New Goal"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Text className="text-xl text-foreground">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Goal name */}
            <Text className="text-sm font-semibold text-foreground mb-2">
              Goal name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Emergency Fund"
              placeholderTextColor="#A1A1AA"
              className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-4"
              autoFocus
              editable={!isPending}
            />

            {/* Target amount */}
            <Text className="text-sm font-semibold text-foreground mb-2">
              Target amount {editGoal && "(Cannot be edited)"}
            </Text>
            <View className={`flex-row items-center rounded-lg px-4 py-3 border border-border mb-8 ${editGoal ? "bg-card" : "bg-surface"}`}>
              <Text className="text-2xl font-bold text-primary">$</Text>
              <TextInput
                value={target}
                onChangeText={setTarget}
                placeholder="0.00"
                placeholderTextColor="#A1A1AA"
                keyboardType="decimal-pad"
                className="flex-1 ml-2 text-2xl font-bold text-foreground"
                editable={!editGoal && !isPending}
                onSubmitEditing={handleCreate}
              />
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClose}
                disabled={isPending}
                className="flex-1 bg-surface rounded-lg py-3 border border-border items-center justify-center disabled:opacity-50"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={isPending}
                className={`flex-1 rounded-lg py-3 items-center justify-center ${isPending ? "bg-primary/50" : "bg-primary"}`}
              >
                <Text className="text-background font-semibold">
                  {isPending ? "Saving..." : editGoal ? "Save" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}