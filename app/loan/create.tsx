import { useCreateLoan } from "@/api/loan";
import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { InputField } from "@/components/ui/input-field";
import { useTheme } from "@/context/theme-context";
import { PlusIcon } from "@/icons/plus-icon";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import Toast from "react-native-toast-message";
import { z } from "zod";

const createLoanSchema = z.object({
  person_name: z.string().min(1, "Person name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a valid positive number",
    }),
  type: z.enum(["GIVEN", "TAKEN"]),
  remark: z.string().optional(),
  due_date: z.string().optional(),
});

type CreateLoanFormValues = z.infer<typeof createLoanSchema>;

export default function CreateLoanScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{ type?: string }>();
  const initialType = (params.type as "GIVEN" | "TAKEN") || "GIVEN";

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const createLoanMutation = useCreateLoan();

  const form = useForm<CreateLoanFormValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      person_name: "",
      amount: "",
      type: initialType,
      remark: "",
      due_date: "",
    },
    mode: "onBlur",
  });

  const watchedType = form.watch("type");
  const isGiven = watchedType === "GIVEN";

  const handleSubmit = async (data: CreateLoanFormValues) => {
    try {
      const payload = {
        person_name: data.person_name,
        amount: parseFloat(data.amount),
        type: data.type,
        remark: data.remark || undefined,
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

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "Select due date (optional)";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "New Loan",
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
        >
          {/* Type Toggle */}
          <View className="flex-row bg-muted rounded-2xl p-1 my-6">
            <TouchableOpacity
              onPress={() =>
                form.setValue("type", "GIVEN", { shouldValidate: true })
              }
              className={`flex-1 rounded-lg py-3 items-center justify-center ${isGiven ? "bg-primary shadow-sm" : "bg-transparent"
                }`}
              activeOpacity={0.8}
            >
              <PlusIcon
                className={`mr-2 size-4 ${isGiven ? "text-primary-foreground" : "text-foreground"
                  }`}
              />
              <Text
                className={`font-semibold text-base ${isGiven ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
              >
                Lent Loan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                form.setValue("type", "TAKEN", { shouldValidate: true })
              }
              className={`flex-1 rounded-lg py-3 items-center justify-center ${!isGiven ? "bg-primary shadow-sm" : "bg-transparent"
                }`}
              activeOpacity={0.8}
            >
              <PlusIcon
                className={`mr-2 size-4 ${!isGiven ? "text-primary-foreground" : "text-foreground"
                  }`}
              />
              <Text
                className={`font-semibold text-base ${!isGiven ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
              >
                Borrowed Loan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Person Name */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Person Name
            </Text>
            <Controller
              control={form.control}
              name="person_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={
                      isGiven
                        ? "Who did you lend to?"
                        : "Who did you borrow from?"
                    }
                    autoCapitalize="words"
                    className={`${form.formState.errors.person_name
                        ? "border-destructive"
                        : "border-border"
                      }`}
                  />
                  <InputError
                    error={form.formState.errors.person_name?.message}
                  />
                </View>
              )}
            />
          </View>

          {/* Amount */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Amount
            </Text>
            <Controller
              control={form.control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View
                    className={`flex-row items-center rounded-xl px-4 py-4 border ${form.formState.errors.amount
                        ? "border-destructive"
                        : "border-border"
                      }`}
                  >
                    <Text className="text-2xl font-bold text-primary mr-2">
                      $
                    </Text>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="0.00"
                      placeholderTextColor={isDark ? "#555" : "#A1A1AA"}
                      keyboardType="decimal-pad"
                      className="flex-1 text-2xl font-bold text-foreground"
                    />
                  </View>
                  <InputError error={form.formState.errors.amount?.message} />
                </View>
              )}
            />
          </View>

          {/* Due Date */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Due Date
            </Text>
            <Controller
              control={form.control}
              name="due_date"
              render={({ field: { value } }) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      if (!selectedDate) setSelectedDate(new Date());
                      setShowDatePicker(true);
                    }}
                    className="bg-card rounded-xl px-4 py-4 border border-border flex-row items-center justify-between"
                  >
                    <Text
                      className={`text-base ${value ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      {formatDateForDisplay(value)}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate || new Date()}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) {
                          setSelectedDate(date);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          form.setValue("due_date", `${year}-${month}-${day}`);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            />
          </View>

          {/* Remark */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Remark (Optional)
            </Text>
            <Controller
              control={form.control}
              name="remark"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Add a note about this loan..."
                  placeholderTextColor={isDark ? "#555" : "#A1A1AA"}
                  className="bg-card border border-border rounded-xl px-4 py-4 text-foreground text-base"
                  style={{ textAlignVertical: "top", minHeight: 100 }}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-5 py-3 bg-background border-t border-border">
          <Button
            onPress={form.handleSubmit(handleSubmit)}
            disabled={createLoanMutation.isPending}
          >
            <Text className="text-primary-foreground font-semibold text-base tracking-wide">
              {createLoanMutation.isPending ? "Creating..." : "Create Loan"}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
