import { useCreateLoan, useUpdateLoan } from "@/api/loan";
import { InputError } from "@/components/ui/input-error";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
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
const createLoanSchema = z.object({
  person_name: z.string().min(1, "Person name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  type: z.literal("GIVEN"),
  due_date: z.string().optional(),
});

type CreateLoanFormValues = z.infer<typeof createLoanSchema>;

export default function CreateLentLoanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    editId?: string;
    editPersonName?: string;
    editAmount?: string;
    editDueDate?: string;
  }>();

  const isEditing = !!params.editId;

  const keyboardOffset = useKeyboardOffset();
  const isKeyboardVisible = useKeyboardVisible();

  const createLoanMutation = useCreateLoan();
  const updateLoanMutation = useUpdateLoan();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form setup
  const form = useForm<CreateLoanFormValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      person_name: "",
      amount: "",
      type: "GIVEN",
      due_date: "",
    },
    mode: "onBlur",
  });

  // Store form instance in ref to avoid dependency issues
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    if (isEditing && params.editId) {
      // Only populate once when editId is available
      const formMethods = formRef.current;

      if (params.editPersonName) {
        formMethods.setValue("person_name", params.editPersonName, {
          shouldValidate: false,
        });
      }
      if (params.editAmount) {
        setAmount(params.editAmount);
        formMethods.setValue("amount", params.editAmount, {
          shouldValidate: false,
        });
      }
      if (params.editDueDate) {
        const parsedDate = new Date(params.editDueDate);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
          formMethods.setValue("due_date", params.editDueDate, {
            shouldValidate: false,
          });
        }
      }
    }
  }, [
    isEditing,
    params.editId,
    params.editPersonName,
    params.editAmount,
    params.editDueDate,
  ]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const accentTextClass = "text-green-600";
  const accentBgClassMap = "bg-green-600/10";
  const accentBorderClassMap = "border-green-600/30";
  const btnClassMap = "bg-green-600";

  const handleSubmit = async () => {
    try {
      const payload = {
        person_name: form.getValues("person_name"),
        amount: parseFloat(amount),
        type: "GIVEN" as const,
        due_date: date.toISOString().split("T")[0],
      };

      let response: any;

      if (isEditing) {
        response = await updateLoanMutation.mutateAsync({
          id: params.editId!,
          payload,
        });
      } else {
        response = await createLoanMutation.mutateAsync(payload);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2:
          response?.message ||
          `Loan ${isEditing ? "updated" : "created"} successfully`,
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.message || `Failed to ${isEditing ? "update" : "create"} loan`,
      });
    }
  };

  const isPending = isEditing
    ? updateLoanMutation.isPending
    : createLoanMutation.isPending;

  const screenTitle = isEditing ? "Edit Lent Loan" : "New Lent Loan";
  const buttonText = isEditing ? "UPDATE LENT LOAN" : "+ ADD LENT LOAN";

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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }} className={`bg-background ${isKeyboardVisible ? "pb-0" : "pb-8"}`}>

          {/* Scrollable content */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                      placeholder="Who did you lend to?"
                      placeholderTextColor="#A1A1AA"
                      className={`bg-card rounded-xl px-4 py-3.5 border ${form.formState.errors.person_name ? "border-destructive" : "border-border"} text-foreground text-base`}
                      autoCapitalize="words"
                    />
                    <InputError error={form.formState.errors.person_name?.message} />
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
                      <Text className={`text-2xl font-bold ${accentTextClass}`}>$</Text>
                      <TextInput
                        value={value}
                        onChangeText={(text) => { onChange(text); setAmount(text); }}
                        onBlur={onBlur}
                        placeholder="0.00"
                        placeholderTextColor="#A1A1AA"
                        keyboardType="decimal-pad"
                        className={`flex-1 ml-2 text-2xl font-bold ${accentTextClass}`}
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
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className={`bg-card rounded-xl px-4 py-3.5 border flex-row items-center justify-between ${accentBorderClassMap} ${accentBgClassMap}`}
              >
                <Text className={`text-base font-medium ${accentTextClass}`}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>
          </ScrollView>

          {/* Submit button — always sticks to bottom */}
          <View
            className="px-5 py-3 bg-background border-t border-border"
            style={{ paddingBottom: Math.max(insets.bottom, isEditing ? 6 : 16) }}
          >
            <TouchableOpacity
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isPending}
              className={`rounded-xl py-4 items-center justify-center ${btnClassMap} ${isPending ? "opacity-50" : "opacity-100"}`}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base tracking-wider">
                {isPending ? "SAVING..." : buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
