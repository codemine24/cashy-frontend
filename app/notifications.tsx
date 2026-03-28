import { useGetNotifications } from "@/api/notification";
import { ScreenContainer } from "@/components/screen-container";
import { Notification } from "@/interface/notification";
import { ArrowLeft, Bell, Check, Info, Settings } from "@/lib/icons";
import { timeAgo } from "@/utils";
import { Stack, useRouter } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getNotificationIcon = (type: string) => {
  // Simple check for now based on title or message if type is not available in backend
  // But based on the provided JSON, we don't have a 'type' field explicitly.
  // Using title for now or defaulting to Bell.
  const title = type.toLowerCase();
  if (title.includes("success") || title.includes("completed")) {
    return <Check size={20} className="text-green-600" />;
  }
  if (title.includes("warning") || title.includes("alert")) {
    return <Info size={20} className="text-amber-500" />;
  }
  if (title.includes("system") || title.includes("access")) {
    return <Settings size={20} className="text-blue-500" />;
  }
  return <Bell size={20} className="text-primary" />;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch } = useGetNotifications({
    page: 1,
    limit: 20,
  });

  const notifications = data?.data || [];

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
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-red-500 mb-4 text-center">
                Failed to load notifications
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="bg-primary px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 20 }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              onRefresh={refetch}
              refreshing={isLoading}
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
              renderItem={({ item }: { item: Notification }) => (
                <View
                  className={`flex-row p-4 rounded-2xl border ${
                    item.is_read
                      ? "bg-surface/50 border-border/50"
                      : "bg-surface border-border shadow-sm"
                  }`}
                >
                  <View
                    className={`size-10 rounded-full items-center justify-center mr-4 ${
                      item.is_read ? "bg-background" : "bg-primary/10"
                    }`}
                  >
                    {getNotificationIcon(item.title)}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text
                        className={`text-base flex-1 pr-2 ${item.is_read ? "font-medium text-foreground/70" : "font-bold text-foreground"}`}
                      >
                        {item.title}
                      </Text>
                      {!item.is_read && (
                        <View className="size-2 rounded-full bg-primary mt-2" />
                      )}
                    </View>
                    <Text
                      className={`text-sm leading-relaxed ${item.is_read ? "text-muted-foreground/70" : "text-muted-foreground"}`}
                    >
                      {item.message}
                    </Text>
                    <Text className="text-[10px] text-muted-foreground/60 mt-2 font-medium uppercase tracking-wider">
                      {item.created_at ? timeAgo(item.created_at) : ""}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </ScreenContainer>
      </View>
    </>
  );
}
