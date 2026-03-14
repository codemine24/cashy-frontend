import { useStatisticsOverview } from "@/api/statistics";
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
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
] as const;

type PeriodType = (typeof periods)[number]["value"];

export default function StatisticsPage() {
  const [period, setPeriod] = useState<PeriodType>("month");
  const { data: overview, isLoading: isOverviewLoading } =
    useStatisticsOverview({ period });

  const isLoading = isOverviewLoading;

  const ownBooks = overview?.data?.own_books;
  const sharedBooks = overview?.data?.shared_books;

  return (
    <ScreenContainer className="px-4">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="py-6">
          <H2>Statistics</H2>
          <Muted>Track your financial progress</Muted>
        </View>

        {/* Period Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row bg-muted/30 p-1 rounded-xl mb-6 max-h-12"
        >
          {periods.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPeriod(p.value)}
              className={cn(
                "px-6 py-2 items-center rounded-lg",
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
        </ScrollView>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="rgb(2, 146, 154)" />
          </View>
        ) : (
          <>
            {/* Own Books Summary */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <H3>My Wallets</H3>
                <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <P className="text-xs font-bold text-primary">
                    {ownBooks?.total || 0} Books
                  </P>
                </View>
              </View>
              <View className="flex-row flex-wrap justify-between gap-y-4">
                <SummaryCard
                  title="Income"
                  amount={ownBooks?.total_income || 0}
                  color="text-emerald-500"
                  bg="bg-emerald-500/10"
                />
                <SummaryCard
                  title="Expense"
                  amount={ownBooks?.total_expense || 0}
                  color="text-rose-500"
                  bg="bg-rose-500/10"
                />
                <SummaryCard
                  title="Net Balance"
                  amount={ownBooks?.net_balance || 0}
                  color="text-primary"
                  bg="bg-primary/10"
                  fullWidth
                />
              </View>
            </View>

            {/* Shared Books Summary (Only show if there are shared books or if it's not all zeros) */}
            {(sharedBooks?.total > 0 ||
              sharedBooks?.total_income > 0 ||
              sharedBooks?.total_expense > 0) && (
              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <H3>Shared Wallets</H3>
                  <View className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    <P className="text-xs font-bold text-blue-500">
                      {sharedBooks?.total || 0} Books
                    </P>
                  </View>
                </View>
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  <SummaryCard
                    title="Income"
                    amount={sharedBooks?.total_income || 0}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                  />
                  <SummaryCard
                    title="Expense"
                    amount={sharedBooks?.total_expense || 0}
                    color="text-rose-500"
                    bg="bg-rose-500/10"
                  />
                  <SummaryCard
                    title="Net Balance"
                    amount={sharedBooks?.net_balance || 0}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                    fullWidth
                  />
                </View>
              </View>
            )}
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
