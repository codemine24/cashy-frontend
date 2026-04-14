import {
  useGetNotifications,
  useMarkNotificationsAsRead,
} from "@/api/notification";

import { ScreenContainer } from "@/components/screen-container";
import { Notification } from "@/interface/notification";
import { Bell, Check, ChevronLeft, Info, Settings } from "@/lib/icons";
import { timeAgo } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect } from "react";

import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const { from } = useLocalSearchParams<{ from?: string }>();

  console.log("from", from);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace(from === "loans" ? "/loans" : "/");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router, from]),
  );

  const { data, isLoading, isError, refetch } = useGetNotifications({
    page: 1,
    limit: 20,
  });

  const queryClient = useQueryClient();
  const { mutate: markAsRead } = useMarkNotificationsAsRead();

  useEffect(() => {
    markAsRead(undefined, {
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: ["notifications"] });
      },
    });
  }, [markAsRead, queryClient]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router]),
  );

  const notifications = data?.data || [];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Notifications check",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.replace("/")}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-background">
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
              renderItem={({ item }: { item: Notification }) => {
                const isRead = !!item.is_read;
                return (
                  <View
                    className={`flex-row p-4 rounded-2xl border ${
                      isRead
                        ? "bg-surface/50 border-border/50"
                        : "bg-surface border-border shadow-sm"
                    }`}
                  >
                    <View
                      className={`size-10 rounded-full items-center justify-center mr-4 ${
                        isRead ? "bg-background" : "bg-primary/10"
                      }`}
                    >
                      {getNotificationIcon(item.title)}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text
                          className={`text-base flex-1 pr-2 ${isRead ? "font-medium text-foreground/70" : "font-bold text-foreground"}`}
                        >
                          {item.title}
                        </Text>
                        {!isRead && (
                          <View className="size-2 rounded-full bg-primary mt-2" />
                        )}
                      </View>
                      <Text
                        className={`text-sm leading-relaxed ${isRead ? "text-muted-foreground/70" : "text-muted-foreground"}`}
                      >
                        {item.message}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground/60 mt-2 font-medium uppercase tracking-wider">
                        {item.created_at ? timeAgo(item.created_at) : ""}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </ScreenContainer>
      </View>
    </>
  );
}
