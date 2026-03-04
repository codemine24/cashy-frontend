import { useTheme } from "@/context/theme-context";
import { ChevronDown } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface WelcomeHeaderProps {
  currentLanguage: string;
  onLanguagePress: () => void;
}

export function WelcomeHeader({ currentLanguage, onLanguagePress }: WelcomeHeaderProps) {
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
      {/* ── Logo ── */}
      <View className="flex-row items-center gap-2">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Text className="text-lg font-extrabold text-white">K</Text>
        </View>
        <Text className="text-xl font-extrabold tracking-tight text-foreground">
          KAASHY
        </Text>
      </View>

      {/* ── Language selector ── */}
      <TouchableOpacity
        onPress={onLanguagePress}
        activeOpacity={0.7}
        className="flex-row items-center gap-1 rounded border border-border px-3 py-2"
      >
        <Text className="text-sm font-medium text-foreground">
          {currentLanguage}
        </Text>
        <ChevronDown size={16} color={isDark ? "#94a3b8" : "#64748b"} />
      </TouchableOpacity>
    </View>
  );
}
