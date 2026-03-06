import { useCreateTransaction, useUpdateTransaction } from "@/api/transaction";
import { ChevronRight, Paperclip, X } from "@/lib/icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PickedFile {
  uri: string;
  name: string;
  type: string;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    type: string;
    editId?: string;
    editAmount?: string;
    editRemark?: string;
    editType?: string;
    selectedCategoryId?: string;
    selectedCategoryName?: string;
  }>();

  const bookId = params.bookId!;
  const initialType = (params.type as "IN" | "OUT") || "OUT";
  const isEditing = !!params.editId;

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const [type, setType] = useState<"IN" | "OUT">(initialType);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [attachments, setAttachments] = useState<PickedFile[]>([]);

  useEffect(() => {
    if (isEditing) {
      setType((params.editType as "IN" | "OUT") || initialType);
      setAmount(params.editAmount || "");
      setRemark(params.editRemark || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (params.selectedCategoryId) {
      setSelectedCategory(params.selectedCategoryId);
      setSelectedCategoryName(
        params.selectedCategoryName || "Unknown Category",
      );
    }
  }, [params.selectedCategoryId, params.selectedCategoryName]);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
          ? selectedCategory === "other"
            ? undefined
            : selectedCategory
          : undefined,
        remark,
        date: formatDate(date),
        time: formatTime(date),
      }
      : {
        book_id: bookId,
        type,
        amount: parseFloat(amount),
        category_id: !isDeposit
          ? selectedCategory === "other"
            ? undefined
            : selectedCategory
          : undefined,
        remark,
        date: formatDate(date),
        time: formatTime(date),
      };

    const formData = new FormData();
    formData.append("data", JSON.stringify(dataPayload));

    attachments.forEach((file) => {
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
  const accentBorderClassMap = isDeposit ? "border-success/30" : "border-destructive/30";

  const btnClassMap = isDeposit ? "bg-success" : "bg-destructive";

  const screenTitle = isEditing
    ? "Edit Transaction"
    : isDeposit
      ? "Cash In"
      : "Cash Out";

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid amount",
      });
      return;
    }

    if (!isDeposit && !selectedCategory) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a category",
      });
      return;
    }

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

      router.replace({
        pathname: "/book/[id]",
        params: { id: bookId },
      })
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
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: screenTitle,
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View className="flex-1 bg-background">
          <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Amount Input */}
            <View className="mb-5 mt-4">
              <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Amount
              </Text>
              <View
                className={`flex-row items-center rounded-xl px-4 py-3.5 border-2 ${accentBorderClassMap} ${accentBgClassMap}`}
              >
                <Text
                  className={`text-2xl font-bold ${accentTextClass}`}
                >
                  $
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="decimal-pad"
                  className={`flex-1 ml-2 text-2xl font-bold ${accentTextClass}`}
                  autoFocus={true}
                />
              </View>
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
                      pathname: "/book/select-category",
                      params: {
                        bookId: bookId,
                        currentSelectedId: selectedCategory,
                      },
                    });
                  }}
                  className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3.5"
                >
                  <Text
                    className={`flex-1 text-base font-medium ${selectedCategoryName ? "text-foreground" : "text-muted-foreground"}`}
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
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-1 bg-card rounded-xl px-4 py-3.5 border border-border flex-row items-center justify-between"
                >
                  <Text className="text-foreground text-base font-medium">
                    {date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex-1 bg-card rounded-xl px-4 py-3.5 border border-border flex-row items-center justify-between"
                >
                  <Text className="text-foreground text-base font-medium">
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

            {/* ── Attachments ── */}
            <View className="mb-5">
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

          {/* Submit Button - Sticks above keyboard */}
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
                  : isEditing
                    ? "SAVE CHANGES"
                    : isDeposit
                      ? "ADD CASH IN"
                      : "ADD CASH OUT"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}