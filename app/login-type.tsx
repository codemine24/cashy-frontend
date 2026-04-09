import { useGoogleLogin } from "@/api/auth";
import { BackButton } from "@/components/ui/back-button";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { GoogleIcon } from "@/icons/google-icon";
import { Mail } from "@/lib/icons";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function LoginTypeScreen() {
  const router = useRouter();
  const { authReady, authState, setAuthState } = useAuth();
  const [loading, setLoading] = useState(false);
  const { applyUserTheme } = useTheme();
  const googleLoginMutation = useGoogleLogin();

  // useEffect(() => {
  //   // Configure Google Sign-In with forced account selection
  //   GoogleSignin.configure({
  //     webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
  //     offlineAccess: true,
  //     hostedDomain: "", // Leave empty to allow any domain
  //     forceCodeForRefreshToken: true, // Forces refresh token
  //   });
  // }, []);

  // If user already logged in, redirect
  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, router, authState.isAuthenticated]);

  // const signInWithGoogle = async () => {
  //   try {
  //     setLoading(true);

  //     // Check if device supports Google Play Services
  //     await GoogleSignin.hasPlayServices();

  //     // Force sign-out to show account picker every time
  //     await GoogleSignin.signOut();

  //     // Open Google Sign-In modal
  //     const userInfo = await GoogleSignin.signIn();
  //     const idToken = userInfo?.data?.idToken;

  //     if (idToken) {
  //       const result = await googleLoginMutation.mutateAsync(idToken);
  //       if (result?.success) {
  //         Toast.show({
  //           type: "success",
  //           text1: result?.message || "Verified!",
  //         });

  //         setAuthState({
  //           isAuthenticated: true,
  //           user: {
  //             id: result?.data?.user?.id,
  //             name: result?.data?.user?.name,
  //             email: result?.data?.user?.email,
  //             contact_number: result?.data?.user?.contact_number,
  //             role: result?.data?.user?.role,
  //             avatar: result?.data?.user?.avatar,
  //             status: result?.data?.user?.status,
  //             theme: result?.data?.user?.theme,
  //             language: result?.data?.user?.language,
  //             currency: result?.data?.user?.currency,
  //             push_notification: result?.data?.user?.push_notification,
  //           },
  //         });

  //         // Apply theme immediately on login
  //         const userTheme = result?.data?.user?.theme ?? "LIGHT";
  //         applyUserTheme(userTheme);

  //         router.replace("/(tabs)");
  //       } else {
  //         Toast.show({
  //           type: "error",
  //           text1: result?.data?.message || "Login failed",
  //         });
  //       }
  //     } else {
  //       Toast.show({
  //         type: "error",
  //         text1: "No ID token found",
  //       });
  //     }
  //   } catch (err) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Login failed",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
          disabled={loading}
          className="w-full flex-row items-center justify-center gap-3 rounded-xl py-4 border border-border disabled:opacity-50"
        >
          <Mail size={20} className="text-primary" />
          <Text className="text-base font-semibold tracking-widest text-primary">
            Continue with Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          // onPress={signInWithGoogle}
          activeOpacity={0.85}
          disabled={loading}
          className="w-full flex-row items-center justify-center gap-3 rounded-xl py-4 border border-border disabled:opacity-50"
        >
          <GoogleIcon width={24} height={24} />
          <Text className="text-base font-semibold tracking-widest text-primary">
            {loading ? "Logging in..." : "Continue with Google"}
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
