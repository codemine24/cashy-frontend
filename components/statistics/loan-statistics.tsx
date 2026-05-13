import { useLoanStats } from "@/api/statistics";
import { Period } from "@/app/(tabs)/statistics";
import { DateRangeModal } from "@/components/date-range-modal";
import { P } from "@/components/ui/typography";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/utils/cn";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StatisticsSkeleton } from "../skeletons/statistics-skeleton";
import { LoanStatisticsContent } from "./loan-statistics-content";

export function LoanStatistics() {
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>("all_time");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const {
    data: loanSummaryResponse,
    isLoading,
    refetch,
    error,
  } = useLoanStats({
    ...(period !== "all_time" && { period }),
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

  const loanSummary = loanSummaryResponse?.data || {
    given: { total: 0, paid: 0, remaining: 0 },
    taken: { total: 0, paid: 0, remaining: 0 },
    balance: 0,
    status_breakdown: { ongoing: 0, paid: 0 },
  };

  if (error) {
    return (
      <View className="bg-surface rounded-xl p-8 items-center border border-border">
        <Text className="text-lg font-semibold mb-2 text-foreground">
          Something went wrong
        </Text>

        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-primary px-6 py-2 rounded-lg"
        >
          <Text className="text-primary-foreground font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                            : "Date Range"}
                </P>
                {period === p && (
                  <View className="h-[3px] bg-primary w-16 rounded-t-full" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {isLoading || refreshing ? (
          <View>
            <StatisticsSkeleton />
          </View>
        ) : (
          <LoanStatisticsContent loanSummary={loanSummary} isDark={isDark} />
        )}
      </ScrollView>

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
