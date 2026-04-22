import { useWalletStats } from "@/api/statistics";
import { useBooks } from "@/api/wallet";
import { Period } from "@/app/(tabs)/statistics";
import { DateRangeModal } from "@/components/date-range-modal";
import { H3, P } from "@/components/ui/typography";
import { useTheme } from "@/context/theme-context";
import { formatCurrency } from "@/utils";
import { getAccessToken } from "@/utils/auth";
import { cn } from "@/utils/cn";
import { File as ExpoFile, Paths } from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { BarChart3, Download, TrendingUp } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { colors, ExpenseByCategoryChart } from "./expense-by-category-chart";
import { IncomeVsExpenseChart } from "./income-vs-expense-chart";
import { TopSourcesChart } from "./top-sources-chart";

export function WalletStatistics() {
  const router = useRouter();
  const { book_id } = useLocalSearchParams<{ book_id?: string }>();
  const [period, setPeriod] = useState<Period>("all_time");
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeBookId = book_id || "all";

  const { data: booksData } = useBooks();
  const {
    data: walletStatsResponse,
    isLoading: isStatsLoading,
    refetch,
  } = useWalletStats({
    ...(period !== "all_time" && { period }),
    book_id: activeBookId === "all" ? undefined : activeBookId,
    ...(period === "custom" && {
      from_date: startDate?.toISOString().split("T")[0],
      to_date: endDate?.toISOString().split("T")[0],
    }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const walletStats = walletStatsResponse?.data || {
    in: 0,
    out: 0,
    expense_by_category: [],
    top_sources: [],
  };

  const books = booksData?.data || [];

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL;
      const queryParams = new URLSearchParams();

      if (period && period !== "all_time") {
        queryParams.append("period", period);
      }
      if (activeBookId !== "all") {
        queryParams.append("book_id", activeBookId);
      }
      if (period === "custom" && startDate && endDate) {
        queryParams.append("from_date", startDate.toISOString().split("T")[0]);
        queryParams.append("to_date", endDate.toISOString().split("T")[0]);
      }

      const url = `${baseUrl}/statistics/wallet/export?${queryParams.toString()}`;

      if (Platform.OS === "web") {
        window.open(url, "_blank");
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication error",
          text2: "Please log in again",
        });
        return;
      }

      const fileName = `wallet_stats_${Date.now()}.pdf`;
      const file = new ExpoFile(Paths.cache, fileName);

      const downloadRes = await ExpoFile.downloadFileAsync(url, file, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (downloadRes) {
        setIsGenerating(false);
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Download Report",
        });
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
      setIsGenerating(false);
    }
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Filter Chips */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            <Pressable
              onPress={() => router.setParams({ book_id: "all" })}
              className={cn(
                "px-5 py-2.5 rounded-full border shadow-sm",
                activeBookId === "all"
                  ? "bg-muted border-muted-foreground/20"
                  : isDark
                    ? "bg-card border-border"
                    : "bg-white border-border/50",
              )}
            >
              <P
                className={cn(
                  "text-sm font-semibold",
                  activeBookId === "all"
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                All Wallets
              </P>
            </Pressable>
            {books.map((book: any) => (
              <Pressable
                key={book.id}
                onPress={() => router.setParams({ book_id: book.id })}
                className={cn(
                  "px-5 py-2.5 rounded-full border shadow-sm",
                  activeBookId === book.id
                    ? "bg-muted border-muted-foreground/20"
                    : isDark
                      ? "bg-card border-border"
                      : "bg-white border-border/50",
                )}
              >
                <P
                  className={cn(
                    "text-sm font-semibold",
                    activeBookId === book.id
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                  numberOfLines={1}
                >
                  {book.name}
                </P>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Period Tabs */}
        <View className="mb-4 border-b border-border/30">
          <View className="flex-row items-center justify-around">
            {(
              [
                "all_time",
                "today",
                "last_7_days",
                "last_30_days",
                "custom",
              ] as Period[]
            ).map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  if (p === "custom") {
                    setShowDatePicker(true);
                  } else {
                    setPeriod(p);
                    setStartDate(null);
                    setEndDate(null);
                  }
                }}
                className="py-1 px-1 items-center flex-col flex-1"
              >
                <P
                  className={cn(
                    "text-xs font-medium mb-3",
                    period === p ? "text-foreground" : "text-muted-foreground",
                  )}
                  numberOfLines={1}
                >
                  {p === "all_time"
                    ? "All Time"
                    : p === "today"
                      ? "Today"
                      : p === "last_7_days"
                        ? "Last 7 Days"
                        : p === "last_30_days"
                          ? "Last 30 Days"
                          : p === "custom" && startDate && endDate
                            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                            : "Custom"}
                </P>
                {period === p && (
                  <View className="h-[3px] bg-primary w-16 rounded-t-full" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Summary Cards */}
        <View className="mb-6">
          <View className="flex-row gap-2">
            <View
              className={`${isDark ? "bg-card" : "bg-white"} flex-1 border border-border rounded-2xl shadow-sm p-3`}
            >
              <P className="text-[10px] text-muted-foreground mb-1">Total In</P>
              <P className="text-base font-bold text-green-600">
                {walletStats.in?.toLocaleString() || "0"}
              </P>
            </View>
            <View
              className={`${isDark ? "bg-card" : "bg-white"} flex-1 border border-border rounded-2xl shadow-sm p-3`}
            >
              <P className="text-[10px] text-muted-foreground mb-1">
                Total Out
              </P>
              <P className="text-base font-bold text-red-600">
                {walletStats.out?.toLocaleString() || "0"}
              </P>
            </View>
            <View
              className={`${isDark ? "bg-card" : "bg-white"} flex-1 border border-border rounded-2xl shadow-sm p-3`}
            >
              <P className="text-[10px] text-muted-foreground mb-1">
                Net Balance
              </P>
              <P
                className={`text-base font-bold ${
                  (walletStats.in || 0) - (walletStats.out || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(
                  (walletStats.in || 0) - (walletStats.out || 0)
                ).toLocaleString()}
              </P>
            </View>
          </View>
        </View>

        {isStatsLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="rgb(2, 146, 154)" />
          </View>
        ) : (
          <View className="pb-12">
            {/* Grid of smaller charts */}
            <View className="mb-8">
              <View className="flex-col gap-y-6">
                {/* Expense by Category Chart */}
                <View
                  className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 pb-6 rounded-3xl shadow-sm`}
                >
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                      <BarChart3 size={16} color="#02929A" />
                    </View>
                    <H3 className="text-left font-bold text-sm leading-tight flex-1">
                      Expense by Category
                    </H3>
                  </View>
                  <View className="flex-row gap-6">
                    {/* Graph Section - 3 parts */}
                    <ExpenseByCategoryChart
                      data={walletStats.expense_by_category}
                    />

                    {/* Labels Section - 1 part */}
                    <View className="flex-1 gap-y-1">
                      {walletStats.expense_by_category.map(
                        (cat: any, i: number) => {
                          const labelColor = colors[i % colors.length];

                          return (
                            <View
                              key={i}
                              className="flex-row items-center gap-x-1"
                            >
                              <View
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: labelColor,
                                }}
                              />
                              <View className="flex-1">
                                <P
                                  className="text-[10px] text-muted-foreground font-semibold leading-tight"
                                  numberOfLines={1}
                                >
                                  {cat.category}
                                </P>
                              </View>
                              <P className="text-[10px] text-muted-foreground font-bold ml-1">
                                {Math.round(cat.percentage)}%
                              </P>
                            </View>
                          );
                        },
                      )}
                    </View>
                  </View>
                </View>

                {/* Income vs Expense Chart */}
                <View
                  className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 rounded-3xl shadow-sm`}
                >
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                      <TrendingUp size={16} color="#02929A" />
                    </View>
                    <H3 className="text-left font-bold text-sm leading-tight flex-1">
                      In vs Out
                    </H3>
                  </View>
                  <View className="flex-row gap-10">
                    {/* Graph Section - 3 parts */}
                    <IncomeVsExpenseChart
                      income={walletStats.in || 0}
                      expense={walletStats.out || 0}
                    />

                    {/* Labels Section - 1 part */}
                    <View className="flex-1 gap-y-3 justify-center">
                      <View className="flex-row items-center gap-x-1">
                        <View className="w-2 h-2 rounded-full bg-[#02929A]" />
                        <View className="flex-1">
                          <P
                            className="text-[10px] text-muted-foreground font-semibold leading-tight"
                            numberOfLines={1}
                          >
                            In
                          </P>
                        </View>
                        <P className="text-[10px] text-muted-foreground font-bold ml-1">
                          {formatCurrency(walletStats.in || 0, {
                            showSymbol: false,
                          })}
                        </P>
                      </View>
                      <View className="flex-row items-center gap-x-1">
                        <View className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                        <View className="flex-1">
                          <P
                            className="text-[10px] text-muted-foreground font-semibold leading-tight"
                            numberOfLines={1}
                          >
                            Out
                          </P>
                        </View>
                        <P className="text-[10px] text-muted-foreground font-bold ml-1">
                          {formatCurrency(walletStats.out || 0, {
                            showSymbol: false,
                          })}
                        </P>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Top Sources of Income */}
                <View
                  className={`${isDark ? "bg-card" : "bg-white"} border border-border p-5 rounded-3xl shadow-sm`}
                >
                  <View className="flex-row items-center gap-3 mb-6">
                    <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                      <BarChart3 size={16} color="#02929A" />
                    </View>
                    <H3 className="text-left font-bold text-sm leading-tight flex-1">
                      Sources (IN)
                    </H3>
                  </View>
                  <TopSourcesChart data={walletStats.sources} />
                </View>
              </View>
            </View>

            {/* Export Expense Report Section */}
            <View className="mb-8">
              <View
                className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 rounded-3xl shadow-sm`}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                      <Download size={16} color="#02929A" />
                    </View>
                    <H3 className="text-left font-bold text-sm leading-tight flex-1">
                      Export Report
                    </H3>
                  </View>
                  <View className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
                </View>
                <P className="text-[10px] text-muted-foreground mb-4">
                  Generate a detailed PDF report of your transactions
                </P>
                <Pressable
                  className={cn(
                    "bg-primary rounded-lg py-3 px-4",
                    isGenerating && "opacity-70",
                  )}
                  onPress={handleGeneratePdf}
                  disabled={isGenerating}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {isGenerating && (
                      <ActivityIndicator size="small" color="#FFF" />
                    )}
                    <P className="text-center text-primary-foreground font-semibold">
                      {isGenerating ? "Generating..." : "Generate"}
                    </P>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Custom Date Range Modal */}
      <DateRangeModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onApply={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setPeriod("custom");
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </>
  );
}
