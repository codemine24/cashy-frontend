import { Mail, ShieldCheck } from "@/lib/icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useSendOtp, useVerifyOtp } from "@/api/auth";
import { useAuth } from "@/context/auth-context";

type Step = "email" | "otp";

export default function AuthScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const sentOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const { setAuthState, authState, authReady } = useAuth();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateToStep = (nextStep: Step) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return;

    try {
      const response = await sentOtpMutation.mutateAsync(email);
      if (response?.success) {
        Toast.show({
          type: "success",
          text1: response?.message || "OTP sent!",
        });
        animateToStep("otp");
      } else {
        Toast.show({
          type: "error",
          text1: response?.message || "Failed to send OTP",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to send OTP",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;

    try {
      const response = await verifyOtpMutation.mutateAsync({ email, otp });

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: response?.message || "Verified!",
        });
        setAuthState({
          isAuthenticated: true,
          user: {
            id: response?.data?.id,
            name: response?.data?.name,
            email: response?.data?.email,
            contact_number: response?.data?.contact_number,
            role: response?.data?.role,
            avatar: response?.data?.avatar,
            status: response?.data?.status,
          },
        });
        // router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: response?.message || "Invalid OTP",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Invalid OTP",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingTop: 40,
          }}
        >
          <View className="flex-row gap-2 mb-8">
            <View className={`h-2 rounded-full ${step === "email" ? "bg-primary w-10" : "bg-muted-foreground w-2"}`} />
            <View className={`h-2 rounded-full ${step === "otp" ? "bg-primary w-10" : "bg-muted-foreground w-2"}`} />
          </View>

          {step === "email" ? (
            <>
              <View className="size-12 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                <Mail size={26} className="text-primary" />
              </View>

              <Text className="text-2xl font-bold text-foreground tracking-tight">
                Enter your email
              </Text>

              <Text className="mt-4 text-md text-muted-foreground leading-6 mb-4">
                We&apos;ll send a one-time password to verify your account.
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                autoComplete="email"
                editable={!sentOtpMutation.isPending}
                className="bg-foreground border border-border rounded p-4 text-background"
              />

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={sentOtpMutation.isPending || !email.trim()}
                activeOpacity={0.85}
                className={`mt-4 rounded py-4 items-center justify-center disabled:bg-muted-foreground ${email.trim() ? "bg-primary" : "bg-muted-foreground"}`}
              >
                <Text>{sentOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="size-12 items-center justify-center rounded bg-primary/10 mb-5">
                <ShieldCheck size={26} className="text-primary" />
              </View>

              <Text className="text-2xl font-bold text-foreground tracking-tight">Check your email</Text>
              <Text className="text-md text-muted-foreground leading-6 mb-2">
                We sent a code to
              </Text>
              <Text className="text-md text-primary mb-4">{email}</Text>

              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                maxLength={6}
                editable={!verifyOtpMutation.isPending}
                className="bg-foreground border border-border rounded p-4 text-background"
              />

              <TouchableOpacity
                onPress={() => animateToStep("email")}
                className="pt-4"
              >
                <Text className="text-md text-muted-foreground leading-6 mb-4">
                  Didn&apos;t receive it?{" "}
                  <Text className="text-md text-primary mb-4">Resend</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={verifyOtpMutation.isPending || otp.length < 6}
                activeOpacity={0.85}
                className={`mt-4 rounded py-4 items-center justify-center disabled:bg-muted-foreground ${otp.length >= 6 ? "bg-primary" : "bg-muted-foreground"}`}
              >
                <Text>{verifyOtpMutation.isPending ? "Verifying OTP..." : "Verify OTP"}</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}