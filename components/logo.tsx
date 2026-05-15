import { Text, View, Image } from "react-native";

export const Logo = () => {
  return (
    <View className="flex-row items-center gap-2">
      <Image source={require("@/assets/images/logo.png")} style={{ width: 30, height: 30 }} />
      <Text className="text-xl font-extrabold tracking-tight text-primary">
        Cashy
      </Text>
    </View>
  );
};