import { useDeleteLoan, useGetAllLoans } from "@/api/loan";
import { formatCurrency } from "@/utils/index";
import { LoanCard } from "@/components/loan/loan-card";
import { ScreenContainer } from "@/components/screen-container";
import { LoansSkeleton } from "@/components/skeletons/loans-skeleton";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/icons/plus-icon";
import { Loan } from "@/interface/loan";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type LoanTab = "GIVEN" | "TAKEN";

export default function LoansScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LoanTab>("GIVEN");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useGetAllLoans({
    type: activeTab,
  });

  console.log("meta", data?.meta);

  const loans: Loan[] = data?.data ?? [];

  const deleteLoanMutation = useDeleteLoan();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDeleteLoan = (loan: Loan) => {
    Alert.alert(
      "Delete Loan",
      `Delete loan for "${loan.person_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res: any = await deleteLoanMutation.mutateAsync(loan.id);

              if (res?.success) {
                Toast.show({
                  type: "success",
                  text1: "success",
                  text2: res?.message || "Loan deleted successfully",
                });
                refetch();
              } else {
                Toast.show({
                  type: "error",
                  text1: "error",
                  text2: res?.message || "Delete failed",
                });
              }
            } catch (e: any) {
              Toast.show({
                type: "error",
                text1: "error",
                text2: e?.message || "Something went wrong",
              });
            }
          },
        },
      ]
    );
  };

  const handleEditLoan = (loan: Loan) => {
    router.push({
      pathname: "/loan/edit",
      params: { id: loan.id },
    } as any);
  };

  const meta = data?.meta as any;
  const summary = meta?.summary;
  const totalCount = meta?.total || 0;

  const renderHeader = () => (
    <>
      {/* Title */}
      <View className="mb-4">
        <Text className="text-3xl font-bold text-foreground">Loans</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Track money you lent or borrowed
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-muted rounded-2xl p-1 mb-3">
        <TabButton
          label="Lent"
          subtitle="Money lent"
          active={activeTab === "GIVEN"}
          onPress={() => setActiveTab("GIVEN")}
        />

        <TabButton
          label="Borrowed"
          subtitle="Money borrowed"
          active={activeTab === "TAKEN"}
          onPress={() => setActiveTab("TAKEN")}
        />
      </View>

      {/* Summary Section */}
      {summary && totalCount > 0 && (
        <View className="flex-row justify-between bg-card rounded-2xl p-4 mb-1 border border-border">
          <View className="flex-1 border-r border-border pr-2">
            <Text className="text-sm text-muted-foreground mb-1">Total Left</Text>
            <Text className="text-2xl font-bold text-foreground" numberOfLines={1}>
              {formatCurrency(summary.total_remaining || 0)}
            </Text>
          </View>
          <View className="flex-1 pl-4 justify-center">
            <Text className="text-xs text-muted-foreground mb-1">Total Loans: {totalCount}</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-success mr-2" />
              <Text className="text-sm font-medium text-foreground">
                {summary.total_fulfilled || 0} Fulfilled
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View className="bg-surface rounded-xl p-8 items-center border border-border">
      <Text className="text-lg font-semibold text-foreground mb-2">
        No {activeTab === "GIVEN" ? "debtor" : "creditor"} loans
      </Text>

      <Text className="text-sm text-muted-foreground text-center mb-4">
        {activeTab === "GIVEN"
          ? "Record money you've lent"
          : "Record money you've borrowed"}
      </Text>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/loan/create",
            params: { type: activeTab },
          } as any)
        }
        className="bg-primary px-6 py-2 rounded-lg"
      >
        <Text className="text-primary-foreground font-semibold">
          Add Loan
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <ScreenContainer className="p-4 bg-background">
        <LoansSkeleton />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer className="p-4 bg-background">
        <View className="bg-surface rounded-xl p-8 items-center border border-border">
          <Text className="text-lg font-semibold mb-2">
            Something went wrong
          </Text>

          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary px-6 py-2 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer edges={["left", "right"]} className="p-4 bg-background">
        <FlatList
          data={loans}
          extraData={activeTab}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LoanCard
              loan={item}
              onEdit={handleEditLoan}
              onDelete={handleDeleteLoan}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </ScreenContainer>

      {/* Floating Button */}
      <Button
        onPress={() =>
          router.push({
            pathname: "/loan/create",
            params: { type: activeTab },
          } as any)
        }
        className="rounded-full py-4 absolute bottom-4 right-4 flex-row items-center"
      >
        <PlusIcon className="text-primary-foreground size-6" />
        <Text className="text-primary-foreground text-lg ml-2">
          Add Loan
        </Text>
      </Button>
    </>
  );
}

function TabButton({
  label,
  subtitle,
  active,
  onPress,
}: {
  label: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-3 rounded-xl items-center ${active ? "bg-primary shadow-sm" : ""
        }`}
    >
      <Text
        className={`font-semibold ${active ? "text-white" : "text-muted-foreground"
          }`}
      >
        {label}
      </Text>

      <Text
        className={`text-[10px] mt-0.5 ${active ? "text-foreground" : "text-muted-foreground/60"
          }`}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}