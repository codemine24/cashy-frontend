import { useBook } from "@/api/wallet";
import { ScreenContainer } from "@/components/screen-container";

import { useGetCategories } from "@/api/category";
import { useDeleteTransaction, useInfiniteTransactions } from "@/api/transaction";
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
import { SearchIcon } from "@/icons/search-icon";
import { Copy, Edit3, Trash2, UserPlus, Users, X } from "@/lib/icons";
import { isOwner, isWalletViewer } from "@/utils/is-owner";
import { getAccessToken } from "@/utils/auth";
import { Paths, File as ExpoFile } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [filters, setFilters] = useState<TransactionFilterValues>(DEFAULT_FILTERS);
  const _filterParams = useMemo(() => buildFilterParams(filters), [filters]);

  const { data: book, isLoading, refetch } = useBook(id!);
  const {
    data: txPages,
    isLoading: transactionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchTransactions,
  } = useInfiniteTransactions({ book_id: id!, limit: 10, ..._filterParams });

  // Flatten all pages into a single transaction list
  const allTransactions = useMemo(
    () => txPages?.pages.flatMap((page) => page?.data?.transactions ?? []) ?? [],
    [txPages],
  );

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType>("all-entries");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { authState } = useAuth();

  const deleteTransaction = useDeleteTransaction();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchTransactions()]);
    setRefreshing(false);
  }, [refetch, refetchTransactions]);

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

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true);

      const reportTypeMap: Record<ReportType, string> = {
        "all-entries": "all",
        "day-wise": "day_wise",
        "category-wise": "category_wise",
      };

      const mappedType = reportTypeMap[selectedReport];
      const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL;
      const url = `${baseUrl}/transaction/book/${id}/export-pdf?report_type=${mappedType}`;

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
    } catch (error) {
      console.error("[PDF Export Error]", error);
      Toast.show({
        type: "error",
        text1: "An error occurred",
        text2: "Failed to export PDF report",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading || transactionsLoading) {
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
        editCategoryName: selectedTransaction.category || "",
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
    <>
      <Stack.Screen
        options={{
          title: selectedTransaction ? "1 Selected" : book.data.name,
          headerBackTitle: "Books",
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
              const canDelete =
                !!authState.user?.id &&
                authState.user.id === selectedTransaction.entry_by_id;
              return (
                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    onPress={handleEdit}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={isWalletViewer(authState.user?.id, book.data)}
                    style={{ opacity: isWalletViewer(authState.user?.id, book.data) ? 0.4 : 1 }}
                  >
                    <Edit3 size={20} className="text-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDuplicate}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={isWalletViewer(authState.user?.id, book.data)}
                    style={{ opacity: isWalletViewer(authState.user?.id, book.data) ? 0.4 : 1 }}
                  >
                    <Copy size={20} className="text-foreground" />
                  </TouchableOpacity>
                  {canDelete && (
                    <TouchableOpacity
                      onPress={handleDelete}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      disabled={isWalletViewer(authState.user?.id, book.data)}
                      style={{ opacity: isWalletViewer(authState.user?.id, book.data) ? 0.4 : 1 }}
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
                style={{ marginRight: 4, padding: 6, opacity: isOwner(authState.user?.id, book.data.created_by) ? 1 : 0.4 }}
                disabled={!isOwner(authState.user?.id, book.data.created_by)}
              >
                <UserPlus size={22} className="text-foreground" />
              </TouchableOpacity>
            );
          },
        }}
      />

      {/* Search Transactions */}
      <TouchableOpacity
        onPress={() => router.push({
          pathname: "/wallet/search-transactions",
          params: {
            bookId: id,
          },
        } as any)}
        activeOpacity={0.7}
        className="flex-row items-center gap-5 bg-card px-4 py-3.5 border border-border"
      >
        <SearchIcon className="text-muted-foreground" />
        <Text className="text-muted-foreground text-base">
          Search transactions by remark and amount
        </Text>
      </TouchableOpacity>

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
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
        className="bg-background"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Header Card */}
            <View className="bg-card mt-2 rounded-2xl mb-6 shadow-sm border border-border">
              <View className="px-4 py-4 flex-row justify-between items-center border-b border-border">
                <Text className="text-foreground font-bold text-[15px]">
                  Net Balance
                </Text>
                <Text className="text-foreground font-bold text-[15px]">
                  {book.data.balance ?? 0}
                </Text>
              </View>
              <View className="px-4 py-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-foreground font-bold text-[13px]">
                    Total In (+)
                  </Text>
                  <Text className="text-success font-semibold text-[13px]">
                    {book.data.in ?? 0}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground font-bold text-[13px]">
                    Total Out (-)
                  </Text>
                  <Text className="text-destructive font-semibold text-[13px]">
                    {book.data.out ?? 0}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center border-t border-border">
                <TouchableOpacity onPress={() => setReportModalVisible(true)} className="flex-1 items-center py-3">
                  <Text className="text-primary font-semibold text-xl">View Reports</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Members Section */}
            {book?.data?.others_member?.length > 1 && isOwner(authState.user?.id, book.data.created_by) && (
              <View className="bg-card rounded-2xl mb-6 border border-border shadow-sm">
                {/* Header */}
                <View className="px-4 py-2 flex-row items-center justify-between border-b border-border">
                  <View className="flex-row items-center gap-2">
                    <Users size={16} className="text-muted-foreground" />
                    <Text className="text-foreground font-bold text-[14px] ml-2">
                      Members
                    </Text>
                  </View>
                  {book.data.others_member.length > 2 && (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/wallet/members",
                          params: { bookId: id, bookName: book.data.name },
                        })
                      }
                    >
                      <Text className="text-primary text-[11px] font-semibold">
                        See All
                      </Text>
                    </TouchableOpacity>
                  )}
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
                        className={`px-4 py-2 flex-row items-center justify-between ${index !== Math.min(book.data.others_member.length, 2) - 1
                          ? "border-b border-border"
                          : ""
                          }`}
                      >
                        <View className="flex-row items-center flex-1">
                          {/* Avatar */}
                          <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center mr-3">
                            <Text className="text-primary font-bold text-[15px]">
                              {initial}
                            </Text>
                          </View>
                          {/* Name & Email */}
                          <View className="flex-1 mr-3">
                            <Text
                              className="text-foreground font-semibold text-[13px]"
                              numberOfLines={1}
                            >
                              {name}
                            </Text>
                            {!!email && (
                              <Text
                                className="text-muted-foreground text-[11px] mt-0.5"
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
                            className={`text-[11px] font-bold text-muted-foreground lowercase`}
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
                    className="px-4 py-1 border-t border-border items-center"
                  >
                    <Text className="text-primary text-[11px] font-semibold">
                      +{book.data.others_member.length - 2} more members
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {book?.data?.others_member?.length > 1 && !isOwner(authState.user?.id, book.data.created_by) && (
              <View
                className="bg-card rounded-xl mb-6 border border-border shadow-sm py-2"
              >
                <Text className="text-muted-foreground text-[11px] mt-0.5 text-center">
                  You&apos;ve been added by {book.data.others_member.find((member: any) => member.role === "OWNER")?.email} as {book.data.others_member.find((member: any) => member.id === authState.user?.id)?.role}
                </Text>
              </View>
            )}

            {/* Showing X entries */}
            <View className="flex-row items-center justify-center mb-5 px-6 rounded-2xl">
              <View className="flex-1 h-[1px] bg-border" />
              <Text className="text-muted-foreground font-medium text-[11px] mx-4 tracking-wide">
                Showing {allTransactions.length} entries
              </Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>
          </>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-background py-2 rounded-lg">
            <Text className="text-muted-foreground text-[13px] font-bold tracking-wide">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (selectedTransaction) {
                setSelectedTransaction(
                  item.id === selectedTransaction.id ? null : item
                );
              } else {
                handleOpenTransaction(item);
              }
            }}
            onLongPress={() => setSelectedTransaction(item)}
            className={`rounded-2xl mt-2 px-4 py-4 flex-row justify-between bg-card border ${selectedTransaction?.id === item.id
              ? "border-primary bg-primary/10"
              : "border-border"
              } ${index !== section.data.length - 1 ? "mb-1" : ""}`}
          >
            <View className="flex-1 mr-2">
              <View className="flex-row items-center justify-between mb-2">
                <View className={`px-2 py-[2px] rounded-xl ${item.type === "IN" ? "bg-green-600/20" : "bg-red-600/20"}`}>
                  {item.type === "IN" ? <Text className={`text-[11px] font-bold  tracking-wider text-green-600`}>
                    Cash in
                  </Text> : <Text className={`text-[11px] font-bold  tracking-wider text-red-500`}>
                    Cash out
                  </Text>}
                </View>
              </View>

              <Text className="text-sm mb-2 font-medium text-foreground">
                {item.remark || item.category?.title || "No remark"}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Added on{" "}
                {new Date(item.created_at)
                  .toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                  .toLowerCase()}
              </Text>
            </View>
            <View className="items-end justify-center">
              <Text
                className={`text-sm font-bold mb-1 ${item.type === "IN"
                  ? "text-success"
                  : "text-destructive"
                  }`}
              >
                {item.amount}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Balance: {item.runningBalance}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="bg-card rounded-xl p-8 items-center justify-center border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              No transactions
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              Add your first transaction to start tracking
            </Text>
          </View>
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
      <View
        className="absolute bottom-0 left-0 right-0 flex-row px-4 pb-8 pt-3 bg-card border-t border-border shadow-sm gap-3"
      >
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
            + CASH IN
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
            - CASH OUT
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
    </>
  );
}