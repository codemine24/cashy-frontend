import { useTheme } from "@/context/theme-context";
import Feather from "@expo/vector-icons/Feather";
import { Text, TouchableOpacity, View } from "react-native";

export function ThemeSwitcher() {
  const { isDark, toggleColorScheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleColorScheme}
      className="flex-row items-center rounded-xl bg-muted p-4"
      activeOpacity={0.8}
    >
      <View className={`h-10 w-10 items-center justify-center rounded-full ${isDark ? "bg-card" : "bg-background shadow-sm"}`}>
        <Feather name={isDark ? "moon" : "sun"} size={20} color={isDark ? "#60a5fa" : "#f59e0b"} />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-base font-semibold text-foreground">
          Appearance
        </Text>
        <Text className="mt-0.5 text-sm text-muted-foreground">
          {isDark ? "Dark Theme" : "Light Theme"}
        </Text>
      </View>

      <Feather name="chevron-right" size={20} color={isDark ? "#6b7280" : "#9ca3af"} />
    </TouchableOpacity>
  );
}
