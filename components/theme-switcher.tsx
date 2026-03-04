import Feather from "@expo/vector-icons/Feather";
import { useColorScheme } from "nativewind";
import { Text, TouchableOpacity, View } from "react-native";

export function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleTheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="flex-row items-center rounded-xl bg-gray-200 p-4 dark:bg-gray-800"
      activeOpacity={0.8}
    >
      <View className={`h-10 w-10 items-center justify-center rounded-full ${isDark ? "bg-gray-700" : "bg-white shadow-sm"}`}>
        <Feather name={isDark ? "moon" : "sun"} size={20} color={isDark ? "#60a5fa" : "#f59e0b"} />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Appearance
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {isDark ? "Dark Theme" : "Light Theme"}
        </Text>
      </View>

      <Feather name="chevron-right" size={20} color={isDark ? "#6b7280" : "#9ca3af"} />
    </TouchableOpacity>
  );
}
