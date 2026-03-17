import { useWalletStats } from "@/api/statistics";
import { useBooks } from "@/api/wallet";
import { ScreenContainer } from "@/components/screen-container";
import { H1, H3, P } from "@/components/ui/typography";
import { cn } from "@/utils/cn";
import { Filter } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
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

type Period = "week" | "month" | "year";

export default function StatisticsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [activeBookId, setActiveBookId] = useState<string | "all">("all");

  const { data: booksData } = useBooks();
  const { data: walletStatsResponse, isLoading: isStatsLoading } =
    useWalletStats({
      period,
      book_id: activeBookId === "all" ? undefined : activeBookId,
    });

  const walletStats = walletStatsResponse?.data || {
    balance_trend: [],
    income_vs_expense: { income: 0, expense: 0 },
    category_spending: [],
    top_sources: [],
  };

  const books = booksData?.data || [];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header Section */}
        <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
          <View>
            <H1 className="text-3xl font-bold">Advanced Statistics</H1>
          </View>
          <Pressable className="p-2.5 bg-muted/20 rounded-full">
            <Filter size={20} color="rgb(2, 146, 154)" />
          </Pressable>
        </View>

        {/* Wallet Filter Chips */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            <Pressable
              onPress={() => setActiveBookId("all")}
              className={cn(
                "px-5 py-2.5 rounded-full border",
                activeBookId === "all"
                  ? "bg-muted border-muted-foreground/20"
                  : "bg-white border-border/50",
              )}
            >
              <P
                className={cn(
                  "text-sm font-semibold",
                  activeBookId === "all"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                All Wallets
              </P>
            </Pressable>
            {books.map((book) => (
              <Pressable
                key={book.id}
                onPress={() => setActiveBookId(book.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full border",
                  activeBookId === book.id
                    ? "bg-muted border-muted-foreground/20"
                    : "bg-white border-border/50",
                )}
              >
                <P
                  className={cn(
                    "text-sm font-semibold",
                    activeBookId === book.id
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60",
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
            {(["week", "month", "year"] as Period[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className="py-1 px-2 items-center"
              >
                <P
                  className={cn(
                    "text-base capitalize font-semibold mb-3",
                    period === p ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {p === "week"
                    ? "Weekly"
                    : p === "month"
                      ? "Monthly"
                      : "Yearly"}
                </P>
                {period === p && (
                  <View className="h-[3px] bg-primary w-20 rounded-t-full" />
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
            <View className="mb-10">
              <H3 className="text-center font-bold text-lg mb-6">
                Net Balance Trend
              </H3>
              <NetBalanceTrend data={walletStats.balance_trend} />
            </View>

            {/* Grid of smaller charts */}
            <View className="flex-row gap-x-4 mb-10">
              <View className="flex-1">
                <View className="bg-white border border-border/50 p-4 rounded-3xl aspect-[0.75]">
                  <H3 className="text-center font-bold text-sm mb-4 leading-tight">
                    Income vs Expense
                  </H3>
                  <IncomeVsExpenseChart
                    income={walletStats.income_vs_expense.income}
                    expense={walletStats.income_vs_expense.expense}
                  />
                  <View className="mt-4 gap-y-1">
                    <View className="flex-row items-center gap-x-2">
                      <View className="w-2.5 h-2.5 rounded-sm bg-[#A3D031]" />
                      <P className="text-[10px] text-muted-foreground font-semibold">
                        Income
                      </P>
                    </View>
                    <View className="flex-row items-center gap-x-2">
                      <View className="w-2.5 h-2.5 rounded-sm bg-[#E5E7EB]" />
                      <P className="text-[10px] text-muted-foreground font-semibold">
                        Expense
                      </P>
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex-1">
                <View className="bg-white border border-border/50 p-4 rounded-3xl aspect-[0.75]">
                  <H3 className="text-center font-bold text-sm mb-4 leading-tight">
                    Spending by Category
                  </H3>
                  <CategorySpendingChart data={walletStats.category_spending} />
                  <View className="mt-4 gap-y-1">
                    {walletStats.category_spending
                      .slice(0, 5)
                      .map((cat: any, i: number) => (
                        <View
                          key={i}
                          className="flex-row items-center justify-between"
                        >
                          <View className="flex-row items-center gap-x-2 flex-1">
                            <View
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  cat.color ||
                                  [
                                    "#02929A",
                                    "#FFC67F",
                                    "#A3D031",
                                    "#D5EB9F",
                                    "#B5D97D",
                                  ][i % 5],
                              }}
                            />
                            <P
                              className="text-[9px] text-muted-foreground font-semibold flex-1"
                              numberOfLines={1}
                            >
                              {cat.category}
                            </P>
                          </View>
                          <P className="text-[9px] text-muted-foreground font-bold">
                            {Math.round(cat.percentage)}%
                          </P>
                        </View>
                      ))}
                  </View>
                </View>
              </View>

              <View className="flex-1">
                <View className="bg-white border border-border/50 p-4 rounded-3xl aspect-[0.75]">
                  <H3 className="text-center font-bold text-sm mb-4 leading-tight">
                    Top 3 Sources
                  </H3>
                  <View className="flex-1">
                    <View className="flex-row border-b border-border/30 pb-1 mb-1 items-center">
                      <P className="text-[8px] text-muted-foreground font-bold flex-1">
                        Table
                      </P>
                      <P className="text-[8px] text-muted-foreground font-bold">
                        Amount
                      </P>
                    </View>
                    {walletStats.top_sources
                      .slice(0, 3)
                      .map((source: any, i: number) => (
                        <View
                          key={i}
                          className="flex-row py-1.5 border-b border-border/20 last:border-0 items-center"
                        >
                          <P
                            className="text-[8px] font-semibold flex-1"
                            numberOfLines={1}
                          >
                            {i + 1}. {source.source}
                          </P>
                          <P className="text-[8px] font-bold">
                            {Number(source.amount).toLocaleString()}
                          </P>
                        </View>
                      ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </ScreenContainer>
  );
}

// Chart Components using SVG

function NetBalanceTrend({ data }: { data: any[] }) {
  const chartHeight = 180;
  const chartWidth = SCREEN_WIDTH - 48;
  const padding = 20;

  if (!data?.length)
    return (
      <View className="h-40 items-center justify-center">
        <P className="text-muted-foreground">No data available</P>
      </View>
    );

  const maxVal = Math.max(...data.map((d) => d.balance), 20000);
  const minVal = 0;
  const range = maxVal - minVal;

  const points = data.map((d, i) => {
    const x = padding + (i * (chartWidth - padding * 2)) / (data.length - 1);
    const y =
      chartHeight -
      padding -
      ((d.balance - minVal) / range) * (chartHeight - padding * 2);
    return { x, y };
  });

  const pathData =
    `M ${points[0].x} ${points[0].y} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ");
  const areaData =
    pathData +
    ` L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <View className="bg-white p-4 rounded-3xl border border-border/50">
      <Svg height={chartHeight} width={chartWidth}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#02929A" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#02929A" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <G key={i}>
            <Path
              d={`M ${padding} ${chartHeight - padding - p * (chartHeight - padding * 2)} L ${chartWidth - padding} ${chartHeight - padding - p * (chartHeight - padding * 2)}`}
              stroke="#E5E7EB"
              strokeWidth="0.5"
            />
            <SvgText
              x={0}
              y={chartHeight - padding - p * (chartHeight - padding * 2) + 4}
              fontSize="8"
              fill="#9CA3AF"
            >
              {(minVal + p * range).toLocaleString()}
            </SvgText>
          </G>
        ))}

        {/* Area */}
        <Path d={areaData} fill="url(#grad)" />

        {/* Line */}
        <Path d={pathData} stroke="#02929A" strokeWidth="2.5" fill="none" />

        {/* Points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#02929A" />
        ))}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          if (data.length > 7 && i % Math.floor(data.length / 5) !== 0)
            return null;
          const x =
            padding + (i * (chartWidth - padding * 2)) / (data.length - 1);
          return (
            <SvgText
              key={i}
              x={x}
              y={chartHeight - 4}
              fontSize="8"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {d.date.split("-").slice(1).join("/")}
            </SvgText>
          );
        })}
      </Svg>
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
  const size = 60;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 5;
  const strokeWidth = 10;

  if (!data?.length)
    return (
      <View className="h-10 items-center justify-center">
        <P className="text-[8px] text-muted-foreground">No data</P>
      </View>
    );

  let currentAngle = 0;
  const colors = ["#02929A", "#FFC67F", "#A3D031", "#D5EB9F", "#B5D97D"];

  return (
    <View className="items-center justify-center">
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

          return (
            <Path
              key={i}
              d={d}
              fill="none"
              stroke={cat.color || colors[i % colors.length]}
              strokeWidth={strokeWidth}
            />
          );
        })}
        {/* Inner hole */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth / 2}
          fill="white"
        />
      </Svg>
    </View>
  );
}
