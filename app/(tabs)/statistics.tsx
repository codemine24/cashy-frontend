import { useWalletStats } from "@/api/statistics";
import { useBooks } from "@/api/wallet";
import { DateRangeModal } from "@/components/date-range-modal";
import { ScreenContainer } from "@/components/screen-container";
import { H3, P } from "@/components/ui/typography";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/utils/cn";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BarChart3, Download, TrendingUp } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Period = "today" | "last_7_days" | "last_30_days" | "custom";

export default function StatisticsPage() {
  const router = useRouter();
  const { book_id } = useLocalSearchParams<{ book_id?: string }>();
  const [period, setPeriod] = useState<Period>("last_30_days");
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<Date | null>(null);
  const [exportEndDate, setExportEndDate] = useState<Date | null>(null);
  const [showExportStartPicker, setShowExportStartPicker] = useState(false);
  const [showExportEndPicker, setShowExportEndPicker] = useState(false);
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

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <H3 className="text-2xl font-bold text-foreground mb-2">
            Financial Statistics
          </H3>
          <P className="text-muted-foreground">
            Track your expenses and income patterns
          </P>
        </View>

        {/* Wallet Filter Chips */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
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
        <View className="px-6 mb-8 border-b border-border/30">
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
                className="py-1 px-1 items-center"
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

        {isStatsLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="rgb(2, 146, 154)" />
          </View>
        ) : (
          <View className="px-6 pb-12">
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
                <NetBalanceTrend data={walletStats.balance_trend} />
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
                    <H3 className="text-left font-bold text-sm leading-tight">
                      Export Expense Report
                    </H3>
                  </View>
                  <View className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
                </View>
                <P className="text-[10px] text-muted-foreground mb-4">
                  Generate a detailed PDF report of your expenses for any date
                  range
                </P>
                <Pressable
                  className="bg-primary rounded-lg py-3 px-4"
                  onPress={() => setShowExportModal(true)}
                >
                  <P className="text-center text-primary-foreground font-semibold">
                    Generate Report
                  </P>
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

      {/* Export Report Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`${isDark ? "bg-card" : "bg-white"} rounded-2xl p-6 mx-4 w-full max-w-sm`}
          >
            <View className="flex-row items-center justify-between mb-4">
              <P className="text-lg font-bold text-foreground">
                Export Expense Report
              </P>
              <View className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
            </View>

            <View className="gap-4">
              <View>
                <P className="text-sm text-muted-foreground mb-2">Start Date</P>
                <Pressable
                  className="border border-border rounded-lg px-3 py-2"
                  onPress={() => setShowExportStartPicker(true)}
                >
                  <P className="text-foreground">
                    {exportStartDate
                      ? exportStartDate.toLocaleDateString()
                      : "Select start date"}
                  </P>
                </Pressable>
              </View>

              <View>
                <P className="text-sm text-muted-foreground mb-2">End Date</P>
                <Pressable
                  className="border border-border rounded-lg px-3 py-2"
                  onPress={() => setShowExportEndPicker(true)}
                >
                  <P className="text-foreground">
                    {exportEndDate
                      ? exportEndDate.toLocaleDateString()
                      : "Select end date"}
                  </P>
                </Pressable>
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <Pressable
                className="flex-1 border border-border rounded-lg py-2"
                onPress={() => setShowExportModal(false)}
              >
                <P className="text-center text-muted-foreground">Cancel</P>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary rounded-lg py-2"
                onPress={async () => {
                  if (exportStartDate && exportEndDate) {
                    setIsGenerating(true);
                    try {
                      // Simulate PDF generation and download
                      await new Promise((resolve) => setTimeout(resolve, 2000));
                      // In real implementation, this would call an API to generate PDF
                      console.log(
                        "Generating PDF for:",
                        exportStartDate.toISOString(),
                        "to",
                        exportEndDate.toISOString(),
                      );
                      // Show success message or trigger download
                    } catch (error) {
                      console.error("Error generating report:", error);
                    } finally {
                      setIsGenerating(false);
                      setShowExportModal(false);
                    }
                  }
                }}
                disabled={!exportStartDate || !exportEndDate || isGenerating}
              >
                <P className="text-center text-primary-foreground font-semibold">
                  {isGenerating ? "Generating..." : "Generate PDF"}
                </P>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Date Pickers */}
      {showExportStartPicker && (
        <DateTimePicker
          value={exportStartDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowExportStartPicker(false);
            if (selectedDate) {
              setExportStartDate(selectedDate);
            }
          }}
        />
      )}

      {showExportEndPicker && (
        <DateTimePicker
          value={exportEndDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowExportEndPicker(false);
            if (selectedDate) {
              setExportEndDate(selectedDate);
            }
          }}
        />
      )}
    </ScreenContainer>
  );
}

// Chart Components using SVG

function NetBalanceTrend({ data }: { data: any[] }) {
  const chartHeight = 180;
  const chartWidth = SCREEN_WIDTH - 48;
  const padding = 20;
  const { isDark } = useTheme();

  if (!data?.length)
    return (
      <View className="h-40 items-center justify-center">
        <P className="text-muted-foreground">No data available</P>
      </View>
    );

  // Find max values for scaling
  const allInValues = data.map((d) => d.total_in || 0);
  const allOutValues = data.map((d) => d.total_out || 0);
  const maxIn = Math.max(...allInValues, 1000);
  const maxOut = Math.max(...allOutValues, 1000);
  const maxVal = Math.max(maxIn, maxOut);

  const barWidth = Math.min(
    12,
    (chartWidth - padding * 2) / (data.length * 2.5),
  );
  const groupWidth = (chartWidth - padding * 2) / data.length;

  return (
    <View
      className={`${isDark ? "bg-card" : "bg-white"} p-4 rounded-3xl border border-border`}
    >
      <Svg height={chartHeight} width={chartWidth}>
        <Defs>
          <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#A3D031" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#A3D031" stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF6B6B" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#FF6B6B" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <G key={i}>
            <Path
              d={`M ${padding} ${chartHeight - padding - p * (chartHeight - padding * 2)} L ${chartWidth - padding} ${chartHeight - padding - p * (chartHeight - padding * 2)}`}
              stroke={isDark ? "#374151" : "#E5E7EB"}
              strokeWidth="0.5"
            />
            <SvgText
              x={0}
              y={chartHeight - padding - p * (chartHeight - padding * 2) + 4}
              fontSize="8"
              fill={isDark ? "#9CA3AF" : "#6B7280"}
            >
              {Math.round(p * maxVal).toLocaleString()}
            </SvgText>
          </G>
        ))}

        {/* Bars for each date */}
        {data.map((d, i) => {
          const x = padding + i * groupWidth + (groupWidth - barWidth * 2) / 2;

          // Income bar
          const incomeHeight = d.total_in
            ? (d.total_in / maxVal) * (chartHeight - padding * 2)
            : 0;
          const incomeY = chartHeight - padding - incomeHeight;

          // Expense bar
          const expenseHeight = d.total_out
            ? (d.total_out / maxVal) * (chartHeight - padding * 2)
            : 0;
          const expenseY = chartHeight - padding - expenseHeight;

          return (
            <G key={i}>
              {/* Income Bar */}
              <Rect
                x={x}
                y={incomeY}
                width={barWidth}
                height={incomeHeight}
                fill="url(#incomeGrad)"
                rx="2"
              />

              {/* Expense Bar */}
              <Rect
                x={x + barWidth + 2}
                y={expenseY}
                width={barWidth}
                height={expenseHeight}
                fill="url(#expenseGrad)"
                rx="2"
              />
            </G>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          if (data.length > 7 && i % Math.floor(data.length / 5) !== 0)
            return null;
          const x = padding + i * groupWidth + groupWidth / 2;
          return (
            <SvgText
              key={i}
              x={x}
              y={chartHeight - 4}
              fontSize="8"
              fill={isDark ? "#9CA3AF" : "#6B7280"}
              textAnchor="middle"
            >
              {d.date.split("-").slice(1).join("/")}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View className="flex-row justify-center gap-6 mt-3">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-sm bg-[#A3D031]" />
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

function IncomeVsExpenseChart({
  income,
  expense,
}: {
  income: number;
  expense: number;
}) {
  const chartHeight = 80;
  const chartWidth = (SCREEN_WIDTH - 80) / 3;
  const maxVal = Math.max(income, expense, 100);

  const barWidth = 12;
  const gap = 4;
  const xCenter = chartWidth / 2;

  const incomeHeight = (income / maxVal) * (chartHeight - 10);
  const expenseHeight = (expense / maxVal) * (chartHeight - 10);

  return (
    <View className="items-center justify-center">
      <Svg height={chartHeight} width={chartWidth}>
        {/* Income Bar */}
        <Rect
          x={xCenter - barWidth - gap / 2}
          y={chartHeight - incomeHeight}
          width={barWidth}
          height={incomeHeight}
          fill="#A3D031"
          rx="2"
        />
        {/* Expense Bar */}
        <Rect
          x={xCenter + gap / 2}
          y={chartHeight - expenseHeight}
          width={barWidth}
          height={expenseHeight}
          fill="#E5E7EB"
          rx="2"
        />
      </Svg>
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
