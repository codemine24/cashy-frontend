import { useAuth } from "@/context/auth-context";
import { Bell, ChevronDown } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

export function TabHeader() {
  const { authState } = useAuth();
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
          <Text
            className="text-foreground"
            style={{
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            {displayName}
          </Text>

          {/* Chevron */}
          <ChevronDown size={18} color="#6B7280" />
        </TouchableOpacity>

        {/* Right: Bell icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          className="p-2"
        >
          <Bell size={24} color="#1C1C1E" strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
