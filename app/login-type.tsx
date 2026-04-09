// LoginTypeScreen.tsx
import { BackButton } from "@/components/ui/back-button";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { GoogleIcon } from "@/icons/google-icon";
import { Mail } from "@/lib/icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginTypeScreen() {
  const router = useRouter();
  const { authReady, authState } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
      offlineAccess: true,
    });
  }, []);

  // If user already logged in, redirect
  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, router, authState.isAuthenticated]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Ensure Play Services are available on Android
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      // Open Google Sign-In modal
      const userInfo = await GoogleSignin.signIn();
      console.log("userInfo:", userInfo?.data?.user);

      // setUser({
      //   uid: userCredential.user.uid,
      //   email: userCredential.user.email,
      //   displayName: userCredential.user.displayName,
      //   photoURL: userCredential.user.photoURL,
      // });
    } catch (err) {
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton path="/" />

      <View className="mt-8">
        <H2 className="text-center">Welcome to Cashy</H2>
        <Muted className="text-center mt-2">
          Login/Signup to backup your data securely
        </Muted>
      </View>

      <View className="flex-1 mt-6 p-6 gap-4">
        <TouchableOpacity
          onPress={() => router.push("/auth")}
          activeOpacity={0.85}
          className="w-full flex-row items-center justify-center gap-3 rounded-xl py-4 border border-border"
        >
          <Mail size={20} className="text-primary" />
          <Text className="text-base font-semibold tracking-widest text-primary">
            Continue with Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={signInWithGoogle}
          activeOpacity={0.85}
          disabled={loading}
          className="w-full flex-row items-center justify-center gap-3 rounded-xl py-4 border border-border disabled:opacity-50"
        >
          <GoogleIcon width={24} height={24} />
          <Text className="text-base font-semibold tracking-widest text-primary">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-1 mt-3">
          <Muted className="text-center text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Muted>
        </View>
      </View>
    </SafeAreaView>
  );
}
