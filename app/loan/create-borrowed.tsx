import { useCreateLoan } from "@/api/loan";
import { InputError } from "@/components/ui/input-error";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
const createLoanSchema = z.object({
  person_name: z.string().min(1, "Person name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a valid positive number",
    }),
  type: z.literal("TAKEN"),
  due_date: z.string().optional(),
});

type CreateLoanFormValues = z.infer<typeof createLoanSchema>;

export default function CreateBorrowedLoanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow;
  });
  const keyboardOffset = useKeyboardOffset();

  const createLoanMutation = useCreateLoan();

  // Set default due date to day after tomorrow
  const defaultDueDate = (() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const year = dayAfterTomorrow.getFullYear();
    const month = String(dayAfterTomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(dayAfterTomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const form = useForm<CreateLoanFormValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      person_name: "",
      amount: "",
      type: "TAKEN",
      due_date: defaultDueDate,
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: CreateLoanFormValues) => {
    try {
      const payload = {
        person_name: data.person_name,
        amount: parseFloat(data.amount),
        type: data.type,
        due_date: data.due_date || undefined,
      };

      const response: any = await createLoanMutation.mutateAsync(payload);

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response?.message || "Loan created successfully",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.message || "Failed to create loan",
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const accentTextClass = "text-destructive";
  const accentBgClassMap = "bg-destructive/10";
  const accentBorderClassMap = "border-destructive/30";
  const btnClassMap = "bg-destructive";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "New Borrowed Loan",
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={keyboardOffset}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
        >
          {/* Person Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Person name
            </Text>
            <Controller
              control={form.control}
              name="person_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Who did you lend from?"
                    placeholderTextColor="#A1A1AA"
                    className={`bg-card rounded-xl px-4 py-3.5 border ${form.formState.errors.person_name ? "border-destructive" : "border-border"} text-foreground text-base`}
                    autoCapitalize="words"
                  />
                  <InputError
                    error={form.formState.errors.person_name?.message}
                  />
                </View>
              )}
            />
          </View>

          {/* Amount */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
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
                    <Text
                      className={`text-2xl font-bold ${accentTextClass} mr-2`}
                    >
                      $
                    </Text>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="0.00"
                      placeholderTextColor="#A1A1AA"
                      keyboardType="decimal-pad"
                      className={`flex-1 text-2xl font-bold ${accentTextClass}`}
                      autoFocus={true}
                    />
                  </View>
                  <InputError error={form.formState.errors.amount?.message} />
                </View>
              )}
            />
          </View>

          {/* Due Date */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Due date
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className={`flex-1 bg-card rounded-xl px-4 py-3.5 border flex-row items-center justify-between ${accentBorderClassMap} ${accentBgClassMap}`}
                >
                  <Text className="text-foreground text-base font-medium">
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Select due date"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setSelectedDate(selectedDate);
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const day = String(selectedDate.getDate()).padStart(2, "0");
                    form.setValue("due_date", `${year}-${month}-${day}`);
                  }
                }}
              />
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          className="px-5 py-3 bg-background border-t border-border"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            onPress={form.handleSubmit(handleSubmit)}
            disabled={createLoanMutation.isPending}
            className={`rounded-xl py-4 items-center justify-center ${btnClassMap} ${createLoanMutation.isPending ? "opacity-50" : "opacity-100"}`}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base tracking-wider">
              {createLoanMutation.isPending
                ? "CREATING..."
                : "+ ADD BORROWED LOAN"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
