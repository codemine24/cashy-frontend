import { useStatisticsOverview } from "@/api/statistics";
import { ScreenContainer } from "@/components/screen-container";
import { H1, H3, Muted, P } from "@/components/ui/typography";
import { GoalIcon } from "@/icons/goal-icon";
import { WalletIcon } from "@/icons/wallet-icon";
import { cn } from "@/utils/cn";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, ChevronDown, Filter } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Popover, { PopoverPlacement } from "react-native-popover-view";

type Period = "all" | "day" | "week" | "month" | "year" | "custom";

export default function StatisticsPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const { data: overview, isLoading } = useStatisticsOverview({
    period: period === "all" || period === "custom" ? undefined : period,
    from_date: fromDate?.toISOString().split("T")[0],
    to_date: toDate?.toISOString().split("T")[0],
  });

  const ownBooks = overview?.data?.own_books;
  const sharedBooks = overview?.data?.shared_books;

  const totalNetBalance =
    Number(ownBooks?.net_balance || 0) + Number(sharedBooks?.net_balance || 0);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header Section */}
        <View className="px-6 pt-8 pb-4">
          <H1 className="text-4xl">Insight</H1>
          <Muted className="text-lg">Financial Overview</Muted>
        </View>

        {/* Filtering Section */}
        <View className="px-6 mb-8">
          <View className="flex-row gap-x-3">
            {/* Period Dropdown */}
            <Popover
              from={(sourceRef, showPopover) => (
                <Pressable
                  onPress={showPopover}
                  ref={sourceRef as any}
                  className={cn(
                    "flex-1 px-5 py-4 rounded-[32px] border flex-row items-center justify-between",
                    period !== "custom"
                      ? "bg-primary border-primary shadow-lg shadow-primary/30"
                      : "bg-card border-border",
                  )}
                >
                  <View className="flex-row items-center gap-x-3">
                    <Filter
                      size={18}
                      color={period !== "custom" ? "white" : "rgb(115, 115, 115)"}
                    />
                    <P
                      className={cn(
                        "text-sm font-bold capitalize",
                        period !== "custom"
                          ? "text-primary-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {period}
                    </P>
                  </View>
                  <ChevronDown
                    size={18}
                    color={period !== "custom" ? "white" : "rgb(115, 115, 115)"}
                  />
                </Pressable>
              )}
              placement={PopoverPlacement.BOTTOM}
              backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.1)" }}
              popoverStyle={{
                borderRadius: 24,
                padding: 8,
                backgroundColor: "white",
                width: 200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
              }}
            >
              <View className="gap-y-1">
                {(
                  ["all", "day", "week", "month", "year", "custom"] as Period[]
                ).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => {
                      setPeriod(p);
                      if (p !== "custom") {
                        setFromDate(null);
                        setToDate(null);
                      }
                    }}
                    className={cn(
                      "px-4 py-3.5 rounded-2xl",
                      period === p ? "bg-primary/10" : "bg-transparent",
                    )}
                  >
                    <P
                      className={cn(
                        "text-sm capitalize font-semibold",
                        period === p ? "text-primary" : "text-foreground",
                      )}
                    >
                      {p}
                    </P>
                  </Pressable>
                ))}
              </View>
            </Popover>
          </View>

          {/* Custom Date Inputs */}
          {period === "custom" && (
            <View className="flex-row gap-x-3 mt-4">
              <Pressable
                onPress={() => setShowFromPicker(true)}
                className="flex-1 bg-card border border-border px-5 py-4 rounded-3xl flex-row items-center justify-between"
              >
                <View>
                  <Muted className="text-[10px] font-bold uppercase mb-0.5">
                    From
                  </Muted>
                  <P className="text-sm font-bold">
                    {fromDate?.toLocaleDateString() || "Select Date"}
                  </P>
                </View>
                <Calendar size={16} color="rgb(115, 115, 115)" />
              </Pressable>

              <Pressable
                onPress={() => setShowToPicker(true)}
                className="flex-1 bg-card border border-border px-5 py-4 rounded-3xl flex-row items-center justify-between"
              >
                <View>
                  <Muted className="text-[10px] font-bold uppercase mb-0.5">
                    To
                  </Muted>
                  <P className="text-sm font-bold">
                    {toDate?.toLocaleDateString() || "Select Date"}
                  </P>
                </View>
                <Calendar size={16} color="rgb(115, 115, 115)" />
              </Pressable>
            </View>
          )}
        </View>

          {/* Date Pickers */}
          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowFromPicker(false);
                if (date) {
                  setFromDate(date);
                  setPeriod("all"); // Reset period if custom date is chosen
                  setShowToPicker(true);
                }
              }}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              value={toDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowToPicker(false);
                if (date) {
                  setToDate(date);
                }
              }}
            />
          )}

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="rgb(2, 146, 154)" />
          </View>
        ) : (
          <View className="px-6 pb-12">
            {/* Main Balance Card */}
            <View className="bg-primary p-8 rounded-[40px] shadow-2xl shadow-primary/40 mb-10 overflow-hidden relative">
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full" />

              <Muted className="text-primary-foreground/70 font-semibold uppercase tracking-widest text-xs mb-2">
                Total Net Balance
              </Muted>
              <H1 className="text-primary-foreground text-5xl mb-6">
                $
                {Number(totalNetBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </H1>

              <View className="flex-row items-center gap-x-4">
                <View className="flex-1 bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                  <Muted className="text-primary-foreground/60 text-[10px] font-bold uppercase mb-1">
                    Income
                  </Muted>
                  <P className="text-primary-foreground font-bold text-lg">
                    +$
                    {Number(
                      (ownBooks?.total_income || 0) +
                        (sharedBooks?.total_income || 0),
                    ).toLocaleString()}
                  </P>
                </View>
                <View className="flex-1 bg-black/10 p-4 rounded-3xl backdrop-blur-md">
                  <Muted className="text-primary-foreground/60 text-[10px] font-bold uppercase mb-1">
                    Expense
                  </Muted>
                  <P className="text-primary-foreground font-bold text-lg">
                    -$
                    {Number(
                      (ownBooks?.total_expense || 0) +
                        (sharedBooks?.total_expense || 0),
                    ).toLocaleString()}
                  </P>
                </View>
              </View>
            </View>

            {/* Wallets Breakdown */}
            <View className="gap-y-8">
              {/* My Wallets Section */}
              <View>
                <SectionHeader
                  title="My Wallets"
                  count={ownBooks?.total || 0}
                  icon={<WalletIcon size={20} color="rgb(2, 146, 154)" />}
                />
                <View className="flex-row gap-x-4 mt-4">
                  <DetailedCard
                    label="Income"
                    amount={Number(ownBooks?.total_income || 0)}
                    type="income"
                    className="flex-1"
                  />
                  <DetailedCard
                    label="Expense"
                    amount={Number(ownBooks?.total_expense || 0)}
                    type="expense"
                    className="flex-1"
                  />
                </View>
                <View className="mt-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[32px]">
                  <View className="flex-row justify-between items-center">
                    <Muted className="text-emerald-600/70 font-bold uppercase text-[10px]">
                      Net Flow
                    </Muted>
                    <P className="text-emerald-600 font-bold text-xl">
                      ${Number(ownBooks?.net_balance || 0).toLocaleString()}
                    </P>
                  </View>
                </View>
              </View>

              {/* Shared Wallets Section */}
              {(sharedBooks?.total > 0 ||
                sharedBooks?.total_income > 0 ||
                sharedBooks?.total_expense > 0) && (
                <View>
                  <SectionHeader
                    title="Shared Wallets"
                    count={sharedBooks?.total || 0}
                    icon={<GoalIcon size={20} color="rgb(59, 130, 246)" />}
                  />
                  <View className="flex-row gap-x-4 mt-4">
                    <DetailedCard
                      label="Income"
                      amount={Number(sharedBooks?.total_income || 0)}
                      type="income"
                      color="blue"
                      className="flex-1"
                    />
                    <DetailedCard
                      label="Expense"
                      amount={Number(sharedBooks?.total_expense || 0)}
                      type="expense"
                      color="rose"
                      className="flex-1"
                    />
                  </View>
                  <View className="mt-4 bg-blue-500/5 border border-blue-500/10 p-5 rounded-[32px]">
                    <View className="flex-row justify-between items-center">
                      <Muted className="text-blue-600/70 font-bold uppercase text-[10px]">
                        Shared Impact
                      </Muted>
                      <P className="text-blue-600 font-bold text-xl">
                        $
                        {Number(sharedBooks?.net_balance || 0).toLocaleString()}
                      </P>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </ScreenContainer>
  );
}

function SectionHeader({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-x-3">
        <View className="p-2.5 bg-card border border-border rounded-2xl shadow-sm">
          {icon}
        </View>
        <H3 className="text-xl font-bold">{title}</H3>
      </View>
      <View className="bg-muted px-4 py-1.5 rounded-full">
        <P className="text-xs font-bold text-muted-foreground">{count} Books</P>
      </View>
    </View>
  );
}

function DetailedCard({
  label,
  amount,
  type,
  color = "emerald",
  className,
}: {
  label: string;
  amount: number;
  type: "income" | "expense";
  color?: string;
  className?: string;
}) {
  const isIncome = type === "income";
  return (
    <View
      className={cn(
        "p-6 rounded-[32px] border",
        isIncome
          ? "bg-card border-emerald-500/10"
          : "bg-card border-rose-500/10",
        className,
      )}
    >
      <View
        className={cn(
          "w-8 h-8 rounded-full items-center justify-center mb-4",
          isIncome ? "bg-emerald-500/10" : "bg-rose-500/10",
        )}
      >
        <P className={isIncome ? "text-emerald-500" : "text-rose-500"}>
          {isIncome ? "↑" : "↓"}
        </P>
      </View>
      <Muted className="text-[10px] font-bold uppercase mb-1 tracking-wider">
        {label}
      </Muted>
      <P
        className={cn(
          "text-xl font-black",
          isIncome ? "text-emerald-600" : "text-rose-600",
        )}
      >
        ${Number(amount).toLocaleString()}
      </P>
    </View>
  );
}
