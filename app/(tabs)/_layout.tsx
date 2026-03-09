import { HapticTab } from "@/components/haptic-tab";
import { TabHeader } from "@/components/tab-header";
import { Tabs } from "expo-router";
import { Settings, Target, Wallet } from "@/lib/icons";
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
          // tabBarActiveTintColor: ,
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
            tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
          }}
        />

        {/* Tab 2: Goals */}
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
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
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          }}
        />
      </Tabs>
    </View>
    // </PrivateRoute>
  );
}