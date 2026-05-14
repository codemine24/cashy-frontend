import { Text, View } from "react-native";
import { Logo } from "../logo";

export function WelcomeHeader() {
  return (
    <View className="flex-row items-center justify-between pt-2 pb-3">
      {/* ── Logo ── */}
      <Logo />
    </View>
  );
}
