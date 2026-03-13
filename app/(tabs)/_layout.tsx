import { HapticTab } from "@/components/haptic-tab";
import { TabHeader } from "@/components/tab-header";
import { GoalIcon } from "@/icons/goal-icon";
import { SettingsIcon } from "@/icons/settings-icon";
import { WalletIcon } from "@/icons/wallet-icon";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    // <PrivateRoute>
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="bg-background">
        <TabHeader />
      </SafeAreaView>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "rgb(2, 146, 154)",
          tabBarInactiveTintColor: "rgb(100, 116, 139)",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            // paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
            // borderTopColor: colors.border,
            // borderTopWidth: 0.5,
          },
        }}
      >
        {/* Tab 1: Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Wallets",
            tabBarIcon: ({ color }) => <WalletIcon color={color} className="size-10" />,
          }}
        />

        {/* Tab 2: Goals */}
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color }) => <GoalIcon color={color} className="size-8" />,
          }}
        />

        {/* Tab 3: Statistics */}
        {/* <Tabs.Screen
          name="statistics"
          options={{
            title: "Statistics",
            tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
          }}
        /> */}

        {/* Tab 4: Settings */}
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <SettingsIcon color={color} className="size-8" />,
          }}
        />
      </Tabs>
    </View>
    // </PrivateRoute>
  );
}