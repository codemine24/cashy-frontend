import { HapticTab } from "@/components/haptic-tab";
import { TabHeader } from "@/components/tab-header";
import { useTheme } from "@/context/theme-context";
import { GoalIcon } from "@/icons/goal-icon";
import { SettingsIcon } from "@/icons/settings-icon";
import { StatisticsIcon } from "@/icons/statistics-icon";
import { WalletIcon } from "@/icons/wallet-icon";
import { ArrowLeft } from "@/lib/icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Platform, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function TabLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  const backgroundColor = isDark ? "rgb(15, 23, 42)" : "rgb(248, 250, 252)";
  const borderColor = isDark ? "rgb(51, 65, 85)" : "rgb(226, 232, 240)";

  const isSettings = pathname === "/settings";

  return (
    <View className="flex-1 bg-background">
      {!isSettings && (
        <SafeAreaView edges={["top"]} className="bg-background">
          <TabHeader />
        </SafeAreaView>
      )}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "rgb(2, 146, 154)",
          tabBarInactiveTintColor: "rgb(100, 116, 139)",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor,
            borderTopColor: borderColor,
            borderTopWidth: 1,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
          },
        }}
      >
        {/* Tab 1: Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Wallets",
            tabBarIcon: ({ color }) => (
              <WalletIcon color={color} className="size-10" />
            ),
          }}
        />

        {/* Tab 2: Goals */}
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color }) => (
              <GoalIcon color={color} className="size-8" />
            ),
          }}
        />

        {/* Tab 3: Loans */}
        <Tabs.Screen
          name="loans"
          options={{
            title: "Loans",
            tabBarIcon: ({ color, size }) => (
              <GoalIcon color={color} size={size} />
            ),
          }}
        />

        {/* Tab 3: Statistics */}
        <Tabs.Screen
          name="statistics"
          options={{
            title: "Statistics",
            tabBarIcon: ({ color }) => (
              <StatisticsIcon color={color} size={30} />
            ),
          }}
        />

        {/* Tab 4: Settings */}
        <Tabs.Screen
          name="settings"
          options={{
            title: "More",
            headerShown: true,
            headerStyle: { backgroundColor: isDark ? "#0f172a" : "#f8fafc" },
            headerTintColor: isDark ? "#f8fafc" : "#111827",
            headerTitleStyle: { fontSize: 17, fontWeight: "600" },
            headerShadowVisible: true,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="ml-4 mr-6"
              >
                <ArrowLeft size={24} className={isDark ? "text-slate-50" : "text-gray-900"} />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color }) => (
              <SettingsIcon color={color} className="size-8" />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}