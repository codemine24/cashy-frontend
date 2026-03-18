import { useTransactions } from "@/api/transaction";
import { ScreenContainer } from "@/components/screen-container";
import { useDebounce } from "@/hooks/use-debounce";
import { Transaction } from "@/interface/wallet";
import { ArrowLeft, Search, X } from "@/lib/icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchTransactionsScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);
  const inputRef = useRef<TextInput>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const { data: transactionsData, isLoading, refetch } = useTransactions({
    book_id: bookId as string,
    search: debouncedQuery.trim() || undefined,
    limit: 50,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const searchData = transactionsData?.data;
  const transactions: Transaction[] = useMemo(() => searchData?.transactions ?? [], [searchData?.transactions]);

  const groupedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Sort by created_at descending
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Calculate running balance based on the current balance in the search result
    let runningBalance = searchData?.balance ?? 0;
    const annotated = sorted.map((t) => {
      const current = runningBalance;
      const amountValue = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
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
  }, [transactions, searchData?.balance]);

  const handleOpenTransaction = (item: Transaction) => {
    router.push({
      pathname: "/wallet/transaction-detail",
      params: {
        bookId: item.book_id,
        transactionId: item.id,
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerTitle: () => (
            <View className="flex-row items-center flex-1 mr-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-3 p-1"
              >
                <ArrowLeft size={22} className="text-foreground" />
              </TouchableOpacity>
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-1">
                <Search size={18} className="text-black" />
                <TextInput
                  ref={inputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by remark and amount..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-base text-gray-900"
                  autoFocus={true}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      inputRef.current?.clear();
                    }}
                    className="ml-2 p-1"
                  >
                    <X size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ),
          headerTitleAlign: "left",
          headerShadowVisible: false,
        }}
      />
      <ScreenContainer edges={["left", "right"]} className="flex-1 bg-background">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#00929A" />
          </View>
        ) : !debouncedQuery.trim() ? (
          /* State 1: Not searched yet */
          <View className="flex-1 items-center justify-center p-6">
            <View className="bg-muted p-6 rounded-full mb-4">
              <Search size={40} className="text-muted-foreground" />
            </View>
            <Text className="text-foreground text-lg font-semibold mb-2">
              Search Transactions
            </Text>
            <Text className="text-muted-foreground text-center">
              Type something to find transactions by remark or amount.
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          /* State 2: Searched but not found */
          <View className="flex-1 items-center justify-center p-6">
            <View className="bg-muted p-6 rounded-full mb-4">
              <X size={40} className="text-muted-foreground" />
            </View>
            <Text className="text-foreground text-lg font-semibold mb-2">
              No results found
            </Text>
            <Text className="text-muted-foreground text-center">
              We couldn&apos;t find any transactions matching &quot;{debouncedQuery}&quot;.
            </Text>
          </View>
        ) : (
          /* State 3: Search and found */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Header Card / Balance Summary */}
            <View className="bg-card rounded-2xl mb-6 shadow-sm border border-border">
              <View className="px-4 py-4 flex-row justify-between items-center border-b border-border">
                <Text className="text-foreground font-bold text-[15px]">
                  Net Balance
                </Text>
                <Text className="text-foreground font-bold text-[15px]">
                  {searchData?.balance}
                </Text>
              </View>
              <View className="px-4 py-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-foreground font-bold text-[13px]">
                    Total In (+)
                  </Text>
                  <Text className="text-success font-semibold text-[13px]">
                    {searchData?.in}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground font-bold text-[13px]">
                    Total Out (-)
                  </Text>
                  <Text className="text-destructive font-semibold text-[13px]">
                    {searchData?.out}
                  </Text>
                </View>
              </View>
            </View>

            {/* Showing X entries separator */}
            <View className="flex-row items-center justify-center mb-5 px-6 rounded-2xl">
              <View className="flex-1 h-[1px] bg-border" />
              <Text className="text-muted-foreground font-medium text-[11px] mx-4 tracking-wide">
                Showing {transactions.length} entries
              </Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>

            {/* Grouped Transactions List */}
            {groupedTransactions.map((group) => (
              <View key={group.date}>
                {/* Date Header */}
                <View className="bg-surface py-2 rounded-lg">
                  <Text className="text-muted-foreground text-[13px] font-bold tracking-wide">
                    {group.date}
                  </Text>
                </View>

                {/* Transactions */}
                {group.data.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleOpenTransaction(item)}
                    className={`rounded-2xl mt-2 px-4 py-4 flex-row justify-between bg-card border border-border ${index !== group.data.length - 1 ? "mb-1" : ""}`}
                  >
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center mb-1">
                        <View className={`px-2 py-[2px] rounded-lg ${item.type === "IN" ? "bg-green-600/10" : "bg-red-600/10"}`}>
                          <Text className={`text-[10px] font-bold tracking-wider ${item.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                            {item.type === "IN" ? "CASH IN" : "CASH OUT"}
                          </Text>
                        </View>
                        {item.category && (
                          <Text className="text-[10px] text-muted-foreground font-medium ml-2 uppercase">
                            • {item.category}
                          </Text>
                        )}
                      </View>

                      <Text className="text-sm mb-1 font-medium text-foreground" numberOfLines={1}>
                        {item.remark || "No remark"}
                      </Text>

                      <Text className="text-[11px] text-muted-foreground">
                        Added on{" "}
                        {new Date(item.created_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }).toLowerCase()}
                      </Text>
                    </View>
                    <View className="items-end justify-center">
                      <Text
                        className={`text-base font-bold mb-1 ${item.type === "IN" ? "text-success" : "text-destructive"
                          }`}
                      >
                        {item.type === "IN" ? "+" : "-"}{item.amount}
                      </Text>
                      {item.runningBalance !== undefined && (
                        <Text className="text-sm text-muted-foreground">
                          Balance: {item.runningBalance}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </ScreenContainer>
    </>
  );
}

