import { useTheme } from "@/context/theme-context";
import { ChevronRight, Moon, Sun } from "@/lib/icons";
import { Text, TouchableOpacity, View } from "react-native";

export function ThemeSwitcher() {
  const { isDark, toggleColorScheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleColorScheme}
      activeOpacity={0.7}
      className="flex-row items-center py-4 gap-3"
    >
      <View className="w-11 h-11 rounded-xl items-center justify-center mr-1 bg-violet-500/10">
        {isDark ? (
          <Moon size={22} color="#8b5cf6" />
        ) : (
          <Sun size={22} color="#8b5cf6" />
        )}
      </View>

      <Text className="flex-1 text-base font-semibold text-foreground">
        Dark Mode
      </Text>

      <Text className="text-sm font-medium text-muted-foreground mr-1">
        {isDark ? "On" : "Off"}
      </Text>

      <ChevronRight size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}
