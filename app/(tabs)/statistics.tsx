import { useTransactionTrend, useWalletStats } from "@/api/statistics";
import { useBooks } from "@/api/wallet";
import { DateRangeModal } from "@/components/date-range-modal";
import { ScreenContainer } from "@/components/screen-container";
import { H3, P } from "@/components/ui/typography";
import { useTheme } from "@/context/theme-context";
import { getAccessToken } from "@/utils/auth";
import { cn } from "@/utils/cn";
import { File as ExpoFile, Paths } from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { BarChart3, Download, TrendingUp } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Period = "today" | "last_7_days" | "last_30_days" | "custom";

export default function StatisticsPage() {
  const router = useRouter();
  const { book_id } = useLocalSearchParams<{ book_id?: string }>();
  const [period, setPeriod] = useState<Period>("last_7_days");
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
    period,
    book_id: activeBookId === "all" ? undefined : activeBookId,
    ...(period === "custom" && {
      from_date: startDate?.toISOString().split("T")[0],
      to_date: endDate?.toISOString().split("T")[0],
    }),
  });

  const { data: transactionTrendResponse, isLoading: isTrendLoading } =
    useTransactionTrend({
      period,
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
    balance_trend: [],
    income_vs_expense: { income: 0, expense: 0 },
    category_spending: [],
    top_sources: [],
  };

  const books = booksData?.data || [];

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL;
      const queryParams = new URLSearchParams();

      if (period) {
        queryParams.append("period", period);
      }
      if (activeBookId !== "all") {
        queryParams.append("book_id", activeBookId);
      }
      if (period === "custom" && startDate && endDate) {
        queryParams.append("from_date", startDate.toISOString().split("T")[0]);
        queryParams.append("to_date", endDate.toISOString().split("T")[0]);
      }

      const url = `${baseUrl}/statistics/wallet-stats/export?${queryParams.toString()}`;

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
          UTI: "com.adobe.pdf",
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
    <ScreenContainer edges={["left", "right"]} className="p-4 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Filter Chips */}
        <View className="mb-6">
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
                >
                  {book.name}
                </P>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Period Tabs */}
        <View className="mb-8 border-b border-border/30">
          <View className="flex-row items-center justify-around">
            {(
              ["today", "last_7_days", "last_30_days", "custom"] as Period[]
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
                  {p === "today"
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
                $
                {walletStats.income_vs_expense?.income?.toLocaleString() || "0"}
              </P>
            </View>
            <View
              className={`${isDark ? "bg-card" : "bg-white"} flex-1 border border-border rounded-2xl shadow-sm p-3`}
            >
              <P className="text-[10px] text-muted-foreground mb-1">
                Total Out
              </P>
              <P className="text-base font-bold text-red-600">
                $
                {walletStats.income_vs_expense?.expense?.toLocaleString() ||
                  "0"}
              </P>
            </View>
            <View
              className={`${isDark ? "bg-card" : "bg-white"} flex-1 border border-border rounded-2xl shadow-sm p-3`}
            >
              <P className="text-[10px] text-muted-foreground mb-1">
                Net Balance
              </P>
              <P
                className={`text-base font-bold ${(walletStats.income_vs_expense?.income || 0) -
                  (walletStats.income_vs_expense?.expense || 0) >=
                  0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                $
                {(
                  (walletStats.income_vs_expense?.income || 0) -
                  (walletStats.income_vs_expense?.expense || 0)
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
            {/* Net Balance Trend Chart */}
            <View className="mb-8">
              <View
                className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 rounded-3xl shadow-sm`}
              >
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                    <TrendingUp size={16} color="#02929A" />
                  </View>
                  <H3 className="text-left font-bold text-sm leading-tight flex-1">
                    Transaction by date
                  </H3>
                </View>
                {isTrendLoading ? (
                  <View className="h-40 items-center justify-center">
                    <ActivityIndicator size="small" color="#02929A" />
                  </View>
                ) : (
                  <TransactionTrendChart
                    data={transactionTrendResponse?.data || []}
                  />
                )}
              </View>
            </View>

            {/* Grid of smaller charts */}
            <View className="mb-8">
              <View className="flex-row gap-x-4">
                <View className="flex-1">
                  <View
                    className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 rounded-3xl shadow-sm`}
                  >
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                        <BarChart3 size={16} color="#02929A" />
                      </View>
                      <H3 className="text-left font-bold text-sm leading-tight flex-1">
                        Expense by Category
                      </H3>
                    </View>
                    <View className="flex-row gap-4">
                      {/* Graph Section - 3 parts */}
                      <View className="flex-[3] items-center justify-center">
                        <CategorySpendingChart
                          data={walletStats.category_spending}
                        />
                      </View>

                      {/* Labels Section - 1 part */}
                      <View className="flex-1 gap-y-1">
                        {walletStats.category_spending
                          .slice(0, 5)
                          .map((cat: any, i: number) => {
                            // Enhanced color palette matching the chart
                            const colors = [
                              "#02929A", // Teal
                              "#FF6B6B", // Red
                              "#4ECDC4", // Turquoise
                              "#45B7D1", // Blue
                              "#FFA07A", // Light Salmon
                              "#98D8C8", // Mint
                              "#FFD93D", // Yellow
                              "#6BCF7F", // Green
                              "#C56CF0", // Purple
                              "#FF8CC3", // Pink
                            ];
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
                                    className="text-[9px] text-muted-foreground font-semibold leading-tight"
                                    numberOfLines={1}
                                  >
                                    {cat.category}
                                  </P>
                                </View>
                                <P className="text-[9px] text-muted-foreground font-bold ml-1">
                                  {Math.round(cat.percentage)}%
                                </P>
                              </View>
                            );
                          })}
                      </View>
                    </View>
                  </View>
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
    </ScreenContainer>
  );
}

// Chart Components using SVG

function TransactionTrendChart({ data }: { data: any[] }) {
  const chartHeight = 180;
  const yAxisWidth = 35;
  const paddingBottom = 25;
  const paddingTop = 10;
  const { isDark } = useTheme();

  if (!data?.length)
    return (
      <View className="h-40 items-center justify-center">
        <P className="text-muted-foreground">No data available</P>
      </View>
    );

  // Find max values for scaling
  const allInValues = data.map((d) => d.total_income || 0);
  const allOutValues = data.map((d) => d.total_expense || 0);
  const maxVal = Math.max(...allInValues, ...allOutValues, 100);

  // Calculate widths
  const minItemWidth = 45;
  const availableWidth = SCREEN_WIDTH - 48 - yAxisWidth;
  const groupWidth = Math.max(availableWidth / data.length, minItemWidth);
  const contentWidth = Math.max(availableWidth, data.length * groupWidth);
  const barWidth = Math.min(10, groupWidth * 0.3);

  const renderGridLines = (width: number) => {
    return [0, 0.25, 0.5, 0.75, 1].map((p, i) => (
      <Path
        key={i}
        d={`M 0 ${chartHeight - paddingBottom - p * (chartHeight - paddingBottom - paddingTop)} L ${width} ${chartHeight - paddingBottom - p * (chartHeight - paddingBottom - paddingTop)}`}
        stroke={isDark ? "#374151" : "#E5E7EB"}
        strokeWidth="0.5"
        strokeDasharray="4, 4"
      />
    ));
  };

  return (
    <View className={`${isDark ? "bg-card" : "bg-white"} py-4 rounded-3xl`}>
      <View className="flex-row">
        {/* Y Axis Labels (Fixed) */}
        <View style={{ width: yAxisWidth, height: chartHeight }}>
          <Svg height={chartHeight} width={yAxisWidth}>
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
              <SvgText
                key={i}
                x={yAxisWidth - 8}
                y={
                  chartHeight -
                  paddingBottom -
                  p * (chartHeight - paddingBottom - paddingTop) +
                  3
                }
                fontSize="8"
                fill={isDark ? "#9CA3AF" : "#6B7280"}
                textAnchor="end"
              >
                {Math.round(p * maxVal) >= 1000
                  ? `${(Math.round(p * maxVal) / 1000).toFixed(1)}k`
                  : Math.round(p * maxVal).toLocaleString()}
              </SvgText>
            ))}
          </Svg>
        </View>

        {/* Scrollable Bars Area */}
        <View className="flex-1 overflow-hidden">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Svg height={chartHeight} width={contentWidth}>
              <Defs>
                <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#02929A" stopOpacity="0.8" />
                  <Stop offset="1" stopColor="#02929A" stopOpacity="0.3" />
                </LinearGradient>
                <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#FF6B6B" stopOpacity="0.8" />
                  <Stop offset="1" stopColor="#FF6B6B" stopOpacity="0.3" />
                </LinearGradient>
              </Defs>

              {/* Grid Lines */}
              {renderGridLines(contentWidth)}

              {/* Bars for each date */}
              {data.map((d, i) => {
                const x = i * groupWidth + (groupWidth - barWidth * 2 - 4) / 2;

                const incomeHeight = d.total_income
                  ? (d.total_income / maxVal) *
                  (chartHeight - paddingBottom - paddingTop)
                  : 0;
                const incomeY = chartHeight - paddingBottom - incomeHeight;

                const expenseHeight = d.total_expense
                  ? (d.total_expense / maxVal) *
                  (chartHeight - paddingBottom - paddingTop)
                  : 0;
                const expenseY = chartHeight - paddingBottom - expenseHeight;

                return (
                  <G key={i}>
                    {/* Income Bar */}
                    <Rect
                      x={x}
                      y={incomeY}
                      width={barWidth}
                      height={incomeHeight}
                      fill="url(#incomeGrad)"
                      rx="3"
                    />

                    {/* Expense Bar */}
                    <Rect
                      x={x + barWidth + 4}
                      y={expenseY}
                      width={barWidth}
                      height={expenseHeight}
                      fill="url(#expenseGrad)"
                      rx="3"
                    />

                    {/* Date label */}
                    <SvgText
                      x={i * groupWidth + groupWidth / 2}
                      y={chartHeight - 8}
                      fontSize="8"
                      fill={isDark ? "#9CA3AF" : "#6B7280"}
                      textAnchor="middle"
                    >
                      {d.date.split("-").slice(1).join("/")}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          </ScrollView>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row justify-center gap-6 mt-4 border-t border-border/30 pt-4">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-sm bg-[#02929A]" />
          <P className="text-[10px] text-muted-foreground font-semibold">
            Income
          </P>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-sm bg-[#FF6B6B]" />
          <P className="text-[10px] text-muted-foreground font-semibold">
            Expense
          </P>
        </View>
      </View>
    </View>
  );
}

function CategorySpendingChart({ data }: { data: any[] }) {
  const size = 90;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 8;
  const strokeWidth = 12;
  const { isDark } = useTheme();

  if (!data?.length)
    return (
      <View className="h-16 items-center justify-center">
        <P className="text-[8px] text-muted-foreground">No data</P>
      </View>
    );

  let currentAngle = 0;
  // Enhanced color palette with more distinct colors
  const colors = [
    "#02929A", // Teal
    "#FF6B6B", // Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Blue
    "#FFA07A", // Light Salmon
    "#98D8C8", // Mint
    "#FFD93D", // Yellow
    "#6BCF7F", // Green
    "#C56CF0", // Purple
    "#FF8CC3", // Pink
  ];

  return (
    <View className="items-center justify-center py-2">
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((cat, i) => {
          const sliceAngle = (cat.percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += sliceAngle;

          // Donut slice path logic
          const x1 =
            centerX + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
          const y1 =
            centerY + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
          const x2 =
            centerX + radius * Math.cos((Math.PI * (currentAngle - 90)) / 180);
          const y2 =
            centerY + radius * Math.sin((Math.PI * (currentAngle - 90)) / 180);

          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

          // Always use distinct colors from our palette, ignore API color
          const sliceColor = colors[i % colors.length];

          return (
            <Path
              key={i}
              d={d}
              fill="none"
              stroke={sliceColor}
              strokeWidth={strokeWidth}
            />
          );
        })}
        {/* Inner hole */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth / 2}
          fill={isDark ? "#0F172A" : "white"}
        />
      </Svg>
    </View>
  );
}
