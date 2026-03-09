import { Text, View } from "react-native";

export function WelcomeHeader() {
  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
      {/* ── Logo ── */}
      <View className="flex-row items-center gap-2">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Text className="text-lg font-extrabold text-white">K</Text>
        </View>
        <Text className="text-xl font-extrabold tracking-tight text-foreground">
          Cashy
        </Text>
      </View>
    </View>
  );
}
