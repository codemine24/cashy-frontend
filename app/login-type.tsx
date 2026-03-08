import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Mail } from "@/lib/icons";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export default function LoginTypeScreen() {
  const router = useRouter();
  const { authReady, authState } = useAuth();

  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, authState.isAuthenticated, router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mt-5">
        <Text className="text-3xl font-bold text-foreground text-center">Welcome to KASSHY</Text>
        <Text className="text-base font-bold text-muted-foreground text-center mt-3">Login/Signup to backup your data securely</Text>
      </View>

      <View className="flex-1 mt-10 p-6 gap-4">
        <TouchableOpacity
          onPress={() => router.push("/auth")}
          activeOpacity={0.85}
          className="w-full flex-row items-center justify-center gap-3 rounded py-4 border border-border"
        >
          <Mail size={20} className="text-primary" />
          <Text className="text-base font-bold uppercase tracking-widest text-primary">
            Continue with Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login-type")}
          activeOpacity={0.85}
          className="w-full items-center rounded py-4 border border-border"
        >
          <Text className="text-base font-bold uppercase tracking-widest text-primary">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-1 mt-3">
          <Text className="text-base font-bold text-muted-foreground text-center">By continuing, you agree to our Terms of Service and Privacy Policy</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}