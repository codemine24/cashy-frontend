import { useLoanStats } from "@/api/statistics";
import { Period } from "@/app/(tabs)/statistics";
import { DateRangeModal } from "@/components/date-range-modal";
import { P } from "@/components/ui/typography";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/utils/cn";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
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
                            : "Custom"}
                </P>
                {period === p && (
                  <View className="h-[3px] bg-primary w-16 rounded-t-full" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="rgb(2, 146, 154)" />
          </View>
        ) : (
          <LoanStatisticsContent loanSummary={loanSummary} isDark={isDark} />
        )}

        <View className="h-20" />
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
