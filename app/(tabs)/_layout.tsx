import { TabHeader } from "@/components/tab-header";
import { useTheme } from "@/context/theme-context";
import { GoalIcon } from "@/icons/goal-icon";
import { StatisticsIcon } from "@/icons/statistics-icon";
import { WalletIcon } from "@/icons/wallet-icon";
import { usePathname } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Import each screen directly — PagerView needs to render them side-by-side
import GoalsScreen from "./goals";
import LoansScreen from "./loans";
import StatisticsScreen from "./statistics";
import WalletsScreen from "./index";

const ACTIVE_COLOR = "rgb(2, 146, 154)";
const INACTIVE_COLOR = "rgb(100, 116, 139)";

const TABS = [
  { name: "Wallets", icon: (c: string) => <WalletIcon color={c} />, Screen: WalletsScreen },
  { name: "Goals", icon: (c: string) => <GoalIcon color={c} />, Screen: GoalsScreen },
  { name: "Loans", icon: (c: string) => <GoalIcon color={c} />, Screen: LoansScreen },
  { name: "Statistics", icon: (c: string) => <StatisticsIcon color={c} size={26} />, Screen: StatisticsScreen },
] as const;

// ─── Custom bottom tab bar ────────────────────────────────────────────────
function BottomTabBar({
  activeIndex,
  onPress,
}: {
  activeIndex: number;
  onPress: (i: number) => void;
}) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pb = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const bg = isDark ? "rgb(15, 23, 42)" : "rgb(248, 250, 252)";
  const border = isDark ? "rgb(51, 65, 85)" : "rgb(226, 232, 240)";

  return (
    <View style={{ flexDirection: "row", backgroundColor: bg, borderTopWidth: 1, borderTopColor: border, paddingBottom: pb, height: 56 + pb }}>
      {TABS.map((tab, i) => {
        const active = activeIndex === i;
        const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
        return (
          <Pressable
            key={tab.name}
            onPress={() => onPress(i)}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 2 }}
          >
            {tab.icon(color)}
            <Text style={{ fontSize: 10, fontWeight: active ? "700" : "500", color }}>
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────
export default function TabLayout() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const pathname = usePathname();
  const isSettings = pathname === "/settings";

  const handleTabPress = useCallback((i: number) => {
    pagerRef.current?.setPage(i);
    // setActiveIndex is updated by onPageSelected, not here,
    // so rapid taps don't cause a visual jump.
  }, []);

  const handlePageSelected = useCallback((e: any) => {
    setActiveIndex(e.nativeEvent.position);
  }, []);

  return (
    <View style={{ flex: 1 }}>

      {/* Shared header across all tabs */}
      {!isSettings && (
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "transparent" }}>
          <TabHeader />
        </SafeAreaView>
      )}

      {/*
        ┌─────────────────────────────────────────────────────────┐
        │  PagerView renders every screen in a horizontal strip.  │
        │  While you drag, both the current AND next screen are   │
        │  visible simultaneously — no white flash at all.        │
        │                                                         │
        │  offscreenPageLimit={1}  →  keeps the immediate left   │
        │  and right neighbours mounted so they appear instantly. │
        └─────────────────────────────────────────────────────────┘
      */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        overdrag                    // rubber-band at first / last tab
        offscreenPageLimit={1}      // mount adjacent screens in advance
        onPageSelected={handlePageSelected}
      >
        {TABS.map(({ name, Screen }) => (
          <View key={name} style={{ flex: 1 }}>
            <Screen />
          </View>
        ))}
      </PagerView>

      <BottomTabBar activeIndex={activeIndex} onPress={handleTabPress} />

    </View>
  );
}