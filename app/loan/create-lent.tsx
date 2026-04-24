import { useCreateLoan, useUpdateLoan } from "@/api/loan";
import { InputError } from "@/components/ui/input-error";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { ChevronLeft } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
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
  type: z.literal("GIVEN"),
  contact_number: z.string().optional(),
});

type CreateLoanFormValues = z.infer<typeof createLoanSchema>;

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function CreateLentScreen() {
  const [amount, setAmount] = useState("");
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
    editContactNumber?: string;
  }>();

  const isEditing = !!params.editId;

  const screenTitle = isEditing ? "Edit Lent Loan" : "New Lent Loan";
  const buttonText = isEditing ? "UPDATE LENT LOAN" : "+ ADD LENT LOAN";

  // Form setup
  const form = useForm<CreateLoanFormValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      person_name: "",
      amount: "",
      type: "GIVEN",
      contact_number: "",
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
        type: "GIVEN" as const,
        contact_number: form.getValues("contact_number"),
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
      router.navigate("/loans?tab=GIVEN");
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
      if (params.editContactNumber) {
        formMethods.setValue("contact_number", params.editContactNumber, {
          shouldValidate: false,
        });
      }
    }
  }, [
    isEditing,
    params.editId,
    params.editPersonName,
    params.editAmount,
    params.editContactNumber,
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
        router.navigate("/loans?tab=GIVEN");
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
    <View className="flex-1 border-t border-border">
      <Stack.Screen
        options={{
          headerShown: true,
          title: screenTitle,
          animation: "none",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate("/loans?tab=GIVEN")}
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
                      className={`flex-row items-center rounded-xl px-4 py-3.5 border-2 border-green-600/30 bg-green-600/10 ${form.formState.errors.amount ? "border-destructive" : ""}`}
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
                        className={`flex-1 ml-2 text-2xl font-bold text-green-600`}
                        ref={amountInputRef}
                      />
                    </View>
                    <InputError error={form.formState.errors.amount?.message} />
                  </View>
                )}
              />
            </View>

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
                    <InputError
                      error={form.formState.errors.person_name?.message}
                    />
                  </View>
                )}
              />
            </View>

            {/* Contact Number */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Contact number (Optional)
              </Text>
              <Controller
                control={form.control}
                name="contact_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter contact number"
                      placeholderTextColor="#A1A1AA"
                      keyboardType="phone-pad"
                      className={`bg-card rounded-xl px-4 py-3.5 border ${form.formState.errors.contact_number ? "border-destructive" : "border-border"} text-foreground text-base`}
                    />
                    <InputError
                      error={form.formState.errors.contact_number?.message}
                    />
                  </View>
                )}
              />
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
            className={`rounded-xl py-4 items-center justify-center w-full bg-green-600 ${isPending ? "opacity-50" : "opacity-100"}`}
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
    </View>
  );
}
