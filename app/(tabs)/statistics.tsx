import { ScreenContainer } from "@/components/screen-container";
import { LoanStatistics } from "@/components/statistics/loan-statistics";
import { WalletStatistics } from "@/components/statistics/wallet-statistics";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type Period =
  | "all_time"
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "custom";
export type StatsTab = "WALLET" | "LOAN";

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-2.5 rounded-md items-center justify-center ${
        active ? "bg-primary" : ""
      }`}
    >
      <Text
        className={`font-semibold text-sm ${
          active ? "text-white" : "text-muted-foreground"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function StatisticsPage() {
  const [activeStatsTab, setActiveStatsTab] = useState<StatsTab>("WALLET");

  return (
    <ScreenContainer
      edges={["left", "right"]}
      className="p-4 pb-0 bg-background"
    >
      <View className="mb-3 flex-row bg-muted rounded-lg p-1">
        <TabButton
          label="Wallet"
          active={activeStatsTab === "WALLET"}
          onPress={() => setActiveStatsTab("WALLET")}
        />
        <TabButton
          label="Loan"
          active={activeStatsTab === "LOAN"}
          onPress={() => setActiveStatsTab("LOAN")}
        />
      </View>

      {activeStatsTab === "WALLET" ? <WalletStatistics /> : <LoanStatistics />}
    </ScreenContainer>
  );
}
