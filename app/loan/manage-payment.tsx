import { useAddPayment, useUpdatePayment } from "@/api/loan";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { ChevronLeft } from "@/lib/icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ManagePaymentScreen() {
  const router = useRouter();
  const keyboardOffset = useKeyboardOffset();
  const isKeyboardVisible = useKeyboardVisible();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    loanId: string;
    paymentId?: string;
    amount?: string;
    remark?: string;
  }>();

  const [amount, setAmount] = useState(params.amount || "");
  const [remark, setRemark] = useState(params.remark || "");
  const amountInputRef = useRef<TextInput>(null);

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
        });
      } else {
        response = await addPaymentMutation.mutateAsync({
          loan_id: params.loanId,
          amount: parseFloat(amount),
          remark: remark || undefined,
        });
      }

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2:
            response?.message ||
            (isEditing ? "Payment updated" : "Payment added"),
        });
        router.back();
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

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate(`/loan/${params.loanId}`);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [params.loanId, router]),
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? "Edit Payment" : "Add Payment",
          animation: "none",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate(`/loan/${params.loanId}`)}
              style={{ marginRight: 8 }}
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
          className={`bg-background ${isKeyboardVisible ? "pb-0" : "pb-8"}`}
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
            {/* Amount input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Amount
              </Text>
              <View className="flex-row items-center rounded-xl px-4 py-3.5 border-2 border-green-600/30 bg-green-600/10">
                <TextInput
                  ref={amountInputRef}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#A1A1AA"
                  className="flex-1 text-2xl font-bold text-green-600"
                  keyboardType="decimal-pad"
                  editable={!isPending}
                />
              </View>
            </View>

            {/* Remark input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Note (Optional)
              </Text>
              <TextInput
                value={remark}
                onChangeText={setRemark}
                placeholder="What is this for?"
                placeholderTextColor="#A1A1AA"
                className="bg-card rounded-xl px-4 py-3.5 border border-border text-foreground text-base"
                editable={!isPending}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>

        {/* Action button */}
        <View
          style={{ marginBottom: Math.max(insets.bottom, 20) }}
          className="px-5 pt-2"
        >
          <TouchableOpacity
            onPress={handleAction}
            disabled={isPending}
            className={`rounded-xl py-4 items-center justify-center w-full bg-primary ${isPending ? "opacity-50" : "opacity-100"}`}
            activeOpacity={0.8}
          >
            <Text
              className="text-white font-bold text-base tracking-wider text-center w-full uppercase"
              numberOfLines={1}
            >
              {isPending
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                  ? "Update Payment"
                  : "Add Payment"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
