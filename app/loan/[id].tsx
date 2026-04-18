import { useDeletePayment, useGetLoanDetail } from "@/api/loan";
import { CreatePaymentModal } from "@/components/loan/create-payment-modal";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { usePullToRefreshSkeleton } from "@/hooks/use-pull-to-refresh-skeleton";
import { LoanPayment } from "@/interface/loan";
import { ChevronLeft, Edit3, Trash2, X } from "@/lib/icons";
import { formatCurrency } from "@/utils";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: loanData, isLoading, refetch } = useGetLoanDetail(id!);
  const loan = loanData?.data;

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

  const deletePayment = useDeletePayment();

  // Show skeleton when initially loading or refreshing
  const finalShowSkeleton = isLoading || showSkeleton;

  // Sort payments by date (without grouping)
  const sortedPayments = useMemo(() => {
    if (!loanData?.data?.payments || loanData.data.payments.length === 0)
      return [];

    return [...loanData.data.payments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [loanData?.data?.payments]);

  const openAddPayment = () => {
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setEditingPayment(null);
    refetch();
  };

  const handleEditPayment = () => {
    if (!selectedPayment) return;
    setEditingPayment(selectedPayment);
    setShowPaymentModal(true);
    setSelectedPayment(null);
  };

  const handleDeletePayment = () => {
    if (!selectedPayment) return;
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
              const res = await deletePayment.mutateAsync(selectedPayment.id);
              if (res?.success) {
                Toast.show({
                  type: "success",
                  text1: "Payment deleted successfully",
                });
                setSelectedPayment(null);
                refetch();
              } else {
                Toast.show({
                  type: "error",
                  text1: res?.message || "Failed to delete payment",
                });
              }
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: error?.message || "Failed to delete payment",
              });
            }
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate(loan ? `/loans?tab=${loan.type}` : "/loans");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [loan, router]),
  );

  if (finalShowSkeleton) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Loan Details",
            headerBackTitle: "Back",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.navigate("/loans")}
                style={{ marginRight: 4 }}
              >
                <ChevronLeft size={26} className="text-foreground" />
              </TouchableOpacity>
            ),
          }}
        />
        <ScreenContainer className="px-4 bg-background">
          <View className="mt-4 gap-6">
            {/* Header Card Skeleton */}
            <View className="bg-card rounded-2xl p-4 border border-border shadow-sm animate-pulse">
              <View className="flex-row justify-between items-center border-b border-border pb-4 mb-4">
                <View className="w-1/4 h-5 bg-muted rounded-md" />
                <View className="w-1/3 h-6 bg-muted rounded-md" />
              </View>
              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <View className="w-1/4 h-4 bg-muted rounded-md" />
                  <View className="w-1/4 h-5 bg-muted rounded-md" />
                </View>
                <View className="flex-row justify-between items-center">
                  <View className="w-1/4 h-4 bg-muted rounded-md" />
                  <View className="w-1/4 h-5 bg-muted rounded-md" />
                </View>
                <View className="flex-row justify-between items-center">
                  <View className="w-1/4 h-4 bg-muted rounded-md" />
                  <View className="w-1/4 h-5 bg-muted rounded-md" />
                </View>
              </View>
            </View>

            {/* Payment Summary Section Skeleton */}
            <View className="bg-card rounded-2xl h-[60px] border border-border shadow-sm animate-pulse" />

            {/* Payments List Skeleton */}
            <View className="gap-3">
              <View className="w-1/3 h-6 bg-surface rounded-lg my-1 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="rounded-2xl h-[80px] bg-card border border-border animate-pulse"
                />
              ))}
            </View>
          </View>
        </ScreenContainer>
      </>
    );
  }

  if (!loan) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Loan Details",
            headerBackTitle: "Back",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.navigate("/loans")}
                style={{ marginRight: 4 }}
              >
                <ChevronLeft size={26} className="text-foreground" />
              </TouchableOpacity>
            ),
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

  const progress =
    loan.amount > 0
      ? Math.min(Math.max((loan.paid_amount / loan.amount) * 100, 0), 100)
      : 0;
  const remaining = Math.max(loan.amount - loan.paid_amount, 0);
  const isComplete = progress >= 100;

  return (
    <ScreenContainer edges={["left", "right"]} className="py-4 bg-background">
      <View className="flex-1">
        <Stack.Screen
          options={{
            headerShown: true,
            title: selectedPayment
              ? "1 Selected"
              : loanData?.data?.person_name || "Loan Details",
            headerBackTitle: "Back",
            headerLeft: () => {
              if (selectedPayment) {
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedPayment(null)}
                    style={{ marginRight: 8 }}
                  >
                    <X size={22} className="text-foreground" />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  onPress={() => router.navigate(`/loans?tab=${loan.type}`)}
                  style={{ marginRight: 4 }}
                >
                  <ChevronLeft size={26} className="text-foreground" />
                </TouchableOpacity>
              );
            },
            headerRight: () => {
              if (selectedPayment) {
                return (
                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                      onPress={handleEditPayment}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Edit3 size={20} className="text-foreground" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeletePayment}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={20} className="text-destructive" />
                    </TouchableOpacity>
                  </View>
                );
              }
              return null;
            },
          }}
        />

        <FlatList
          data={sortedPayments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          refreshControl={<RefreshControl {...refreshControlProps} />}
          className="px-4"
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                if (selectedPayment) {
                  setSelectedPayment(
                    item.id === selectedPayment.id ? null : item,
                  );
                } else {
                  // Optionally open details or do nothing
                }
              }}
              onLongPress={() => setSelectedPayment(item)}
              className={`px-4 py-4 flex-row justify-between bg-card rounded-2xl mb-2 border border-border ${selectedPayment?.id === item.id ? "bg-primary/10" : ""}`}
            >
              <View className="flex-1 mr-3">
                <Text
                  className={`text-base mb-2 font-medium ${item.remark ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {item.remark || "No remark"}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {new Date(item.created_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View className="items-end justify-center">
                <Text className="text-base font-bold mb-2 text-green-600">
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <>
              {/* Top Summary Card - matching wallet structure */}
              <View className="bg-card mb-4 rounded-2xl shadow-sm border border-border">
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
        <View
          style={{
            marginBottom: Math.min(insets.bottom, 28),
          }}
          className="px-4 pt-3 pb-2 bg-background border-t border-border"
        >
          <Button onPress={openAddPayment} className="bg-primary">
            <Text className="text-success-foreground font-bold text-[14px]">
              + ADD PAYMENT
            </Text>
          </Button>
        </View>
      </View>

      {/* Create/Edit Payment Modal */}
      <CreatePaymentModal
        visible={showPaymentModal}
        onClose={handleClosePaymentModal}
        loanId={id!}
        editPayment={editingPayment}
      />
    </ScreenContainer>
  );
}
