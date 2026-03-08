import { ScreenContainer } from "@/components/screen-container";
import { ArrowLeft, Bell, Check, Info, Settings } from "@/lib/icons";
import { Stack, useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "system";
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Welcome to Cashy!",
    message: "Start tracking your expenses and manage your wallets easily.",
    time: "2 mins ago",
    type: "success",
    read: false,
  },
  {
    id: "2",
    title: "New Wallet Shared",
    message: "John shared the 'Family Trip' wallet with you.",
    time: "1 hour ago",
    type: "info",
    read: false,
  },
  {
    id: "3",
    title: "Subscription Updated",
    message: "Your Pro subscription has been successfully activated.",
    time: "5 hours ago",
    type: "system",
    read: true,
  },
  {
    id: "4",
    title: "Monthly Summary",
    message: "Your February spending summary is now available.",
    time: "1 day ago",
    type: "info",
    read: true,
  },
  {
    id: "5",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur tomorrow at 2:00 AM UTC.",
    time: "2 days ago",
    type: "warning",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <Check size={20} className="text-green-500" />;
    case "warning":
      return <Info size={20} className="text-amber-500" />;
    case "system":
      return <Settings size={20} className="text-blue-500" />;
    default:
      return <Bell size={20} className="text-primary" />;
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-background">
        {/* Custom Header */}
        <View
          style={{
            paddingTop: insets.top + 4,
            paddingBottom: 12,
            paddingHorizontal: 20,
          }}
          className="bg-background border-b border-border"
        >
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="p-2 -ml-2 rounded-full"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">
              Notifications
            </Text>
          </View>
        </View>

        <ScreenContainer edges={["bottom"]} className="bg-background">
          <FlatList
            data={MOCK_NOTIFICATIONS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20 }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Bell
                  size={48}
                  className="text-muted-foreground mb-4 opacity-20"
                />
                <Text className="text-lg font-semibold text-foreground">
                  No notifications
                </Text>
                <Text className="text-sm text-muted-foreground text-center mt-1">
                  When you receive notifications, they will appear here.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View
                className={`flex-row p-4 rounded-2xl border ${
                  item.read
                    ? "bg-surface/50 border-border/50"
                    : "bg-surface border-border shadow-sm"
                }`}
              >
                <View
                  className={`size-10 rounded-full items-center justify-center mr-4 ${
                    item.read ? "bg-background" : "bg-primary/10"
                  }`}
                >
                  {getNotificationIcon(item.type)}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text
                      className={`text-base flex-1 pr-2 ${item.read ? "font-medium text-foreground/70" : "font-bold text-foreground"}`}
                    >
                      {item.title}
                    </Text>
                    {!item.read && (
                      <View className="size-2 rounded-full bg-primary mt-2" />
                    )}
                  </View>
                  <Text
                    className={`text-sm leading-relaxed ${item.read ? "text-muted-foreground/70" : "text-muted-foreground"}`}
                  >
                    {item.message}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground/60 mt-2 font-medium uppercase tracking-wider">
                    {item.time}
                  </Text>
                </View>
              </View>
            )}
          />
        </ScreenContainer>
      </View>
    </>
  );
}
