import { useBook } from "@/api/book";
import { ScreenContainer } from "@/components/screen-container";
import { BookDetailSkeleton } from "@/components/skeletons/book-detail-skeleton";

import { useDeleteTransaction } from "@/api/transaction";
import { useAuth } from "@/context/auth-context";
import { Copy, Edit3, Trash2, UserPlus, Users, X } from "@/lib/icons";
import { formatCurrency } from "@/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: book, isLoading, refetch } = useBook(id!);

  const { authState } = useAuth();
  const deleteTransaction = useDeleteTransaction();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const groupedTransactions = useMemo(() => {
    if (!book?.data?.transactions) return [];

    const sorted = [...book.data.transactions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    let runningBalance = book.data.balance;
    const annotated = sorted.map((t) => {
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
  }, [book?.data?.transactions, book?.data?.balance]);

  if (isLoading) {
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
      pathname: "/book/add-transaction",
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
      pathname: "/book/add-transaction",
      params: {
        bookId: id,
        type: selectedTransaction.type,
        editAmount: selectedTransaction.amount?.toString(),
        editRemark: selectedTransaction.remark || "",
        editType: selectedTransaction.type,
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
      pathname: "/book/transaction-detail",
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
                  >
                    <Edit3 size={20} className="text-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDuplicate}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Copy size={20} className="text-foreground" />
                  </TouchableOpacity>
                  {canDelete && (
                    <TouchableOpacity
                      onPress={handleDelete}
                      className="p-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                    pathname: "/book/members",
                    params: { bookId: id, bookName: book.data.name },
                  })
                }
                style={{ marginRight: 4, padding: 6 }}
              >
                <UserPlus size={22} className="text-primary" />
              </TouchableOpacity>
            );
          },
        }}
      />
      {/* <ScreenContainer className="px-4"> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-4 bg-background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <View className="bg-card mt-4 rounded-2xl mb-6 shadow-sm border border-border">
          <View className="px-4 py-4 flex-row justify-between items-center border-b border-border">
            <Text className="text-foreground font-bold text-[15px]">
              Net Balance
            </Text>
            <Text className="text-foreground font-bold text-[15px]">
              {formatCurrency(book.data.balance)}
            </Text>
          </View>
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-foreground font-bold text-[13px]">
                Total In (+)
              </Text>
              <Text className="text-success font-semibold text-[13px]">
                {formatCurrency(book.data.in)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground font-bold text-[13px]">
                Total Out (-)
              </Text>
              <Text className="text-destructive font-semibold text-[13px]">
                {formatCurrency(book.data.out)}
              </Text>
            </View>
          </View>
        </View>

        {/* Members Section */}
        {book?.data?.others_member?.length > 0 && (
          <View className="bg-card rounded-2xl mb-6 border border-border shadow-sm">
            {/* Header */}
            <View className="px-4 py-3 flex-row items-center justify-between border-b border-border">
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
                      pathname: "/book/members",
                      params: { bookId: id, bookName: book.data.name },
                    })
                  }
                >
                  <Text className="text-primary text-[13px] font-semibold">
                    See All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Member rows */}
            {book.data.others_member
              .slice(0, 2)
              .map((member: any, index: number) => {
                const name = member.name || "Anonymous";
                const email = member.email;
                const role: string = member.role || "";
                const initial = name.charAt(0).toUpperCase();
                return (
                  <View
                    key={member.id || index}
                    className={`px-4 py-3 flex-row items-center justify-between ${index !== Math.min(book.data.others_member.length, 2) - 1
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
                      className={`px-2 py-1 rounded-md ${role === "EDITOR"
                        ? "bg-blue-500/10"
                        : role === "ADMIN"
                          ? "bg-purple-500/10"
                          : "bg-surface"
                        }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${role === "EDITOR"
                          ? "text-blue-500"
                          : role === "ADMIN"
                            ? "text-purple-500"
                            : "text-muted-foreground"
                          }`}
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
                    pathname: "/book/members",
                    params: { bookId: id, bookName: book.data.name },
                  })
                }
                className="px-4 py-3 border-t border-border items-center"
              >
                <Text className="text-primary text-[13px] font-semibold">
                  +{book.data.others_member.length - 2} more members
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Showing X entries */}
        <View className="flex-row items-center justify-center mb-5 px-6 rounded-2xl">
          <View className="flex-1 h-[1px] bg-border" />
          <Text className="text-muted-foreground font-medium text-[11px] mx-4 tracking-wide">
            Showing {book?.data?.transactions?.length} entries
          </Text>
          <View className="flex-1 h-[1px] bg-border" />
        </View>

        {/* Transactions List */}
        {book?.data?.transactions?.length === 0 ? (
          <View className="mx-4 bg-card rounded-xl p-8 items-center justify-center border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              No transactions
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              Add your first transaction to start tracking
            </Text>
          </View>
        ) : (
          <View className="bg-transparent w-full">
            {groupedTransactions.map((group) => (
              <View key={group.date}>
                {/* Date Header: Full width */}
                <View className="bg-surface py-2 px-4 rounded-lg my-1">
                  <Text className="text-muted-foreground text-[13px] font-bold tracking-wide">
                    {group.date}
                  </Text>
                </View>

                {/* Transactions */}
                {group.data.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
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
                    className={`rounded-2xl mt-4 px-4 py-4 flex-row justify-between bg-card border ${selectedTransaction?.id === item.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                      } ${index !== group.data.length - 1 ? "mb-1" : ""}`}
                  >
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className={`px-2 py-[2px] rounded-xl ${item.type === "IN" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                          <Text className={`text-[11px] font-bold uppercase tracking-wider ${item.type === "IN" ? "text-green-500" : "text-red-500"}`}>
                            CASH {item.type}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm mb-2 font-medium text-foreground">
                        {item.remark || item.category || "No remark"}
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
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(item.runningBalance)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* </ScreenContainer> */}

      {/* Floating Action Buttons */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row px-4 pb-8 pt-3 bg-card border-t border-border shadow-sm gap-3"
      >
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/book/add-transaction",
              params: { bookId: id, type: "IN" },
            });
          }}
          className="flex-1 rounded-2xl bg-success py-3.5 items-center justify-center"
        >
          <Text className="text-success-foreground font-bold text-[14px] tracking-widest">
            + CASH IN
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/book/add-transaction",
              params: { bookId: id, type: "OUT" },
            });
          }}
          className="flex-1 rounded-2xl bg-destructive py-3.5 items-center justify-center"
        >
          <Text className="text-destructive-foreground font-bold text-[14px] tracking-widest">
            - CASH OUT
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}