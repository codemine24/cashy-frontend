import { TabHeader } from "@/components/tab-header";
import { useTheme } from "@/context/theme-context";
import { LoanIcon } from "@/icons/loan-icon";
import { StatisticsIcon } from "@/icons/statistics-icon";
import { WalletIcon } from "@/icons/wallet-icon";
import { usePathname } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import each screen directly — PagerView needs to render them side-by-side
import WalletsScreen from "./index";
import LoansScreen from "./loans";
import StatisticsScreen from "./statistics";

const ACTIVE_COLOR = "rgb(2, 146, 154)";
const INACTIVE_COLOR = "rgb(100, 116, 139)";

const TABS = [
  {
    name: "Wallets",
    icon: (c: string) => <WalletIcon color={c} size={24} />,
    Screen: WalletsScreen,
  },
  {
    name: "Loans",
    icon: (c: string) => <LoanIcon color={c} size={24} />,
    Screen: LoansScreen,
  },
  {
    name: "Statistics",
    icon: (c: string) => <StatisticsIcon color={c} size={24} />,
    Screen: StatisticsScreen,
  },
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
    <View
      style={{
        flexDirection: "row",
        backgroundColor: bg,
        borderTopWidth: 1,
        borderTopColor: border,
        paddingBottom: pb,
        height: 56 + pb,
      }}
    >
      {TABS.map((tab, i) => {
        const active = activeIndex === i;
        const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
        return (
          <Pressable
            key={tab.name}
            onPress={() => onPress(i)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              paddingTop: 4,
            }}
          >
            {active && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  left: "50%",
                  transform: [{ translateX: -30 }],
                  width: 60,
                  height: 2,
                  backgroundColor: ACTIVE_COLOR,
                  borderRadius: 1,
                }}
              />
            )}
            {tab.icon(color)}
            <Text style={{ fontSize: 10, fontWeight: "500", color }}>
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

  const getIndexFromPathname = (path: string) => {
    if (path === "/loans") return 1;
    if (path === "/statistics") return 2;
    return 0;
  };

  useEffect(() => {
    const index = getIndexFromPathname(pathname);
    if (index !== activeIndex) {
      pagerRef.current?.setPage(index);
    }
  }, [pathname, activeIndex]);

  return (
    <View style={{ flex: 1 }}>
      {/* Shared header across all tabs */}
      {!isSettings && <TabHeader />}

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={getIndexFromPathname(pathname)}
        overdrag
        offscreenPageLimit={1}
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
