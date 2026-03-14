import { useGetLoanDetail, useUpdateLoan } from "@/api/loan";
import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { InputField } from "@/components/ui/input-field";
import { useTheme } from "@/context/theme-context";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

const updateLoanSchema = z.object({
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
  status: z.enum(["ONGOING", "PAID", "OVERDUE"]),
});

type UpdateLoanFormValues = z.infer<typeof updateLoanSchema>;

const STATUS_OPTIONS: { key: "ONGOING" | "PAID" | "OVERDUE"; label: string }[] =
  [
    { key: "ONGOING", label: "Ongoing" },
    { key: "PAID", label: "Paid" },
    { key: "OVERDUE", label: "Overdue" },
  ];

export default function EditLoanScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const loanId = params.id!;

  const { data: loanData, isLoading } = useGetLoanDetail(loanId);
  const updateLoanMutation = useUpdateLoan();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const form = useForm<UpdateLoanFormValues>({
    resolver: zodResolver(updateLoanSchema),
    defaultValues: {
      person_name: "",
      amount: "",
      type: "GIVEN",
      remark: "",
      due_date: "",
      status: "ONGOING",
    },
    mode: "onBlur",
  });

  // Pre-fill form when loan data loads
  useEffect(() => {
    if (loanData?.data) {
      const loan = loanData.data;
      form.reset({
        person_name: loan.person_name,
        amount: loan.amount?.toString(),
        type: loan.type,
        remark: loan.remark || "",
        due_date: loan.due_date || "",
        status: loan.status,
      });
      if (loan.due_date) {
        setSelectedDate(new Date(loan.due_date));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanData]);

  const watchedType = form.watch("type");
  const watchedStatus = form.watch("status");
  const isGiven = watchedType === "GIVEN";

  const handleSubmit = async (data: UpdateLoanFormValues) => {
    try {
      const payload = {
        person_name: data.person_name,
        amount: parseFloat(data.amount),
        type: data.type,
        remark: data.remark || undefined,
        due_date: data.due_date || undefined,
        status: data.status,
      };

      const response: any = await updateLoanMutation.mutateAsync({
        id: loanId,
        payload,
      });

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response?.message || "Loan updated successfully",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.message || "Failed to update loan",
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

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: true, title: "Edit Loan", headerBackTitle: "Back" }}
        />
        <View className="flex-1 bg-background items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Edit Loan",
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
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
              onPress={() => form.setValue("type", "GIVEN")}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center ${isGiven ? "bg-card shadow-sm" : "bg-transparent"
                }`}
            >
              <Text
                className={`font-semibold text-sm ${isGiven ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                Debtor (Given)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => form.setValue("type", "TAKEN")}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center ${!isGiven ? "bg-card shadow-sm" : "bg-transparent"
                }`}
            >
              <Text
                className={`font-semibold text-sm ${!isGiven ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                Creditor (Taken)
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
                    placeholder="Person name"
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

          {/* Status */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Status
            </Text>
            <View className="flex-row gap-2">
              {STATUS_OPTIONS.map((option) => {
                const isActive = watchedStatus === option.key;
                const colorMap: Record<string, { bg: string; text: string; activeBg: string }> = {
                  ONGOING: { bg: "bg-card", text: "text-blue-500", activeBg: "bg-blue-500/15" },
                  PAID: { bg: "bg-card", text: "text-green-500", activeBg: "bg-green-500/15" },
                  OVERDUE: { bg: "bg-card", text: "text-red-500", activeBg: "bg-red-500/15" },
                };
                const colors = colorMap[option.key];

                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => form.setValue("status", option.key)}
                    className={`flex-1 py-3 rounded-xl items-center justify-center border ${isActive
                      ? `${colors.activeBg} border-transparent`
                      : `${colors.bg} border-border`
                      }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${isActive ? colors.text : "text-muted-foreground"
                        }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, date) => {
                        setShowDatePicker(Platform.OS === "ios");
                        if (date) {
                          setSelectedDate(date);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
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
            disabled={updateLoanMutation.isPending}
          >
            <Text className="text-primary-foreground font-semibold text-base tracking-wide">
              {updateLoanMutation.isPending ? "Updating..." : "Update Loan"}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
