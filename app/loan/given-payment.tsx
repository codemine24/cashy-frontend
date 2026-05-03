import { useAddPayment, useUpdatePayment } from "@/api/loan";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { ChevronLeft } from "@/lib/icons";
import { formatDateToUTC, formatTimeToUTC } from "@/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    BackHandler,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function GivenPaymentScreen() {
  const router = useRouter();
  const keyboardOffset = useKeyboardOffset();
  const params = useLocalSearchParams<{
    loanId: string;
    paymentId?: string;
    amount?: string;
    remark?: string;
    editDate?: string;
    loanType?: string;
  }>();

  const [amount, setAmount] = useState(params.amount || "");
  const [remark, setRemark] = useState(params.remark || "");
  const [date, setDate] = useState(
    params.editDate ? new Date(params.editDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const amountInputRef = useRef<TextInput>(null);

  // Determine screen title and button text based on loan type
  const isLentLoan = params.loanType === "GIVEN";
  const screenTitle = isLentLoan
    ? "Increase Loan"
    : params.paymentId
      ? "Edit Payment"
      : "Pay Back";
  const submitButtonText = isLentLoan
    ? "Increase Loan"
    : params.paymentId
      ? "Update Payment"
      : "Pay Back";

  const addPaymentMutation = useAddPayment();
  const updatePaymentMutation = useUpdatePayment();

  const isEditing = !!params.paymentId;
  const isPending =
    addPaymentMutation.isPending || updatePaymentMutation.isPending;

  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = async () => {
    if (
      !amount.trim() ||
      isNaN(parseFloat(amount)) ||
      parseFloat(amount) <= 0
    ) {
      Toast.show({
        type: "error",
        text1: "Please enter a valid amount",
      });
      return;
    }

    try {
      let response: any;

      if (isEditing) {
        response = await updatePaymentMutation.mutateAsync({
          payment_id: params.paymentId!,
          amount: parseFloat(amount),
          remark: remark || undefined,
          date: formatDateToUTC(date),
          time: formatTimeToUTC(date),
          type: "GIVE",
        });
      } else {
        response = await addPaymentMutation.mutateAsync({
          loan_id: params.loanId,
          amount: parseFloat(amount),
          remark: remark || undefined,
          date: formatDateToUTC(date),
          time: formatTimeToUTC(date),
          type: "GIVE",
        });
      }

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2:
            response?.message ||
            (isEditing ? "Payment updated" : "Payment given"),
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to process payment",
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDate(selectedTime);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.back();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router]),
  );

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: screenTitle,
          headerBackTitle: "Back",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={keyboardOffset}
        style={{ flex: 1 }}
      >
        <View
          style={{ flex: 1 }}
          className={`bg-background ${keyboardOffset > 0 ? "pb-0" : "pb-8"}`}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Amount */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Amount <Text className="text-destructive">*</Text>
              </Text>
              <View
                className={`flex-row items-center rounded-xl px-4 py-3.5 border-2 border-border bg-card`}
              >
                <TextInput
                  ref={amountInputRef}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="decimal-pad"
                  className="flex-1 text-2xl font-bold text-foreground"
                />
              </View>
            </View>

            {/* Remark */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Remark
              </Text>
              <View
                className={`rounded-xl px-4 py-1 border-2 border-border bg-card`}
              >
                <TextInput
                  value={remark}
                  onChangeText={setRemark}
                  placeholder="Enter remark"
                  placeholderTextColor="#A1A1AA"
                  className="text-base text-foreground"
                  multiline
                />
              </View>
            </View>

            {/* Date */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Date
              </Text>
              <TouchableOpacity
                className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-foreground flex-1">
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Time
              </Text>
              <TouchableOpacity
                className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                onPress={() => setShowTimePicker(true)}
              >
                <Text className="text-foreground flex-1">
                  {date.toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <View className="mt-8">
              <Button
                onPress={handleAction}
                disabled={isPending}
                className="rounded-xl py-4 items-center justify-center w-full bg-destructive"
                activeOpacity={0.8}
              >
                <Text
                  className="text-white font-bold text-base tracking-wider text-center w-full"
                  numberOfLines={1}
                >
                  {isPending ? "Processing..." : submitButtonText}
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScreenContainer>
  );
}
