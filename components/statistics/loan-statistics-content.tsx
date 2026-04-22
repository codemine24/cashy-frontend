import { H3, P } from "@/components/ui/typography";
import { formatCurrency } from "@/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
} from "lucide-react-native";
import { View } from "react-native";

export function LoanStatisticsContent({
  loanSummary,
  isDark,
}: {
  loanSummary: {
    given: { total: number; paid: number; remaining: number };
    taken: { total: number; paid: number; remaining: number };
    balance: number;
    status_breakdown: { ongoing: number; paid: number };
  };
  isDark: boolean;
}) {
  const { given, taken, balance, status_breakdown } = loanSummary;

  const givenProgress = given.total > 0 ? (given.paid / given.total) * 100 : 0;
  const takenProgress = taken.total > 0 ? (taken.paid / taken.total) * 100 : 0;

  const ongoingCount = status_breakdown?.ongoing || 0;
  const paidCount = status_breakdown?.paid || 0;
  const totalStatus = ongoingCount + paidCount;
  const ongoingPct = totalStatus > 0 ? (ongoingCount / totalStatus) * 100 : 0;
  const paidPct = totalStatus > 0 ? (paidCount / totalStatus) * 100 : 0;

  return (
    <>
      {/* Summary Cards */}
      <View className="mb-6 mt-1">
        <View className="flex-row gap-2">
          <View
            className={`${isDark ? "bg-card" : "bg-white"} flex-1 border border-border rounded-2xl shadow-sm p-3`}
          >
            <P className="text-[10px] text-muted-foreground mb-1">Total Lent</P>
            <P className="text-base font-bold text-green-600" numberOfLines={1}>
              {formatCurrency(given.total, { showSymbol: false })}
            </P>
          </View>
          <View
            className={`${isDark ? "bg-card" : "bg-white"} flex-1 border border-border rounded-2xl shadow-sm p-3`}
          >
            <P className="text-[10px] text-muted-foreground mb-1">
              Total Borrowed
            </P>
            <P className="text-base font-bold text-red-600" numberOfLines={1}>
              {formatCurrency(taken.total, { showSymbol: false })}
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
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
              numberOfLines={1}
            >
              {formatCurrency(balance, { showSymbol: false })}
            </P>
          </View>
        </View>
      </View>

      {/* Money Lent Card */}
      <View className="mb-4">
        <View
          className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 rounded-3xl shadow-sm`}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
              <ArrowUpRight size={16} color="#02929A" />
            </View>
            <H3 className="text-left font-bold text-sm leading-tight flex-1">
              Money Lent
            </H3>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1">
              <P className="text-[10px] text-muted-foreground mb-1">Total</P>
              <P
                className="text-sm font-bold text-foreground"
                numberOfLines={1}
              >
                {formatCurrency(given.total, { showSymbol: false })}
              </P>
            </View>
            <View className="flex-1 items-center">
              <P className="text-[10px] text-muted-foreground mb-1">Received</P>
              <P className="text-sm font-bold text-green-600" numberOfLines={1}>
                {formatCurrency(given.paid, { showSymbol: false })}
              </P>
            </View>
            <View className="flex-1 items-end">
              <P className="text-[10px] text-muted-foreground mb-1">
                Remaining
              </P>
              <P className="text-sm font-bold text-[#02929A]" numberOfLines={1}>
                {formatCurrency(given.remaining, { showSymbol: false })}
              </P>
            </View>
          </View>

          <View className="h-2 bg-muted rounded-full overflow-hidden">
            <View
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${Math.min(givenProgress, 100)}%` }}
            />
          </View>
          <P className="text-[10px] text-muted-foreground mt-2">
            {Math.round(givenProgress)}% repaid
          </P>
        </View>
      </View>

      {/* Money Borrowed Card */}
      <View className="mb-4">
        <View
          className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 rounded-3xl shadow-sm`}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-8 bg-red-500/10 rounded-lg items-center justify-center">
              <ArrowDownLeft size={16} color="#FF6B6B" />
            </View>
            <H3 className="text-left font-bold text-sm leading-tight flex-1">
              Money Borrowed
            </H3>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1">
              <P className="text-[10px] text-muted-foreground mb-1">Total</P>
              <P
                className="text-sm font-bold text-foreground"
                numberOfLines={1}
              >
                {formatCurrency(taken.total, { showSymbol: false })}
              </P>
            </View>
            <View className="flex-1 items-center">
              <P className="text-[10px] text-muted-foreground mb-1">Paid</P>
              <P className="text-sm font-bold text-green-600" numberOfLines={1}>
                {formatCurrency(taken.paid, { showSymbol: false })}
              </P>
            </View>
            <View className="flex-1 items-end">
              <P className="text-[10px] text-muted-foreground mb-1">
                Remaining
              </P>
              <P className="text-sm font-bold text-red-600" numberOfLines={1}>
                {formatCurrency(taken.remaining, { showSymbol: false })}
              </P>
            </View>
          </View>

          <View className="h-2 bg-muted rounded-full overflow-hidden">
            <View
              className="h-full bg-red-600 rounded-full"
              style={{ width: `${Math.min(takenProgress, 100)}%` }}
            />
          </View>
          <P className="text-[10px] text-muted-foreground mt-2">
            {Math.round(takenProgress)}% repaid
          </P>
        </View>
      </View>

      {/* Status Breakdown */}
      <View className="mb-8">
        <View
          className={`${isDark ? "bg-card" : "bg-white"} border border-border p-4 rounded-3xl shadow-sm`}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
              <BarChart3 size={16} color="#02929A" />
            </View>
            <H3 className="text-left font-bold text-sm leading-tight flex-1">
              Status Breakdown
            </H3>
          </View>

          {totalStatus === 0 ? (
            <View className="py-6 items-center">
              <P className="text-muted-foreground text-sm">No loans yet</P>
            </View>
          ) : (
            <>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1 flex-row items-center gap-2 bg-amber-500/10 rounded-xl p-3">
                  <View className="w-9 h-9 rounded-full bg-amber-500/20 items-center justify-center">
                    <Clock size={16} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <P className="text-[10px] text-muted-foreground">Ongoing</P>
                    <P className="text-base font-bold text-amber-500">
                      {ongoingCount}
                    </P>
                  </View>
                </View>
                <View className="flex-1 flex-row items-center gap-2 bg-green-500/10 rounded-xl p-3">
                  <View className="w-9 h-9 rounded-full bg-green-500/20 items-center justify-center">
                    <CheckCircle2 size={16} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <P className="text-[10px] text-muted-foreground">
                      Completed
                    </P>
                    <P className="text-base font-bold text-green-600">
                      {paidCount}
                    </P>
                  </View>
                </View>
              </View>

              <View className="flex-row h-3 rounded-full overflow-hidden bg-muted">
                {ongoingPct > 0 && (
                  <View
                    className="bg-amber-500 h-full"
                    style={{ width: `${ongoingPct}%` }}
                  />
                )}
                {paidPct > 0 && (
                  <View
                    className="bg-green-600 h-full"
                    style={{ width: `${paidPct}%` }}
                  />
                )}
              </View>
              <View className="flex-row justify-between mt-2">
                <P className="text-[10px] text-muted-foreground">
                  {Math.round(ongoingPct)}% ongoing
                </P>
                <P className="text-[10px] text-muted-foreground">
                  {Math.round(paidPct)}% completed
                </P>
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
}
