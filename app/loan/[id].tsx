import { useGetLoanDetail } from "@/api/loan";
import { CreatePaymentModal } from "@/components/loan/create-payment-modal";
import { ScreenContainer } from "@/components/screen-container";
import { usePullToRefreshSkeleton } from "@/hooks/use-pull-to-refresh-skeleton";
import { LoanPayment } from "@/interface/loan";
import { formatCurrency } from "@/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: loanData, isLoading, refetch } = useGetLoanDetail(id!);

  const { showSkeleton, refreshControlProps } = usePullToRefreshSkeleton(
    async () => {
      await refetch();
    },
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<LoanPayment | null>(
    null,
  );

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
    setShowPaymentModal(true);
  };

  const openEditPayment = (payment: LoanPayment) => {
    setEditingPayment(payment);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setEditingPayment(null);
    refetch();
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: loanData?.data?.person_name || "Loan Details",
          headerBackTitle: "Back",
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
                <Text className="text-foreground text-sm font-semibold tracking-wide">
                  {title}
                </Text>
              </View>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onLongPress={() => openEditPayment(item)}
                  className={`px-4 py-4 flex-row justify-between ${index !== data.length - 1 ? "border-b border-border" : ""
                    }`}
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

      {/* Create/Edit Payment Modal */}
      <CreatePaymentModal
        visible={showPaymentModal}
        onClose={handleClosePaymentModal}
        loanId={id!}
        editPayment={editingPayment}
      />
    </>
  );
}
