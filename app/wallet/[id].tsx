import { useBook } from "@/api/wallet";
import { ScreenContainer } from "@/components/screen-container";

import { useGetCategories } from "@/api/category";
import {
  useDeleteTransaction,
  useInfiniteTransactions,
} from "@/api/transaction";
import { BookDetailSkeleton } from "@/components/skeletons/book-detail-skeleton";
import { Button } from "@/components/ui/button";
import { ReportModal, ReportType } from "@/components/wallet/report-modal";
import {
  DEFAULT_FILTERS,
  TransactionFilters,
  buildFilterParams,
  type CategoryOption,
  type MemberOption,
  type TransactionFilterValues,
} from "@/components/wallet/transaction-filters";
import { useAuth } from "@/context/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import { usePullToRefreshSkeletonWithSearch } from "@/hooks/use-pull-to-refresh-skeleton";
import { SearchIcon } from "@/icons/search-icon";
import { ChevronRight, Copy, Edit3, Trash2, UserPlus, Users, X } from "@/lib/icons";
import { formatNumber } from "@/utils";
import { getAccessToken } from "@/utils/auth";
import { isOwner, isWalletViewer } from "@/utils/is-owner";
import { File as ExpoFile, Paths } from "expo-file-system";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Transaction interface
interface Transaction {
  id: string;
  amount: string;
  attachment: any[];
  book: {
    created_at: string;
    name: string;
    updated_at: string;
  };
  book_id: string;
  category?: {
    title: string;
  };
  category_id?: string;
  created_at: string;
  entry_by: {
    avatar: string;
    email: string;
    name: string;
  };
  entry_by_id: string;
  remark: string;
  runningBalance: number;
  type: "IN" | "OUT";
  update_by_id?: string;
  updated_at: string;
  updated_by?: any;
}

export default function BookDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [filters, setFilters] =
    useState<TransactionFilterValues>(DEFAULT_FILTERS);
  const _filterParams = useMemo(() => buildFilterParams(filters), [filters]);

  const { data: book, isLoading, refetch } = useBook(id!);

  const {
    data: txPages,
    isLoading: transactionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchTransactions,
  } = useInfiniteTransactions({
    book_id: id!,
    limit: 10,
    ..._filterParams,
    search: debouncedQuery.trim() || undefined,
  });

  // Flatten all pages into a single transaction list
  const allTransactions = useMemo(
    () =>
      txPages?.pages.flatMap((page) => page?.data?.transactions ?? []) ?? [],
    [txPages],
  );

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType>("all");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { authState } = useAuth();

  const deleteTransaction = useDeleteTransaction();

  const { showSkeleton, refreshControlProps } =
    usePullToRefreshSkeletonWithSearch(async () => {
      await Promise.all([refetch(), refetchTransactions()]);
    }, searchQuery.trim());
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Fetch categories for the filter
  const { data: categoriesData } = useGetCategories();

  // Build members list from book data for the filter
  const filterMembers: MemberOption[] = useMemo(() => {
    if (!book?.data?.others_member) return [];
    return book.data.others_member.map((m: any) => ({
      id: m.id,
      name: m.name || "",
      email: m.email || "",
    }));
  }, [book?.data?.others_member]);

  // Build categories list for the filter
  const filterCategories: CategoryOption[] = useMemo(() => {
    if (!categoriesData?.data) return [];
    return categoriesData.data.map((c: any) => ({
      id: c.id,
      title: c.title || "",
    }));
  }, [categoriesData?.data]);

  const finalShowSkeleton =
    isLoading || (transactionsLoading && !searchQuery) || showSkeleton;

  const groupedTransactions = useMemo(() => {
    if (!allTransactions.length) return [];

    const sorted = [...allTransactions].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    let runningBalance = book?.data?.balance ?? 0;
    const annotated = sorted.map((t: any) => {
      const current = runningBalance;
      const amountValue =
        typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
      if (t.type === "IN") {
        runningBalance -= amountValue;
      } else {
        runningBalance += amountValue;
      }
      return { ...t, runningBalance: current };
    });

    const groups: { date: string; data: typeof annotated }[] = [];
    annotated.forEach((t) => {
      const date = new Date(t.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const group = groups.find((g) => g.date === date);
      if (group) {
        group.data.push(t);
      } else {
        groups.push({ date, data: [t] });
      }
    });

    return groups;
  }, [allTransactions, book?.data?.balance]);

  // Convert grouped transactions to SectionList format
  const sections = useMemo(
    () => groupedTransactions.map((g) => ({ title: g.date, data: g.data })),
    [groupedTransactions],
  );

  // Calculate filtered balance values from filtered transactions
  const filteredBalance = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;

    allTransactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      if (transaction.type === "IN") {
        totalIn += amount;
      } else {
        totalOut += amount;
      }
    });

    const netBalance = totalIn - totalOut;

    return {
      netBalance,
      totalIn,
      totalOut,
    };
  }, [allTransactions]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true);

      const mappedType = selectedReport || "all";
      const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL;

      const queryParams = new URLSearchParams();
      queryParams.append("report_type", mappedType);

      if (debouncedQuery.trim()) {
        queryParams.append("search_term", debouncedQuery.trim());
      }

      Object.entries(_filterParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(","));
        } else if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const url = `${baseUrl}/transaction/book/${id}/export-pdf?${queryParams.toString()}`;

      if (Platform.OS === "web") {
        window.open(url, "_blank");
        setIsGeneratingPdf(false);
        setReportModalVisible(false);
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication error",
          text2: "Please log in again",
        });
        setIsGeneratingPdf(false);
        return;
      }

      const fileName = `report_${selectedReport}_${Date.now()}.pdf`;
      const file = new ExpoFile(Paths.cache, fileName);

      const downloadRes = await ExpoFile.downloadFileAsync(url, file, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (downloadRes) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Download Report",
          UTI: "com.adobe.pdf",
        });
        setReportModalVisible(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to generate PDF",
          text2: "Download was unsuccessful",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "An error occurred",
        text2: "Failed to export PDF report",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (finalShowSkeleton) {
    return <BookDetailSkeleton />;
  }

  if (!book) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-foreground">Book not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const handleEdit = () => {
    if (!selectedTransaction) return;
    router.push({
      pathname: "/wallet/add-transaction",
      params: {
        bookId: id,
        type: selectedTransaction.type,
        editId: selectedTransaction.id,
        editAmount: selectedTransaction.amount?.toString(),
        editRemark: selectedTransaction.remark || "",
        editType: selectedTransaction.type,
        editDate: selectedTransaction.created_at,
        editTime: selectedTransaction.created_at,
        editCategoryId: selectedTransaction.category_id || "",
        editCategoryName: selectedTransaction.category?.title || "",
        attachments: selectedTransaction.attachment || [],
      },
    });
    setSelectedTransaction(null);
  };

  const handleDuplicate = () => {
    if (!selectedTransaction) return;
    router.push({
      pathname: "/wallet/add-transaction",
      params: {
        bookId: id,
        type: selectedTransaction.type,
        editAmount: selectedTransaction.amount?.toString(),
        editRemark: selectedTransaction.remark || "",
        editType: selectedTransaction.type,
        editCategoryId: selectedTransaction.category_id || "",
        editCategoryName: selectedTransaction.category?.title || "",
        attachments: selectedTransaction.attachment || [],
      },
    });
    setSelectedTransaction(null);
  };

  const handleDelete = () => {
    if (!selectedTransaction) return;
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res: any = await deleteTransaction.mutateAsync(
              selectedTransaction.id,
            );

            if (res?.success) {
              Toast.show({
                type: "success",
                text1: "Transaction deleted successfully",
              });
              setSelectedTransaction(null);
              refetch();
            } else {
              Toast.show({
                type: "error",
                text1: res?.message || "Failed to delete transaction",
              });
            }
          },
        },
      ],
    );
  };

  const handleOpenTransaction = (item: any) => {
    router.push({
      pathname: "/wallet/transaction-detail",
      params: {
        bookId: id,
        transactionId: item.id,
      },
    });
  };

  return (
    <View className="flex-1 bg-background px-4">
      <Stack.Screen
        options={{
          title: selectedTransaction ? "1 Selected" : book.data.name,
          headerLeft: selectedTransaction
            ? () => (
              <TouchableOpacity
                onPress={() => setSelectedTransaction(null)}
                style={{ marginLeft: 8, padding: 6 }}
              >
                <X size={22} className="text-foreground" />
              </TouchableOpacity>
            )
            : undefined,
          headerRight: () => {
            if (selectedTransaction) {
              return (
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity
                    onPress={handleEdit}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={isWalletViewer(authState.user?.id, book.data)}
                    style={{
                      opacity: isWalletViewer(authState.user?.id, book.data)
                        ? 0.4
                        : 1,
                    }}
                  >
                    <Edit3 size={20} className="text-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDuplicate}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={isWalletViewer(authState.user?.id, book.data)}
                    style={{
                      opacity: isWalletViewer(authState.user?.id, book.data)
                        ? 0.4
                        : 1,
                    }}
                  >
                    <Copy size={20} className="text-foreground" />
                  </TouchableOpacity>
                  {!!authState.user?.id &&
                    authState.user.id === selectedTransaction.entry_by_id && (
                      <TouchableOpacity
                        onPress={handleDelete}
                        className="p-2"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        disabled={isWalletViewer(authState.user?.id, book.data)}
                        style={{
                          opacity: isWalletViewer(authState.user?.id, book.data)
                            ? 0.4
                            : 1,
                        }}
                      >
                        <Trash2 size={20} className="text-destructive" />
                      </TouchableOpacity>
                    )}
                </View>
              );
            }
            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/wallet/members",
                    params: { bookId: id, bookName: book.data.name },
                  })
                }
                style={{
                  marginRight: 4,
                  padding: 6,
                  opacity: isOwner(authState.user?.id, book.data.created_by)
                    ? 1
                    : 0.4,
                  display: isOwner(authState.user?.id, book.data.created_by)
                    ? "flex"
                    : "none",
                }}
                disabled={!isOwner(authState.user?.id, book.data.created_by)}
              >
                <UserPlus size={22} className="text-foreground" />
              </TouchableOpacity>
            );
          },
        }}
      />

      {/* Search Bar */}
      <View className="flex-row items-center bg-muted rounded-xl px-3 border border-border mt-2">
        <SearchIcon className="text-muted-foreground size-5" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("wallets.searchByAmountOrRemarks")}
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2 text-base text-foreground"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <TransactionFilters
        filters={filters}
        onApplyFilters={setFilters}
        members={filterMembers}
        categories={filterCategories}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl {...refreshControlProps} />}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Header Card */}
            <View className="bg-card mt-2 rounded-2xl mb-4 shadow-sm border border-border">
              <View className="px-3 py-3 flex-row justify-between items-center border-b border-border">
                <Text className="text-foreground font-bold text-[14px]">
                  {t("wallets.netBalance")}
                </Text>
                <Text className="text-foreground font-bold text-[14px]">
                  {formatNumber(filteredBalance.netBalance)}
                </Text>
              </View>
              <View className="px-3 py-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-foreground font-bold text-[12px]">
                    {t("wallets.totalIn")} (+)
                  </Text>
                  <Text className="text-success font-semibold text-[12px]">
                    {formatNumber(filteredBalance.totalIn)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground font-bold text-[12px]">
                    {t("wallets.totalOut")} (-)
                  </Text>
                  <Text className="text-destructive font-semibold text-[12px]">
                    {formatNumber(filteredBalance.totalOut)}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center border-t border-border">
                <TouchableOpacity
                  onPress={() => setReportModalVisible(true)}
                  className="flex-1 items-center py-2.5 gap-x-2 flex-row justify-center"
                >
                  <Text className="text-primary font-semibold text-sm">
                    {t("wallets.viewReport")}
                  </Text>
                  <ChevronRight size={16} className="text-primary" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Members Section */}
            {book?.data?.others_member?.length > 2 &&
              isOwner(authState.user?.id, book.data.created_by) && (
                <View className="bg-card rounded-2xl mb-4 border border-border shadow-sm">
                  {/* Header */}
                  <View className="px-3 py-2 flex-row items-center justify-between border-b border-border">
                    <View className="flex-row items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <Text className="text-foreground text-sm font-semibold tracking-wide ml-2">
                        Members
                      </Text>
                    </View>
                  </View>

                  {/* Member rows */}
                  {book.data.others_member
                    .slice(0, 2)
                    .map((member: any, index: number) => {
                      const name = member.name || "No name";
                      const email = member.email;
                      const role: string = member.role || "";
                      const initial = name.charAt(0).toUpperCase();
                      return (
                        <View
                          key={member.id || index}
                          className={`px-3 py-2 flex-row items-center justify-between ${index !==
                            Math.min(book.data.others_member.length, 2) - 1
                            ? "border-b border-border"
                            : ""
                            }`}
                        >
                          <View className="flex-row items-center flex-1">
                            {/* Avatar */}
                            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-3">
                              <Text className="text-primary font-bold text-[13px]">
                                {initial}
                              </Text>
                            </View>
                            {/* Name & Email */}
                            <View className="flex-1 mr-3">
                              <Text
                                className="text-foreground font-semibold text-[12px]"
                                numberOfLines={1}
                              >
                                {name}
                              </Text>
                              {!!email && (
                                <Text
                                  className="text-muted-foreground text-[10px] mt-0.5"
                                  numberOfLines={1}
                                >
                                  {email}
                                </Text>
                              )}
                            </View>
                          </View>
                          {/* Role badge */}
                          <View
                            className={`px-2 py-1 rounded-lg bg-blue-500/10`}
                          >
                            <Text
                              className={`text-[10px] font-bold text-muted-foreground lowercase`}
                            >
                              {role}
                            </Text>
                          </View>
                        </View>
                      );
                    })}

                  {/* More indicator */}
                  {book.data.others_member.length > 2 && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/wallet/members",
                          params: { bookId: id, bookName: book.data.name },
                        })
                      }
                      className="px-3 py-1 border-t border-border items-center"
                    >
                      <Text className="text-primary text-[10px] font-semibold">
                        +{book.data.others_member.length - 2} more members
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

            {book?.data?.others_member?.length &&
              !isOwner(authState.user?.id, book.data.created_by) && (
                <View className="bg-card rounded-xl mb-6 border border-border shadow-sm py-2">
                  <Text className="text-muted-foreground text-[11px] mt-0.5 text-center">
                    You&apos;ve been added by{" "}
                    {
                      book.data.others_member.find(
                        (member: any) => member.role === "OWNER",
                      )?.email
                    }{" "}
                    as{" "}
                    {
                      book.data.others_member.find(
                        (member: any) => member.id === authState.user?.id,
                      )?.role
                    }
                  </Text>
                </View>
              )}

            {/* Showing X entries */}
            <View className="flex-row items-center justify-center mb-3 px-6 rounded-2xl">
              <View className="flex-1 h-[1px] bg-border" />
              <Text className="text-muted-foreground font-medium text-[10px] mx-4 tracking-wide">
                Showing {allTransactions.length} entries
              </Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>
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
                onPress={() => {
                  if (selectedTransaction) {
                    setSelectedTransaction(
                      item.id === selectedTransaction.id ? null : item,
                    );
                  } else {
                    handleOpenTransaction(item);
                  }
                }}
                onLongPress={() => setSelectedTransaction(item)}
                className={`px-4 py-4 flex-row justify-between ${selectedTransaction?.id === item.id ? "bg-primary/10" : ""
                  } ${index !== data.length - 1 ? "border-b border-border" : ""}`}
              >
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <View
                      className={`px-2 py-[2px] rounded-xl ${item.type === "IN" ? "bg-green-600/20" : "bg-red-600/20"}`}
                    >
                      {item.type === "IN" ? (
                        <Text
                          className={`text-[10px] font-semibold  tracking-wider text-green-600`}
                        >
                          {t("wallets.cashIn")}
                        </Text>
                      ) : (
                        <Text
                          className={`text-[10px] font-semibold  tracking-wider text-red-500`}
                        >
                          {item.category?.title || t("wallets.cashOut")}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Text
                    className={`text-base mb-2 font-medium ${item.remark ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {item.remark || "No remark"}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Updated:{" "}
                    {new Date(item.updated_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {new Date(item.updated_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <View className="items-end justify-center">
                  <Text
                    className={`text-base font-bold mb-2 ${item.type === "IN" ? "text-success" : "text-destructive"
                      }`}
                  >
                    {formatNumber(item.amount)}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Balance: {formatNumber(item.runningBalance)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        ListEmptyComponent={
          transactionsLoading && searchQuery ? (
            <View className="py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  className="bg-card rounded-2xl p-4 mb-2 border border-border"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="w-20 h-4 bg-muted rounded mb-2" />
                      <View className="w-32 h-3 bg-muted rounded" />
                    </View>
                    <View className="w-16 h-4 bg-muted rounded" />
                  </View>
                  <View className="w-24 h-3 bg-muted rounded" />
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-card rounded-2xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No transactions
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Add your first transaction to start tracking
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="rgb(2, 146, 154)" />
            </View>
          ) : null
        }
      />

      {/* Floating Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 flex-row px-4 pb-8 pt-3 bg-card border-t border-border shadow-sm gap-3">
        <Button
          onPress={() => {
            router.push({
              pathname: "/wallet/add-transaction",
              params: { bookId: id, type: "IN" },
            });
          }}
          className="flex-1 bg-success"
          disabled={isWalletViewer(authState.user?.id, book.data)}
        >
          <Text className="text-success-foreground font-bold text-[14px] tracking-widest">
            + {t("wallets.cashIn").toUpperCase()}
          </Text>
        </Button>

        <Button
          onPress={() => {
            router.push({
              pathname: "/wallet/add-transaction",
              params: { bookId: id, type: "OUT" },
            });
          }}
          className="flex-1 bg-destructive"
          disabled={isWalletViewer(authState.user?.id, book.data)}
        >
          <Text className="text-success-foreground font-bold text-[14px]">
            - {t("wallets.cashOut").toUpperCase()}
          </Text>
        </Button>
      </View>

      <ReportModal
        visible={reportModalVisible}
        selectedReport={selectedReport}
        onSelectReport={setSelectedReport}
        onGeneratePdf={handleGeneratePdf}
        onClose={() => setReportModalVisible(false)}
        isGenerating={isGeneratingPdf}
      />
    </View>
  );
}
