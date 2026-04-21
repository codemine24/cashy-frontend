import { useCreateLoan, useUpdateLoan } from "@/api/loan";
import { InputError } from "@/components/ui/input-error";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { ChevronLeft } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  BackHandler,
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

// ─── Validation Schema ───────────────────────────────────────────────────────
const createLoanSchema = z.object({
  person_name: z.string().min(1, "Person name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  type: z.literal("TAKEN"),
  due_date: z.string().optional(),
});

type CreateLoanFormValues = z.infer<typeof createLoanSchema>;

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function CreateBorrowedScreen() {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const amountInputRef = useRef<TextInput>(null);

  const router = useRouter();
  const keyboardOffset = useKeyboardOffset();
  const isKeyboardVisible = useKeyboardVisible();
  const insets = useSafeAreaInsets();
  const createLoanMutation = useCreateLoan();
  const updateLoanMutation = useUpdateLoan();
  const params = useLocalSearchParams<{
    editId?: string;
    editPersonName?: string;
    editAmount?: string;
    editDueDate?: string;
  }>();

  const isEditing = !!params.editId;

  const screenTitle = isEditing ? "Edit Borrowed Loan" : "New Borrowed Loan";
  const buttonText = isEditing ? "UPDATE BORROWED LOAN" : "+ ADD BORROWED LOAN";

  // Form setup
  const form = useForm<CreateLoanFormValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      person_name: "",
      amount: "",
      type: "TAKEN",
      due_date: "",
    },
    mode: "onBlur",
  });

  // Store form instance in ref to avoid dependency issues
  const formRef = useRef(form);
  formRef.current = form;

  const isPending = isEditing
    ? updateLoanMutation.isPending
    : createLoanMutation.isPending;

  const handleSubmit = async () => {
    try {
      const payload = {
        person_name: form.getValues("person_name"),
        amount: parseFloat(amount),
        type: "TAKEN" as const,
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
      router.navigate("/loans?tab=TAKEN");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.message || `Failed to ${isEditing ? "update" : "create"} loan`,
      });
    }
  };

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

  useEffect(() => {
    const interaction = InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    });

    return () => interaction.cancel();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.navigate("/loans?tab=TAKEN");
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
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: screenTitle,
          animation: "none",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate("/loans?tab=TAKEN")}
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
                      placeholder="Who did you borrow from?"
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
                      className={`flex-row items-center rounded-xl px-4 py-3.5 border-2 border-destructive/30 bg-destructive/10 ${form.formState.errors.amount ? "border-destructive" : ""}`}
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
                        className={`flex-1 ml-2 text-2xl font-bold text-destructive`}
                        ref={amountInputRef}
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
                className={`rounded-xl px-4 py-3.5 border flex-row items-center justify-between border-destructive/30 bg-destructive/10`}
              >
                <Text className={`text-base font-medium text-destructive`}>
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
            className={`rounded-xl py-4 items-center justify-center w-full bg-destructive ${isPending ? "opacity-50" : "opacity-100"}`}
            activeOpacity={0.8}
          >
            <Text
              className="text-white font-bold text-base tracking-wider text-center w-full"
              numberOfLines={1}
            >
              {isPending ? "SAVING..." : buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
