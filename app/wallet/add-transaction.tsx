import { useCreateTransaction, useUpdateTransaction } from "@/api/transaction";
import { ScreenContainer } from "@/components/screen-container";
import { InputError } from "@/components/ui/input-error";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { ChevronLeft, ChevronRight, Paperclip, X } from "@/lib/icons";
import { formatDateToUTC, formatTimeToUTC } from "@/utils";
import { makeImageUrl } from "@/utils/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  BackHandler,
  Image,
  InteractionManager,
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface PickedFile {
  uri: string;
  name: string;
  type: string;
  isExisting?: boolean;
}

// ─── Validation Schema ───────────────────────────────────────────────────────
const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AddTransactionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookId: string;
    type: string;
    editId?: string;
    editAmount?: string;
    editRemark?: string;
    editType?: string;
    editCategoryId?: string;
    editCategoryName?: string;
    editDate?: string;
    editTime?: string;
    selectedCategoryId?: string;
    selectedCategoryName?: string;
    currentAmount?: string;
    currentRemark?: string;
    currentDate?: string;
    attachments?: string | string[];
    currentAttachments?: string;
  }>();

  const bookId = params.bookId!;
  const initialType = (params.type as "IN" | "OUT") || "OUT";
  const isEditing = !!params.editId;

  const keyboardOffset = useKeyboardOffset();
  const isKeyboardVisible = useKeyboardVisible();

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const [type, setType] = useState<"IN" | "OUT">(initialType);

  useFocusEffect(
    React.useCallback(() => {
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
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [attachments, setAttachments] = useState<PickedFile[]>([]);
  const amountInputRef = useRef<TextInput>(null);

  // Form setup
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      date: date.toISOString(),
      time: date.toTimeString(),
    },
    mode: "onBlur",
  });

  useEffect(() => {
    // Populate fields from params (used for both Edit and Duplicate)
    if (params.editType) setType(params.editType as "IN" | "OUT");

    // Handle amount - prioritize editAmount for editing, otherwise use currentAmount
    if (params.editAmount) {
      setAmount(params.editAmount);
      form.setValue("amount", params.editAmount);
    } else if (params.currentAmount) {
      setAmount(params.currentAmount);
      form.setValue("amount", params.currentAmount);
    }

    if (params.editRemark) {
      setRemark(params.editRemark);
    } else if (params.currentRemark) {
      setRemark(params.currentRemark);
    }

    if (params.editCategoryId) {
      setSelectedCategory(params.editCategoryId);
      setSelectedCategoryName(params.editCategoryName || "Unknown Category");
    }

    // Handle date - use editDate parameter which contains the full timestamp
    if (params.editDate) {
      const transactionDate = new Date(params.editDate);
      setDate(transactionDate);
      form.setValue("date", transactionDate.toISOString());
      form.setValue("time", transactionDate.toTimeString());
    } else if (params.currentDate) {
      const transactionDate = new Date(params.currentDate);
      setDate(transactionDate);
      form.setValue("date", transactionDate.toISOString());
      form.setValue("time", transactionDate.toTimeString());
    }

    // Handle selectedCategoryId (for other use cases)
    if (params.selectedCategoryId !== undefined) {
      setSelectedCategory(params.selectedCategoryId);
      setSelectedCategoryName(params.selectedCategoryName || "");
    }

    // Handle restoration of session attachments (when returning from category selection)
    if (params.currentAttachments) {
      try {
        const restored: PickedFile[] = JSON.parse(params.currentAttachments);
        setAttachments(restored);
      } catch (e) {
        console.error("Failed to restore currentAttachments", e);
      }
    } else if (params.attachments) {
      // Handle initial population from API (when editing)
      const raw = params.attachments;
      const list = Array.isArray(raw) ? raw : raw.split(",");
      const existingAttachments: PickedFile[] = list.map((filename) => ({
        uri: makeImageUrl(filename, "general"),
        name: filename,
        type: "image/jpeg", // Assume image/jpeg for UI display, actual type doesn't matter for existing files
        isExisting: true,
      }));
      setAttachments(existingAttachments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.editType,
    params.editAmount,
    params.currentAmount,
    params.editDate,
    params.currentDate,
    params.editCategoryId,
    params.editRemark,
    params.currentRemark,
    params.selectedCategoryId,
    params.selectedCategoryName,
    params.attachments,
    params.currentAttachments,
  ]);

  useEffect(() => {
    const interaction = InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    });

    return () => interaction.cancel();
  }, []);

  // ── Attachment picker ──────────────────────────────────────────────────────
  const pickAttachments = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to add attachments.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked: PickedFile[] = result.assets.map((asset) => {
        const ext = asset.uri.split(".").pop() ?? "jpg";
        const name = asset.fileName ?? `attachment_${Date.now()}.${ext}`;
        const type = asset.mimeType ?? `image/${ext}`;
        return { uri: asset.uri, name, type };
      });
      setAttachments((prev) => [...prev, ...picked]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Build FormData ─────────────────────────────────────────────────────────
  const buildFormData = (isUpdate = false) => {
    const dataPayload = isUpdate
      ? {
          amount: parseFloat(amount),
          category_id: !isDeposit
            ? selectedCategory === "other" || !selectedCategory
              ? undefined
              : selectedCategory
            : undefined,
          remark,
          date: formatDateToUTC(date),
          time: formatTimeToUTC(date),
          attachment: attachments
            .filter((a) => a.isExisting)
            .map((a) => a.name),
        }
      : {
          book_id: bookId,
          type,
          amount: parseFloat(amount),
          category_id: !isDeposit
            ? selectedCategory === "other" || !selectedCategory
              ? undefined
              : selectedCategory
            : undefined,
          remark,
          date: formatDateToUTC(date),
          time: formatTimeToUTC(date),
        };

    const formData = new FormData();
    formData.append("data", JSON.stringify(dataPayload));

    attachments
      .filter((file) => !file.isExisting)
      .forEach((file) => {
        formData.append("attachments", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

    return formData;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const isDeposit = type === "IN";

  const accentTextClass = isDeposit ? "text-success" : "text-destructive";
  const accentBgClassMap = isDeposit ? "bg-success/10" : "bg-destructive/10";
  const accentBorderClassMap = isDeposit
    ? "border-success/30"
    : "border-destructive/30";

  const btnClassMap = isDeposit ? "bg-success" : "bg-destructive";

  const screenTitle = isEditing
    ? "Edit Transaction"
    : isDeposit
      ? "Cash In"
      : "Cash Out";

  const handleSubmit = async () => {
    try {
      let response: any;

      if (isEditing) {
        response = await updateTransactionMutation.mutateAsync({
          id: params.editId!,
          formData: buildFormData(true),
        });
      } else {
        response = await createTransactionMutation.mutateAsync(buildFormData());
      }
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response?.message,
      });

      router.replace(`/wallet/${bookId}` as any);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    }
  };

  const isPending =
    createTransactionMutation.isPending || updateTransactionMutation.isPending;

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <View className="flex-1 border-t border-border">
        <Stack.Screen
          options={{
            headerShown: true,
            title: screenTitle,
            animation: "none",
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
              {/* Amount Input */}
              <View className="mb-5 mt-4">
                <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Amount
                </Text>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <View
                        className={`flex-row items-center rounded-xl px-4 py-3.5 border-2 ${accentBorderClassMap} ${accentBgClassMap} ${form.formState.errors.amount ? "border-destructive" : ""}`}
                      >
                        <TextInput
                          value={value}
                          onChangeText={(text) => {
                            onChange(text);
                            setAmount(text);
                          }}
                          onBlur={onBlur}
                          placeholder="0.00"
                          placeholderTextColor="#A1A1AA"
                          keyboardType="decimal-pad"
                          className={`flex-1 text-2xl font-bold ${accentTextClass}`}
                          ref={amountInputRef}
                        />
                      </View>
                      <InputError
                        error={form.formState.errors.amount?.message}
                      />
                    </View>
                  )}
                />
              </View>

              {/* Category (only for Cash Out) */}
              {!isDeposit && (
                <View className="mb-5">
                  <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: "/wallet/select-category",
                        params: {
                          bookId: bookId,
                          type: type,
                          currentSelectedId: selectedCategory,
                          currentAmount: amount,
                          currentRemark: remark,
                          currentDate: date.toISOString(),
                          // Pass edit parameters if in edit mode
                          editId: params.editId,
                          editAmount: params.editAmount,
                          editRemark: params.editRemark,
                          editType: params.editType,
                          editCategoryId: params.editCategoryId,
                          editCategoryName: params.editCategoryName,
                          editDate: params.editDate,
                          editTime: params.editTime,
                          attachments: params.attachments,
                          currentAttachments: JSON.stringify(attachments),
                        },
                      });
                    }}
                    className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                  >
                    <Text
                      className={`flex-1 text-base ${selectedCategoryName ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {selectedCategoryName || "Select a category"}
                    </Text>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Remark */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Remark
                </Text>
                <TextInput
                  value={remark}
                  onChangeText={setRemark}
                  placeholder={
                    isDeposit
                      ? "e.g., Salary, Business income..."
                      : "e.g., Lunch, Uber ride..."
                  }
                  placeholderTextColor="#A1A1AA"
                  className="bg-card rounded-xl px-4 py-3.5 border border-border text-foreground text-base"
                  style={{ textAlignVertical: "top", minHeight: 80 }}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Date & Time */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Date & Time
                </Text>
                <View className="flex-row gap-3">
                  <Controller
                    control={form.control}
                    name="date"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-1">
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                          className={`flex-1 bg-card rounded-xl px-4 py-3.5 border flex-row items-center justify-between ${form.formState.errors.date ? "border-destructive" : "border-border"}`}
                        >
                          <Text className="text-foreground text-base font-medium">
                            {date.toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                        <InputError
                          error={form.formState.errors.date?.message}
                        />
                      </View>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="time"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-1">
                        <TouchableOpacity
                          onPress={() => setShowTimePicker(true)}
                          className={`flex-1 bg-card rounded-xl px-4 py-3.5 border flex-row items-center justify-between ${form.formState.errors.time ? "border-destructive" : "border-border"}`}
                        >
                          <Text className="text-foreground text-base font-medium">
                            {date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </TouchableOpacity>
                        <InputError
                          error={form.formState.errors.time?.message}
                        />
                      </View>
                    )}
                  />
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        form.setValue("date", selectedDate.toISOString());
                        form.setValue("time", selectedDate.toTimeString());
                      }
                    }}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(false);
                      if (selectedTime) {
                        setDate(selectedTime);
                        form.setValue("date", selectedTime.toISOString());
                        form.setValue("time", selectedTime.toTimeString());
                      }
                    }}
                  />
                )}
              </View>

              {/* ── Attachments ── */}
              <View className="mb-5 pb-24">
                <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Attachments
                </Text>

                {/* Thumbnail strip */}
                {attachments.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 10 }}
                  >
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {attachments.map((file, index) => (
                        <View
                          key={index}
                          style={{ position: "relative", marginRight: 4 }}
                        >
                          <Image
                            source={{ uri: file.uri }}
                            className="w-[72px] h-[72px] rounded-xl bg-muted"
                          />
                          {/* Remove button */}
                          <TouchableOpacity
                            onPress={() => removeAttachment(index)}
                            className="absolute -top-1.5 -right-1.5 bg-card rounded-xl p-0.5 shadow-sm border border-border"
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <X size={14} className="text-muted-foreground" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {/* Pick button */}
                <TouchableOpacity
                  onPress={pickAttachments}
                  className="flex-row items-center gap-2 bg-card border border-border rounded-xl px-4 py-3.5"
                >
                  <Paperclip size={18} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-base font-medium">
                    {attachments.length > 0
                      ? `${attachments.length} file${attachments.length > 1 ? "s" : ""} selected — tap to add`
                      : "Tap to add attachments"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Submit Button - Sticks above keyboard */}
          <View
            className="px-5 pt-3 pb-2 bg-background border-t border-border"
            style={{
              marginBottom: isKeyboardVisible ? 0 : Math.min(insets.bottom, 20),
            }}
          >
            <TouchableOpacity
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isPending}
              className={`rounded-xl py-4 items-center justify-center w-full ${btnClassMap} ${isPending ? "opacity-50" : "opacity-100"}`}
              activeOpacity={0.8}
            >
              <Text
                className="text-white font-bold text-base tracking-wider text-center w-full"
                numberOfLines={1}
              >
                {isPending
                  ? "SAVING..."
                  : isEditing
                    ? "SAVE CHANGES"
                    : isDeposit
                      ? "CASH IN"
                      : "CASH OUT"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
