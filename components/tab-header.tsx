import { BellIcon } from "@/icons/bell-icon";
import { Menu } from "@/lib/icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "./logo";
import { PremiumAnimatedIcon } from "./premium-animated-icon";

export const TabHeader = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // TODO: Replace with actual unread notifications count from your state/context
  const hasUnreadNotifications = true;

  return (
    <View
      className="bg-background border-b border-border"
      style={{
        paddingHorizontal: 20,
        paddingBottom: 12,
        paddingTop: insets.top + 4,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: App Name */}
        <View>
          <Logo />
        </View>

        {/* Right: Premium + Notification + Menu */}
        <View className="flex-row items-center gap-2.5">
          {/* Premium animated icon */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push("/settings/subscription")}
            className="size-10 items-center justify-center"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <PremiumAnimatedIcon />
          </TouchableOpacity>

          {/* Notification */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/notifications" as any)}
            className="size-10 items-center justify-center relative"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <BellIcon className="text-foreground" />
            {/* Red dot indicator for unread notifications */}
            {hasUnreadNotifications && (
              <View
                className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1,
                  elevation: 2,
                }}
              />
            )}
          </TouchableOpacity>

          {/* Breadcrumb / Menu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/settings" as any)}
            className="size-10 items-center justify-center bg-muted rounded-xl"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Menu size={18} className="text-foreground" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
