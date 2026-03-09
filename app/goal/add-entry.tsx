import { useCreateGoalTransaction, useUpdateGoalTransaction } from "@/api/goal-transaction";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AddGoalEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    goalId: string;
    type: string;
    editId?: string;
    editAmount?: string;
    editRemark?: string;
    editType?: string;
  }>();

  const goalId = params.goalId!;
  const initialType = (params.type || params.editType) as "IN" | "OUT";
  const entryType = initialType || "IN";
  const isEditing = !!params.editId;

  const createGoalTransactionMutation = useCreateGoalTransaction();
  const updateGoalTransactionMutation = useUpdateGoalTransaction();

  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setAmount(params.editAmount || "");
      setRemark(params.editRemark || "");
    }
  }, [isEditing, params.editAmount, params.editRemark]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const isAdd = entryType === "IN";
  const accentTextClass = isAdd ? "text-primary" : "text-destructive";
  const accentBgClass = isAdd ? "bg-primary/5" : "bg-destructive/5";
  const accentBorderClass = isAdd ? "border-primary/20" : "border-destructive/20";
  const btnClassMap = isAdd ? "bg-primary" : "bg-destructive";
  const screenTitle = isEditing ? "Edit Entry" : isAdd ? "Add Funds" : "Withdraw Funds";

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const payload = {
      goal_id: isEditing ? undefined : goalId,
      type: entryType,
      amount: parsed,
      remark: remark || undefined,
      date: formatDate(date),
      time: formatTime(date),
    };

    try {
      let response: any;
      if (isEditing) {
        response = await updateGoalTransactionMutation.mutateAsync({
          id: params.editId!,
          transaction: payload,
        });
      } else {
        response = await createGoalTransactionMutation.mutateAsync(payload);
      }

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response?.message,
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.message || "Something went wrong",
        });
      }
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to save entry";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    }
  };

  const isPending = createGoalTransactionMutation.isPending || updateGoalTransactionMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: screenTitle,
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Type Toggle */}
          {/* <View className="flex-row gap-3 my-6 bg-gray-100 rounded-2xl p-1.5">
            <TouchableOpacity
              onPress={() => setEntryType("IN")}
              className={cn(
                "flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl",
                isAdd ? "bg-white shadow-sm" : "bg-transparent",
              )}
            >
              <PlusCircle
                size={20}
                color={isAdd ? colors.primary : colors.muted}
              />
              <Text
                className={cn(
                  "text-sm font-bold",
                  isAdd ? "text-gray-900" : "text-gray-500",
                )}
              >
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEntryType("OUT")}
              className={cn(
                "flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl",
                !isAdd ? "bg-white shadow-sm" : "bg-transparent",
              )}
            >
              <MinusCircle
                size={20}
                color={!isAdd ? colors.error : colors.muted}
              />
              <Text
                className={cn(
                  "text-sm font-bold",
                  !isAdd ? "text-gray-900" : "text-gray-500",
                )}
              >
                Withdraw
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Amount
            </Text>
            <View
              className={`flex-row items-center rounded-2xl px-5 py-4 border-2 ${accentBorderClass} ${accentBgClass}`}
            >
              <Text className={`text-3xl font-bold ${accentTextClass}`}>
                $
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#A1A1AA"
                keyboardType="decimal-pad"
                className={`flex-1 ml-3 text-3xl font-bold ${accentTextClass}`}
                autoFocus={true}
              />
            </View>
          </View>

          {/* Remark */}
          <View className="mb-6 mt-6">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Note (optional)
            </Text>
            <TextInput
              value={remark}
              onChangeText={setRemark}
              placeholder={
                isAdd
                  ? "e.g., Monthly savings, Bonus..."
                  : "e.g., Emergency withdrawal..."
              }
              placeholderTextColor="#A1A1AA"
              className="bg-card border border-border rounded-xl px-5 py-4 text-foreground text-lg"
              style={{ textAlignVertical: "top", minHeight: 120 }}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Date & Time */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Date & Time
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-1 bg-card rounded-xl px-5 py-4 border border-border flex-row items-center justify-between"
              >
                <Text className="text-foreground text-base">
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="flex-1 bg-card rounded-xl px-5 py-4 border border-border flex-row items-center justify-between"
              >
                <Text className="text-foreground text-base">
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (selectedTime) {
                    setDate(selectedTime);
                  }
                }}
              />
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-5 py-3 bg-background border-t border-border">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className={`rounded-xl py-4 items-center justify-center ${btnClassMap} ${isPending ? "opacity-50" : "opacity-100"}`}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base tracking-wider">
              {isPending
                ? "SAVING..."
                : isAdd
                  ? "SAVE ADDITION"
                  : "SAVE WITHDRAWAL"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
