import { Image, Text, View } from "react-native";

export const Logo = () => {
  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: 28, height: 28 }}
      />
      <Text className="text-2xl font-extrabold tracking-tight text-primary">
        Cashy
      </Text>
    </View>
  );
};
