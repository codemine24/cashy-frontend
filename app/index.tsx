import { ThemeSwitcher } from "@/components/theme-switcher";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-white px-6 py-12 dark:bg-gray-950">
      <View className="mx-auto w-full max-w-md flex-1 justify-center">
        <View className="mb-10 items-center">
          <View className="mb-6 rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
            <Text className="text-4xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">
              CF
            </Text>
          </View>

          <Text className="mb-3 text-center text-5xl font-bold text-gray-900 dark:text-white">
            Cashflow Tracker
          </Text>

          <Text className="px-4 text-center text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Manage your finances with a clean and optimized mobile experience.
          </Text>
        </View>

        <ThemeSwitcher />
      </View>
    </View>
  );
}
