// LoginTypeScreen.tsx
import { BackButton } from "@/components/ui/back-button";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/firebase"; // use getAuth(app) in your firebase.ts
import { GoogleIcon } from "@/icons/google-icon";
import { Mail } from "@/lib/icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginTypeScreen() {
  const router = useRouter();
  const { authReady, authState } = useAuth();

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        "68140526274-cbimppqqje5k18q1aqf4cqlng98ibi5b.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  // If user already logged in, redirect
  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, authState.isAuthenticated]);

  const signInWithGoogle = async () => {
    console.log("Signing in with Google...");
    try {
      // Ensure Play Services are available on Android
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      console.log("Opening Google Sign-In modal...");

      // Open Google Sign-In modal
      const userInfo = await GoogleSignin.signIn();
      console.log("userInfo:", userInfo);

      // Get ID token
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error("No ID token returned");

      // Create Firebase credential
      const credential = GoogleAuthProvider.credential(idToken);

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, credential);
      console.log("Logged in user:", userCredential.user);

      // Update your auth context here if needed
      // Example:
      // setUser({
      //   uid: userCredential.user.uid,
      //   email: userCredential.user.email,
      //   displayName: userCredential.user.displayName,
      //   photoURL: userCredential.user.photoURL,
      // });
    } catch (err) {
      console.log("Login error:", err);
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
          className="w-full flex-row items-center justify-center gap-3 rounded-xl py-4 border border-border"
        >
          <GoogleIcon width={24} height={24} />
          <Text className="text-base font-semibold tracking-widest text-primary">
            Continue with Google 2
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