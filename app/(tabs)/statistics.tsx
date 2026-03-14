import {
  useCategoryBreakdown,
  useStatisticsOverview,
  useTransactionTrend,
} from "@/api/statistics";
import { ScreenContainer } from "@/components/screen-container";
import { H2, H3, Muted, P } from "@/components/ui/typography";
import { cn } from "@/utils/cn";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

const periods = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

export default function StatisticsPage() {
  const [period, setPeriod] = useState("month");
  const { data: overview, isLoading: isOverviewLoading } =
    useStatisticsOverview({ period });
  const { data: trend, isLoading: isTrendLoading } = useTransactionTrend({
    period,
  });
  const { data: breakdown, isLoading: isBreakdownLoading } =
    useCategoryBreakdown({ period, type: "OUT" });

  const isLoading = isOverviewLoading || isTrendLoading || isBreakdownLoading;

  return (
    <ScreenContainer className="px-4">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="py-6">
          <H2>Statistics</H2>
          <Muted>Track your financial progress</Muted>
        </View>

        {/* Period Selector */}
        <View className="flex-row bg-muted/30 p-1 rounded-xl mb-6">
          {periods.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPeriod(p.value)}
              className={cn(
                "flex-1 py-2 items-center rounded-lg",
                period === p.value ? "bg-primary shadow-sm" : "",
              )}
            >
              <P
                className={cn(
                  "font-medium",
                  period === p.value
                    ? "text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {p.label}
              </P>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="rgb(2, 146, 154)" />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
              <SummaryCard
                title="Total Income"
                amount={overview?.data?.totalIncome || 0}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
              />
              <SummaryCard
                title="Total Expense"
                amount={overview?.data?.totalExpense || 0}
                color="text-rose-500"
                bg="bg-rose-500/10"
              />
              <SummaryCard
                title="Net Balance"
                amount={overview?.data?.netBalance || 0}
                color="text-primary"
                bg="bg-primary/10"
                fullWidth
              />
            </View>

            {/* Trend Chart Placeholder/Simple implementation */}
            <View className="bg-card border border-border p-5 rounded-3xl mb-8 shadow-sm">
              <H3 className="mb-6">Transaction Trend</H3>
              {trend?.data?.length > 0 ? (
                <View className="h-48 flex-row items-end justify-between px-2">
                  {trend.data.map((item: any, idx: number) => (
                    <View key={idx} className="items-center flex-1">
                      <View className="flex-row items-end gap-x-1">
                        <View
                          style={{
                            height: Math.max(
                              (item.income /
                                (Math.max(
                                  ...trend.data.map(
                                    (d: any) => d.income + d.expense,
                                  ),
                                ) || 1)) *
                                140,
                              4,
                            ),
                          }}
                          className="w-2 bg-emerald-500 rounded-t-sm"
                        />
                        <View
                          style={{
                            height: Math.max(
                              (item.expense /
                                (Math.max(
                                  ...trend.data.map(
                                    (d: any) => d.income + d.expense,
                                  ),
                                ) || 1)) *
                                140,
                              4,
                            ),
                          }}
                          className="w-2 bg-rose-500 rounded-t-sm"
                        />
                      </View>
                      <Muted className="text-[10px] mt-2">{item.label}</Muted>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="h-48 items-center justify-center">
                  <Muted>No trend data available</Muted>
                </View>
              )}
            </View>

            {/* Category Breakdown */}
            <View className="bg-card border border-border p-5 rounded-3xl mb-8 shadow-sm">
              <H3 className="mb-4">Spending by Category</H3>
              {breakdown?.data?.length > 0 ? (
                <View className="gap-y-4">
                  {breakdown.data.slice(0, 5).map((item: any, idx: number) => {
                    const total = breakdown.data.reduce(
                      (acc: number, curr: any) => acc + curr.amount,
                      0,
                    );
                    const percentage = (item.amount / total) * 100;
                    return (
                      <View key={idx}>
                        <View className="flex-row justify-between mb-1.5">
                          <P className="font-medium text-sm">
                            {item.categoryName}
                          </P>
                          <P className="font-bold text-sm">
                            ${parseFloat(item.amount).toLocaleString()}
                          </P>
                        </View>
                        <View className="h-2 bg-muted rounded-full overflow-hidden">
                          <View
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className="py-10 items-center justify-center">
                  <Muted>No category data available</Muted>
                </View>
              )}
            </View>
          </>
        )}
        <View className="h-10" />
      </ScrollView>
    </ScreenContainer>
  );
}

function SummaryCard({
  title,
  amount,
  color,
  bg,
  fullWidth = false,
}: {
  title: string;
  amount: number;
  color: string;
  bg: string;
  fullWidth?: boolean;
}) {
  return (
    <View
      className={cn(
        "p-5 rounded-3xl shadow-sm border border-border",
        bg,
        fullWidth ? "w-full" : "w-[48%]",
      )}
    >
      <Muted className="text-xs mb-1 uppercase tracking-wider font-semibold opacity-70">
        {title}
      </Muted>
      <P className={cn("text-2xl font-bold", color)}>
        ${parseFloat(amount.toString()).toLocaleString()}
      </P>
    </View>
  );
}
