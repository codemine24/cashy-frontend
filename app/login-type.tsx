import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Mail } from "@/lib/icons";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/auth-context";
// import { useGoogleLogin } from "@/api/auth"; // Your new API hook
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '561497843784-1o1hgrjhp9nkbfv2mi70fg7im89o20jn.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: [
    /* what APIs you want to access on behalf of the user, default is email and profile
    this is just an example, most likely you don't need this option at all! */
    'https://www.googleapis.com/auth/drive.readonly',
  ],
  offlineAccess: false, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

export default function LoginTypeScreen() {
  const router = useRouter();
  const { setAuthState } = useAuth();
  // const googleLoginMutation = useGoogleLogin();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);

      // 1. Ensure PLAY services are available (Android only)
      await GoogleSignin.hasPlayServices();

      // 2. Prompt the Google native modal to sign in
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("No ID Token received from Google");
      }

      // 3. Send idToken to your backend API
      // const response = await googleLoginMutation.mutateAsync(idToken);

      // if (response?.success) {
      //   Toast.show({ type: "success", text1: "Welcome back!" });

      //   // 4. Update Auth State using the exact same structure as auth.tsx
      //   setAuthState({
      //     isAuthenticated: true,
      //     user: {
      //       id: response?.data?.id,
      //       name: response?.data?.name,
      //       email: response?.data?.email,
      //       contact_number: response?.data?.contact_number,
      //       role: response?.data?.role,
      //       avatar: response?.data?.avatar,
      //       status: response?.data?.status,
      //     },
      //   });

      //   // 5. Navigate to authenticated app
      //   router.replace("/(tabs)");
      // } else {
      //   throw new Error(response?.message || "Login failed");
      // }

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow (no need to show an error toaster)
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else {
        Toast.show({
          type: "error",
          text1: error?.message || "Google Sign-In failed",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mt-5">
        <Text className="text-3xl font-bold text-foreground text-center">Welcome to KASSHY</Text>
        <Text className="text-base font-bold text-muted-foreground text-center mt-3">Login/Signup to backup your data securely</Text>
      </View>

      <View className="flex-1 mt-10 p-6 gap-4">
        {/* Email Login Button */}
        <TouchableOpacity
          onPress={() => router.push("/auth")}
          activeOpacity={0.85}
          disabled={isGoogleLoading}
          className="w-full flex-row items-center justify-center gap-3 rounded py-4 border border-border"
        >
          <Mail size={20} className="text-primary" />
          <Text className="text-base font-bold uppercase tracking-widest text-primary">
            Continue with Email
          </Text>
        </TouchableOpacity>

        {/* Google Login Button */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
          disabled={isGoogleLoading}
          className="w-full flex-row items-center justify-center gap-3 rounded py-4 border border-border"
        >
          {isGoogleLoading ? (
            <ActivityIndicator size="small" color="#000" /> /* Use your primary theme color */
          ) : (
            <>
              {/* Note: You might want to import a Google icon from your icons lib */}
              <Text className="text-base font-bold uppercase tracking-widest text-primary">
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View className="flex-1 mt-3">
          <Text className="text-base font-bold text-muted-foreground text-center">By continuing, you agree to our Terms of Service and Privacy Policy</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}