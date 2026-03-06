import { useAuth } from "@/context/auth-context";
import { BellIcon } from "@/icons/bell-icon";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export function TabHeader() {
  const { authState } = useAuth();
  const router = useRouter();
  const user = authState.user;

  // Get the first letter of the user's name (or email) for the avatar
  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <View
      className="bg-background border-b border-border"
      style={{
        paddingHorizontal: 20,
        paddingBottom: 12,
        paddingTop: 4,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Avatar + Name + Chevron */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/settings/subscription")}
          className="flex-row items-center gap-3"
        >
          {/* Avatar circle */}
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 42,
              height: 42,
              backgroundColor: "#E8E4F0",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#4A4458",
              }}
            >
              {initial}
            </Text>
          </View>

          {/* Name */}
          <View>
            <Text
              className="text-foreground"
              style={{
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              {displayName}
            </Text>
            <Text className="text-sm text-muted-foreground">Free</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="p-2"
        >
          <BellIcon className="text-foreground" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
