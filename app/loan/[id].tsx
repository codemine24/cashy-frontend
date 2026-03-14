import { useAddPayment, useDeleteLoan, useDeletePayment, useGetLoanDetail, useUpdatePayment } from "@/api/loan";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { useTheme } from "@/context/theme-context";
import { Edit3, Trash2, X } from "@/lib/icons";
import { LoanPayment } from "@/interface/loan";
import { formatCurrency } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a valid positive number",
    }),
  remark: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  ONGOING: { bg: "bg-blue-500/15", text: "text-blue-500" },
  PAID: { bg: "bg-green-500/15", text: "text-green-500" },
  OVERDUE: { bg: "bg-red-500/15", text: "text-red-500" },
};

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { data: loanData, isLoading, refetch } = useGetLoanDetail(id!);
  const deleteLoanMutation = useDeleteLoan();
  const addPaymentMutation = useAddPayment();
  const updatePaymentMutation = useUpdatePayment();
  const deletePaymentMutation = useDeletePayment();

  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<LoanPayment | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<LoanPayment | null>(null);

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: "", remark: "" },
    mode: "onBlur",
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openAddPayment = () => {
    setEditingPayment(null);
    paymentForm.reset({ amount: "", remark: "" });
    setShowPaymentModal(true);
  };

  const openEditPayment = (payment: LoanPayment) => {
    setEditingPayment(payment);
    paymentForm.reset({
      amount: payment.amount?.toString(),
      remark: payment.remark || "",
    });
    setShowPaymentModal(true);
    setSelectedPayment(null);
  };

  const handlePaymentSubmit = async (data: PaymentFormValues) => {
    try {
      let response: any;

      if (editingPayment) {
        response = await updatePaymentMutation.mutateAsync({
          payment_id: editingPayment.id,
          amount: parseFloat(data.amount),
          remark: data.remark || undefined,
        });
      } else {
        response = await addPaymentMutation.mutateAsync({
          loan_id: id!,
          amount: parseFloat(data.amount),
          remark: data.remark || undefined,
        });
      }

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response?.message || (editingPayment ? "Payment updated" : "Payment added"),
        });
        setShowPaymentModal(false);
        setEditingPayment(null);
        paymentForm.reset({ amount: "", remark: "" });
        refetch();
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

  const handleDeletePayment = (payment: LoanPayment) => {
    Alert.alert(
      "Delete Payment",
      "Are you sure you want to delete this payment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res: any = await deletePaymentMutation.mutateAsync(payment.id);
              if (res?.success) {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Payment deleted",
                });
                setSelectedPayment(null);
                refetch();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: res?.message || "Failed to delete payment",
                });
              }
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: error?.message || "Something went wrong",
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteLoan = () => {
    Alert.alert(
      "Delete Loan",
      "Are you sure you want to delete this loan? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res: any = await deleteLoanMutation.mutateAsync(id!);
              if (res?.success) {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Loan deleted successfully",
                });
                router.back();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: res?.message || "Failed to delete loan",
                });
              }
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: error?.message || "Something went wrong",
              });
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "Loan Details", headerBackTitle: "Back" }} />
        <View className="flex-1 bg-background items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  if (!loanData?.data) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: "Loan Details", headerBackTitle: "Back" }} />
        <ScreenContainer className="p-4 items-center justify-center">
          <Text className="text-foreground">Loan not found</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-primary font-semibold">Go Back</Text>
          </TouchableOpacity>
        </ScreenContainer>
      </>
    );
  }

  const loan = loanData.data;
  const progress = loan.amount > 0 ? Math.min((loan.paid_amount / loan.amount) * 100, 100) : 0;
  const remaining = Math.max(loan.amount - loan.paid_amount, 0);
  const isComplete = progress >= 100;
  const statusStyle = STATUS_STYLES[loan.status] || STATUS_STYLES.ONGOING;
  const isPending = addPaymentMutation.isPending || updatePaymentMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: selectedPayment ? "1 Selected" : loan.person_name,
          headerBackTitle: "Back",
          headerLeft: selectedPayment
            ? () => (
              <TouchableOpacity
                onPress={() => setSelectedPayment(null)}
                style={{ marginLeft: 8, padding: 6 }}
              >
                <X size={22} className="text-foreground" />
              </TouchableOpacity>
            )
            : undefined,
          headerRight: () => {
            if (selectedPayment) {
              return (
                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    onPress={() => openEditPayment(selectedPayment)}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Edit3 size={20} className="text-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeletePayment(selectedPayment)}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={20} className="text-destructive" />
                  </TouchableOpacity>
                </View>
              );
            }
            return (
              <View className="flex-row items-center gap-1">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/loan/edit",
                      params: { id: loan.id },
                    } as any)
                  }
                  className="p-2"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={20} className="text-primary" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteLoan}
                  className="p-2"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={20} className="text-destructive" />
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-4 bg-background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View className="bg-card rounded-2xl p-5 mt-4 mb-6 border border-border">
          {/* Type & Status */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="bg-primary/10 px-3 py-1 rounded-lg">
              <Text className="text-primary text-xs font-bold uppercase tracking-wider">
                {loan.type === "GIVEN" ? "Debtor" : "Creditor"}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-lg ${statusStyle.bg}`}>
              <Text className={`text-xs font-bold uppercase tracking-wider ${statusStyle.text}`}>
                {loan.status}
              </Text>
            </View>
          </View>

          {/* Main Amount */}
          <Text className="text-muted-foreground text-center text-sm mb-1">
            Loan Amount
          </Text>
          <Text className="text-3xl font-bold text-center text-foreground mb-1">
            {formatCurrency(loan.amount)}
          </Text>

          {/* Progress Bar */}
          <View className="h-3 bg-background rounded-full overflow-hidden border border-border mb-2 mt-4">
            <View
              className={`h-full rounded-full ${isComplete ? "bg-success" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </View>

          {/* Progress Info */}
          <View className="flex-row justify-between mb-4">
            <Text className={`text-sm font-bold ${isComplete ? "text-success" : "text-primary"}`}>
              {progress.toFixed(1)}%
            </Text>
            {remaining > 0 ? (
              <Text className="text-sm text-muted-foreground">
                {formatCurrency(remaining)} remaining
              </Text>
            ) : (
              <Text className="text-sm font-bold text-success">Fully paid ✓</Text>
            )}
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
              <Text className="text-xs text-muted-foreground font-medium mb-1">
                Total Paid
              </Text>
              <Text className="text-base font-bold text-success">
                {formatCurrency(loan.paid_amount)}
              </Text>
            </View>
            <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
              <Text className="text-xs text-muted-foreground font-medium mb-1">
                Remaining
              </Text>
              <Text className="text-base font-bold text-destructive">
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          {/* Due Date & Remark */}
          {(loan.due_date || loan.remark) && (
            <View className="mt-4 pt-4 border-t border-border">
              {loan.due_date && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-muted-foreground">Due Date</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {new Date(loan.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              )}
              {loan.remark && (
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">Remark</Text>
                  <Text className="text-sm text-foreground">{loan.remark}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Payments Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-foreground">Payments</Text>
          <Text className="text-sm text-muted-foreground">
            {loan.payments?.length || 0} entries
          </Text>
        </View>

        {!loan.payments || loan.payments.length === 0 ? (
          <View className="bg-card rounded-xl p-8 items-center justify-center border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              No payments yet
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              Tap the button below to record a payment
            </Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={loan.payments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onLongPress={() => setSelectedPayment(item)}
                onPress={() => {
                  if (selectedPayment) {
                    setSelectedPayment(
                      item.id === selectedPayment.id ? null : item
                    );
                  }
                }}
                className={`rounded-xl p-4 mb-3 border flex-row items-center justify-between active:opacity-70 ${selectedPayment?.id === item.id
                  ? "border-primary bg-primary/10"
                  : "bg-card border-border"
                  }`}
              >
                <View className="flex-1 mr-4">
                  <Text
                    className="text-base font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {item.remark || "Payment"}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Text className="text-lg font-bold text-success">
                  +{formatCurrency(item.amount)}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-background border-t border-border shadow-2xl">
        <TouchableOpacity
          onPress={openAddPayment}
          className="rounded-2xl bg-primary py-3.5 items-center justify-center"
        >
          <Text className="text-primary-foreground font-bold text-sm tracking-widest">
            + ADD PAYMENT
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View className="flex-1 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowPaymentModal(false)}
          />
          <View className="bg-background rounded-t-3xl px-6 pt-3" style={{ paddingBottom: 30 }}>
            {/* Handle */}
            <View className="items-center mb-5">
              <View className="w-10 h-1 rounded-full bg-foreground" />
            </View>

            {/* Title */}
            <View className="flex-row items-center justify-between mb-5 border-b border-border pb-4">
              <Text className="text-xl font-semibold text-foreground">
                {editingPayment ? "Edit Payment" : "Add Payment"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPaymentModal(false);
                  setEditingPayment(null);
                }}
                className="p-1"
              >
                <X size={20} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Amount
              </Text>
              <Controller
                control={paymentForm.control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View
                      className={`flex-row items-center rounded-xl px-4 py-3 border ${paymentForm.formState.errors.amount
                        ? "border-destructive"
                        : "border-border"
                        }`}
                    >
                      <Text className="text-xl font-bold text-primary mr-2">$</Text>
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="0.00"
                        placeholderTextColor={isDark ? "#555" : "#A1A1AA"}
                        keyboardType="decimal-pad"
                        className="flex-1 text-xl font-bold text-foreground"
                        autoFocus
                      />
                    </View>
                    <InputError error={paymentForm.formState.errors.amount?.message} />
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
                control={paymentForm.control}
                name="remark"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Add a note..."
                    placeholderTextColor={isDark ? "#555" : "#A1A1AA"}
                    className="bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
                  />
                )}
              />
            </View>

            {/* Submit */}
            <Button
              onPress={paymentForm.handleSubmit(handlePaymentSubmit)}
              disabled={isPending}
            >
              <Text className="text-primary-foreground font-semibold text-base">
                {isPending
                  ? "Saving..."
                  : editingPayment
                    ? "Update Payment"
                    : "Add Payment"}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}
