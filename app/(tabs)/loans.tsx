import { useDeleteLoan, useGetAllLoans } from "@/api/loan";
import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import { LoanCard } from "@/components/loan/loan-card";
import { ScreenContainer } from "@/components/screen-container";
import { LoansSkeleton } from "@/components/skeletons/loans-skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { H3, Muted } from "@/components/ui/typography";
import { useDebounce } from "@/hooks/use-debounce";
import { usePullToRefreshSkeletonWithSearch } from "@/hooks/use-pull-to-refresh-skeleton";
import { CrossIcon } from "@/icons/cross-icon";
import { FilterIcon } from "@/icons/filter-icon";
import { PlusIcon } from "@/icons/plus-icon";
import { SearchIcon } from "@/icons/search-icon";
import { Loan } from "@/interface/loan";
import { formatCurrency } from "@/utils/index";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type SortOption = "person_name" | "updated_at" | "created_at";

const SORT_OPTIONS: {
  key: SortOption;
  label: string;
  order: "asc" | "desc";
}[] = [
  { key: "updated_at", label: "Last Updated", order: "desc" },
  { key: "person_name", label: "Name (A-Z)", order: "asc" },
  { key: "created_at", label: "Last Created", order: "desc" },
];

type LoanTab = "GIVEN" | "TAKEN";

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-2.5 rounded-md items-center justify-center ${
        active ? "bg-primary" : ""
      }`}
    >
      <Text
        className={`font-semibold text-sm ${
          active ? "text-white" : "text-muted-foreground"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function LoansScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: LoanTab }>();
  const [activeTab, setActiveTab] = useState<LoanTab>(params.tab || "GIVEN");

  useEffect(() => {
    if (params.tab && (params.tab === "GIVEN" || params.tab === "TAKEN")) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);

  const [tempSortBy, setTempSortBy] = useState<SortOption>("updated_at");
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">("desc");

  const openSortModal = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setShowSortModal(true);
  };

  const { data, isLoading, error, refetch } = useGetAllLoans({
    type: activeTab,
    search: debouncedSearchQuery.trim() || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const loans: Loan[] = data?.data ?? [];

  const deleteLoanMutation = useDeleteLoan();

  const { showSkeleton, refreshControlProps } =
    usePullToRefreshSkeletonWithSearch(async () => {
      await refetch();
    }, debouncedSearchQuery.trim());

  const finalShowSkeleton = isLoading || showSkeleton;

  const handleDeleteLoan = (loan: Loan) => {
    setLoanToDelete(loan);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!loanToDelete) return;

    try {
      const res: any = await deleteLoanMutation.mutateAsync(loanToDelete.id);

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
    } finally {
      setLoanToDelete(null);
    }
  };

  const handleEditLoan = (loan: Loan) => {
    router.push({
      pathname:
        activeTab === "GIVEN" ? "/loan/create-lent" : "/loan/create-borrowed",
      params: {
        editId: loan.id,
        editPersonName: loan.person_name,
        editAmount: loan.amount.toString(),
        editDueDate: loan.due_date || "",
      },
    } as any);
  };

  const meta = data?.meta as any;
  const summary = meta?.summary;
  const totalCount = meta?.total || 0;

  // Calculate total left properly for borrowed vs lent loans
  const calculateTotalLeft = () => {
    if (!loans || loans.length === 0) return 0;

    return loans.reduce((total, loan) => {
      const remaining = Math.max(loan.amount - loan.paid_amount, 0);
      return total + remaining;
    }, 0);
  };

  const totalLeft = calculateTotalLeft();

  if (error) {
    return (
      <ScreenContainer className="p-4 pb-0 bg-background">
        <View className="bg-surface rounded-xl p-8 items-center border border-border">
          <Text className="text-lg font-semibold mb-2">
            Something went wrong
          </Text>

          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary px-6 py-2 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      edges={["left", "right"]}
      className="p-4 pb-0 bg-background"
    >
      {/* Search Input */}
      <View className="relative flex-row items-center gap-2 mb-2">
        <View className="flex-row items-center bg-white rounded-xl px-3 border border-border flex-1">
          <SearchIcon className="text-muted-foreground size-4" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("loans.searchLoans")}
            placeholderClassName="text-muted-foreground"
            className="flex-1 text-base text-foreground"
            placeholderTextColor="#94a3b8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="ml-2 p-1"
            >
              <CrossIcon className="text-muted-foreground size-4" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={openSortModal}
          className="size-12 bg-card rounded-xl border border-border items-center justify-center"
        >
          <FilterIcon className="text-primary size-5" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="mb-2 flex-row bg-muted rounded-lg p-1">
        <TabButton
          label={t("loans.lent")}
          active={activeTab === "GIVEN"}
          onPress={() => setActiveTab("GIVEN")}
        />

        <TabButton
          label={t("loans.borrowed")}
          active={activeTab === "TAKEN"}
          onPress={() => setActiveTab("TAKEN")}
        />
      </View>

      {/* Content Area - Loading only here */}
      {finalShowSkeleton ? (
        <LoansSkeleton />
      ) : loans.length === 0 ? (
        <View className="flex-1 items-center justify-center -mt-14 py-8">
          <SearchIcon className="text-muted-foreground size-12" />
          <Text className="text-muted-foreground text-base mt-2">
            {searchQuery.trim()
              ? `No loans found for "${searchQuery}"`
              : `${activeTab === "GIVEN" ? t("loans.noLoansGivenYet") : t("loans.noLoansBorrowedYet")}`}
          </Text>
          <Text className="text-sm text-muted-foreground text-center mb-4">
            {activeTab === "GIVEN"
              ? t("loans.recordMoneyYouveLent")
              : t("loans.recordMoneyYouveBorrowed")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={loans}
          extraData={activeTab}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <LoanCard
              loan={item}
              index={index}
              onEdit={handleEditLoan}
              onDelete={handleDeleteLoan}
            />
          )}
          ListHeaderComponent={
            summary && totalCount > 0 ? (
              <View className="flex-row justify-between bg-card rounded-xl p-3 border border-border">
                <View className="flex-1 border-r border-border pr-2">
                  <Text className="text-xs text-muted-foreground mb-0.5">
                    Total Left
                  </Text>
                  <Text
                    className="text-lg font-bold text-foreground"
                    numberOfLines={1}
                  >
                    {formatCurrency(totalLeft)}
                  </Text>
                </View>
                <View className="flex-1 pl-3 justify-center">
                  <Text className="text-xs text-muted-foreground mb-0.5">
                    {totalCount} Loans
                  </Text>
                  <View className="flex-row items-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
                    <Text className="text-xs font-medium text-foreground">
                      {summary.total_fulfilled || 0} Fulfilled
                    </Text>
                  </View>
                </View>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl {...refreshControlProps} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <Button
        onPress={() =>
          router.push(
            activeTab === "GIVEN"
              ? "/loan/create-lent"
              : "/loan/create-borrowed",
          )
        }
        className="rounded-full py-4 absolute bottom-4 right-4"
      >
        <PlusIcon className="text-primary-foreground size-6" />
        <Text className="text-primary-foreground text-lg text-center ml-2">
          {t("loans.addLoan")}
        </Text>
      </Button>

      {/* Sort Modal */}
      <BottomSheetModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
      >
        <View className="px-6 pt-3" style={{ paddingBottom: 30 }}>
          {/* Handle */}
          <View className="items-center mb-5">
            <View className="w-10 h-1 rounded-full bg-foreground" />
          </View>

          {/* Title */}
          <View className="flex-row items-center justify-between mb-2 border-b border-border pb-4">
            <H3>{t("loans.sortLoansBy")}</H3>
            <TouchableOpacity
              onPress={() => setShowSortModal(false)}
              className="p-1"
            >
              <CrossIcon className="size-4" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="mb-5">
            {SORT_OPTIONS.map((option, index) => {
              const isActive = tempSortBy === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setTempSortBy(option.key);
                    setTempSortOrder(option.order);
                  }}
                  className={`flex-row items-center py-3`}
                >
                  {/* Radio Circle */}
                  <View
                    className={`size-4 items-center justify-center border border-foreground rounded-full mr-3 ${isActive ? "border-primary" : "border-border"}`}
                  >
                    {isActive && (
                      <View className="size-2 rounded-full bg-primary" />
                    )}
                  </View>
                  <Muted>{option.label}</Muted>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            onPress={() => {
              setSortBy(tempSortBy);
              setSortOrder(tempSortOrder);
              setShowSortModal(false);
            }}
          >
            Apply
          </Button>
        </View>
      </BottomSheetModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Loan"
        itemName={loanToDelete?.person_name}
        isLoading={deleteLoanMutation.isPending}
      />
    </ScreenContainer>
  );
}
