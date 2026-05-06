import { useTransferTransaction } from "@/api/transaction";
import { useWallet, useWallets } from "@/api/wallet";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import WalletSelectorModal from "@/components/wallet/wallet-selector-modal";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { ChevronLeft, ChevronRight } from "@/lib/icons";
import { formatDateToUTC, formatTimeToUTC } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
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
import { z } from "zod";

// ─── Validation Schema ───────────────────────────────────────────────────────
const transferSchema = z.object({
  amount: z
    .string({ message: "Amount is required" })
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  to_wallet_id: z
    .string({ message: "Please select a destination wallet" })
    .min(1, "Please select a destination wallet"),
  remark: z.string().optional(),
  category_id: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

// ─── Component ───────────────────────────────────────────────────────────────
export default function TransferTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    walletId: string;
    selectedCategoryId?: string;
    selectedCategoryName?: string;
  }>();
  const { walletId, selectedCategoryId, selectedCategoryName } = params;
  const keyboardOffset = useKeyboardOffset();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [category, setCategory] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const { data: wallet, isLoading: walletLoading } = useWallet(walletId);
  const { data: wallets } = useWallets();
  const insets = useSafeAreaInsets();
  const isKeyboardVisible = useKeyboardVisible();
  const transferMutation = useTransferTransaction();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      date: formatDateToUTC(new Date()),
      time: formatTimeToUTC(new Date()),
    },
  });

  const watchedAmount = watch("amount");
  const [isAmountValid, setIsAmountValid] = useState(true);

  // Memoize wallet balance to avoid unnecessary conversions
  const walletBalance = useMemo(() => {
    return wallet?.data.balance
      ? parseFloat(wallet.data.balance.toString())
      : 0;
  }, [wallet?.data.balance]);

  // Validate amount against wallet balance with optimized dependencies
  useEffect(() => {
    if (!watchedAmount || walletBalance <= 0) {
      setIsAmountValid(true);
      return;
    }

    const amount = parseFloat(watchedAmount);

    if (isNaN(amount)) {
      setIsAmountValid(false);
      return;
    }

    if (amount > walletBalance) {
      setError("amount", {
        message: `Amount cannot exceed available balance of ${walletBalance}`,
      });
      setIsAmountValid(false);
    } else {
      clearErrors("amount");
      setIsAmountValid(true);
    }
  }, [watchedAmount, walletBalance, setError, clearErrors]);

  const watchedToWallet = watch("to_wallet_id");

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      if (isDirty) {
        Alert.alert(
          "Discard Changes",
          "You have unsaved changes. Are you sure you want to go back?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => router.back(),
            },
          ],
        );
        return true;
      }
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [isDirty, router]);

  // Handle category selection from params
  useEffect(() => {
    if (selectedCategoryId && selectedCategoryName) {
      setCategory(selectedCategoryId);
      setCategoryName(selectedCategoryName);
      setValue("category_id", selectedCategoryId);
    }
  }, [selectedCategoryId, selectedCategoryName, setValue]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setValue("date", formatDateToUTC(selectedDate));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setValue("time", formatTimeToUTC(selectedTime));
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    try {
      const payload = {
        from_wallet_id: walletId!,
        to_wallet_id: data.to_wallet_id,
        amount: parseFloat(data.amount),
        remark: data.remark,
        category_id: data.category_id,
        date: data.date,
        time: data.time,
      };

      const res = await transferMutation.mutateAsync(payload);

      if (res?.success) {
        Toast.show({
          type: "success",
          text1: "Transfer Successful",
          text2: res.message,
        });

        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Transfer Failed",
        text2: error?.message || "Failed to transfer amount. Please try again.",
      });
    }
  };

  if (walletLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <Text className="text-foreground">Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <View className="flex-1 border-t border-border">
        <Stack.Screen
          options={{
            headerShown: true,
            animation: "simple_push",
            title: "Transfer Fund",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginRight: 4 }}
              >
                <ChevronLeft size={24} className="text-foreground" />
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
                // paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="px-5">
                {/* From Wallet */}
                <View className="mb-5 mt-2">
                  <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    From Wallet
                  </Text>
                  <View className="bg-primary/5 border-l-4 border-primary rounded-lg px-4 py-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-foreground font-semibold text-base">
                          {wallet?.data.name}
                        </Text>
                        <Text className="text-muted-foreground text-sm mt-1">
                          Available Balance
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-foreground font-bold text-2xl">
                          {wallet?.data.balance}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* To Wallet */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    To Wallet <Text className="text-destructive">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                    onPress={() => setShowWalletSelector(true)}
                  >
                    <Text
                      className={`flex-1 ${watchedToWallet ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {watchedToWallet && wallets?.data
                        ? wallets.data.find((w) => w.id === watchedToWallet)
                            ?.name || "Selected Wallet"
                        : "Select destination wallet"}
                    </Text>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                  {errors.to_wallet_id && (
                    <InputError error={errors.to_wallet_id.message} />
                  )}
                </View>

                {/* Amount */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Amount <Text className="text-destructive">*</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <View
                          className={`flex-row items-center rounded-xl px-4 py-3.5 border-2 border-border bg-card ${errors.amount ? "border-destructive" : ""}`}
                        >
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="0.00"
                            placeholderTextColor="#A1A1AA"
                            keyboardType="decimal-pad"
                            className="flex-1 text-2xl font-bold text-foreground"
                          />
                        </View>
                        {errors.amount && (
                          <InputError error={errors.amount.message} />
                        )}
                      </View>
                    )}
                  />
                </View>

                {/* Category */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Category
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                    onPress={() => {
                      router.push({
                        pathname: "/wallet/select-category",
                        params: {
                          walletId: walletId,
                          type: "transfer",
                          source: "transfer",
                          currentSelectedId: category,
                          currentAmount: watch("amount"),
                          currentRemark: watch("remark"),
                          currentDate: selectedDate.toISOString(),
                        },
                      });
                    }}
                  >
                    <Text
                      className={`flex-1 ${categoryName ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {categoryName || "Select a category"}
                    </Text>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                  {errors.category_id && (
                    <InputError error={errors.category_id.message} />
                  )}
                </View>

                <View className="mb-5 flex-row items-center gap-5">
                  {/* Date */}
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Date
                    </Text>
                    <TouchableOpacity
                      className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text className="text-foreground flex-1">
                        {selectedDate.toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Time */}
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      Time
                    </Text>
                    <TouchableOpacity
                      className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text className="text-foreground flex-1">
                        {selectedDate.toLocaleTimeString()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remark */}
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Remark
                  </Text>
                  <Controller
                    control={control}
                    name="remark"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <View
                          className={`rounded-xl px-4 py-1 border-2 border-border bg-card ${errors.remark ? "border-destructive" : ""}`}
                        >
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="Enter remark"
                            placeholderTextColor="#A1A1AA"
                            className="text-base text-foreground"
                            style={{ textAlignVertical: "top", minHeight: 80 }}
                            multiline
                            numberOfLines={3}
                          />
                        </View>
                        {errors.remark && (
                          <InputError error={errors.remark.message} />
                        )}
                      </View>
                    )}
                  />
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Submit Button */}
          <View
            className="px-5 pt-3 pb-2 mt-8 bg-background border-t border-border"
            style={{
              marginBottom: isKeyboardVisible ? 0 : Math.min(insets.bottom, 20),
            }}
          >
            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={transferMutation.isPending || !isAmountValid}
              className="w-full"
            >
              <Text className="text-primary-foreground font-medium">
                {transferMutation.isPending ? "Transferring..." : "Transfer"}
              </Text>
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal
        visible={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onApply={(walletId) => {
          setValue("to_wallet_id", walletId);
          setShowWalletSelector(false);
        }}
        excludeWalletId={walletId}
        selectedWalletId={watchedToWallet}
      />

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScreenContainer>
  );
}
