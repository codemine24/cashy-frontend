import {
  useAddPayment,
  useDeletePayment,
  useGetLoanDetail,
  useUpdatePayment,
} from "@/api/loan";
import { ScreenContainer } from "@/components/screen-container";
import { BookDetailSkeleton } from "@/components/skeletons/book-detail-skeleton";
import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { useTheme } from "@/context/theme-context";
import { usePullToRefreshSkeleton } from "@/hooks/use-pull-to-refresh-skeleton";
import { LoanPayment } from "@/interface/loan";
import { Edit3, Trash2, X } from "@/lib/icons";
import { formatCurrency } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Modal,
  RefreshControl,
  SectionList,
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

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { data: loanData, isLoading, refetch } = useGetLoanDetail(id!);
  const addPaymentMutation = useAddPayment();
  const updatePaymentMutation = useUpdatePayment();
  const deletePaymentMutation = useDeletePayment();

  const { showSkeleton, refreshControlProps } = usePullToRefreshSkeleton(
    async () => {
      await refetch();
    },
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<LoanPayment | null>(
    null,
  );
  const [selectedPayment, setSelectedPayment] = useState<LoanPayment | null>(
    null,
  );

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: "", remark: "" },
    mode: "onBlur",
  });

  // Show skeleton when initially loading or refreshing
  const finalShowSkeleton = isLoading || showSkeleton;

  // Group payments by date (similar to wallet) - moved before early returns
  const groupedPayments = useMemo(() => {
    if (!loanData?.data?.payments || loanData.data.payments.length === 0)
      return [];

    const sorted = [...loanData.data.payments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const groups: { date: string; data: typeof sorted }[] = [];
    sorted.forEach((payment) => {
      const date = new Date(payment.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const group = groups.find((g) => g.date === date);
      if (group) {
        group.data.push(payment);
      } else {
        groups.push({ date, data: [payment] });
      }
    });

    return groups;
  }, [loanData?.data?.payments]);

  // Convert to SectionList format - moved before early returns
  const sections = useMemo(
    () => groupedPayments.map((g) => ({ title: g.date, data: g.data })),
    [groupedPayments],
  );

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
          text2:
            response?.message ||
            (editingPayment ? "Payment updated" : "Payment added"),
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
              const res: any = await deletePaymentMutation.mutateAsync(
                payment.id,
              );
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
      ],
    );
  };

  if (finalShowSkeleton) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Loan Details",
            headerBackTitle: "Back",
          }}
        />
        <BookDetailSkeleton />
      </>
    );
  }

  if (!loanData?.data) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Loan Details",
            headerBackTitle: "Back",
          }}
        />
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
  const progress =
    loan.amount > 0
      ? Math.min(Math.max((loan.paid_amount / loan.amount) * 100, 0), 100)
      : 0;
  const remaining = Math.max(loan.amount - loan.paid_amount, 0);
  const isComplete = progress >= 100;
  const isPending =
    addPaymentMutation.isPending || updatePaymentMutation.isPending;

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
            return undefined;
          },
        }}
      />

      <View className="flex-1 bg-background px-4">
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl {...refreshControlProps} />}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {/* Top Summary Card - matching wallet structure */}
              <View className="bg-card mt-2 rounded-2xl mb-4 shadow-sm border border-border">
                <View className="px-3 py-3 flex-row justify-between items-center border-b border-border">
                  <Text className="text-foreground font-bold text-[14px]">
                    Loan Amount
                  </Text>
                  <Text className="text-foreground font-bold text-[14px]">
                    {formatCurrency(loan.amount)}
                  </Text>
                </View>
                <View className="px-3 py-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-foreground font-bold text-[12px]">
                      Total Paid
                    </Text>
                    <Text className="text-green-600 font-semibold text-[12px]">
                      {formatCurrency(loan.paid_amount)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-foreground font-bold text-[12px]">
                      Remaining
                    </Text>
                    <Text className="text-destructive font-semibold text-[12px]">
                      {formatCurrency(remaining)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="px-3 py-2">
                  <View className="h-2 bg-background rounded-full overflow-hidden border border-border">
                    <View
                      className={`h-full rounded-full ${isComplete ? "bg-green-600" : "bg-primary"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text
                      className={`text-xs ${isComplete ? "text-muted-foreground" : "text-primary"}`}
                    >
                      {progress.toFixed(1)}%
                    </Text>
                    {remaining > 0 ? (
                      <Text className="text-xs text-muted-foreground">
                        {formatCurrency(remaining)} remaining
                      </Text>
                    ) : (
                      <Text className="text-xs text-muted-foreground">
                        Fully paid
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row justify-between items-center border-t border-border">
                  <View className="flex-1 items-center py-2.5 flex-row justify-center">
                    <Text className="text-primary font-semibold text-sm">
                      {loan.payments?.length || 0} Payments
                    </Text>
                  </View>
                </View>
              </View>

              {/* Showing X entries */}
              {loan.payments && loan.payments.length > 0 && (
                <View className="flex-row items-center justify-center mb-3 px-6 rounded-2xl">
                  <View className="flex-1 h-[1px] bg-border" />
                  <Text className="text-muted-foreground font-medium text-[10px] mx-4 tracking-wide">
                    Showing {loan.payments.length} entries
                  </Text>
                  <View className="flex-1 h-[1px] bg-border" />
                </View>
              )}
            </>
          }
          renderSectionHeader={({ section: { title, data } }) => (
            <View className="bg-card rounded-2xl mb-2 border border-border">
              <View className="px-3 py-3 border-b border-border">
                <Text className="text-white text-sm font-semibold tracking-wide">
                  {title}
                </Text>
              </View>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (selectedPayment) {
                      setSelectedPayment(
                        item.id === selectedPayment.id ? null : item,
                      );
                    }
                  }}
                  onLongPress={() => setSelectedPayment(item)}
                  className={`px-4 py-4 flex-row justify-between ${
                    selectedPayment?.id === item.id ? "bg-primary/10" : ""
                  } ${index !== data.length - 1 ? "border-b border-border" : ""}`}
                >
                  <View className="flex-1 mr-3">
                    <Text
                      className={`text-base mb-2 font-medium ${item.remark ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {item.remark || "No remark"}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View className="items-end justify-center">
                    <Text className="text-base font-bold mb-2 text-green-600">
                      +{formatCurrency(item.amount)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View className="bg-card rounded-2xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No payments yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Tap the button below to record a payment
              </Text>
            </View>
          }
        />

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
          <View
            className="bg-background rounded-t-3xl px-6 pt-3"
            style={{ paddingBottom: 30 }}
          >
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
                      className={`flex-row items-center rounded-xl px-4 py-3 border ${
                        paymentForm.formState.errors.amount
                          ? "border-destructive"
                          : "border-border"
                      }`}
                    >
                      <Text className="text-xl font-bold text-primary mr-2">
                        $
                      </Text>
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
                    <InputError
                      error={paymentForm.formState.errors.amount?.message}
                    />
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
