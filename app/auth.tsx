import { useSendOtp, useVerifyOtp } from "@/api/auth";
import { BackButton } from "@/components/ui/back-button";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { ShieldCheck } from "@/lib/icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";

const emailSchema = z.string().min(1, "Email address is required").email("Please enter a valid email address");

type Step = "email" | "otp";

export default function AuthScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");

  const sentOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const { setAuthState, authState, authReady } = useAuth();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, authState.isAuthenticated, router]);

  if (!authReady) {
    return null;
  }

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
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setEmailError(result.error.issues[0].message);
      return;
    }
    setEmailError("");

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
        router.replace("/(tabs)");
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
      <BackButton path={"/login-type"} />
      <View style={{ flex: 1, paddingHorizontal: 24 }}>

        {step === "email" ? (
          <>
            <View className="mt-8">
              <H2 className="text-center">Welcome!</H2>
              <Muted className="text-center mt-2 mb-6">Login/ Signup to store your data securely.</Muted>
            </View>

            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderClassName="text-secondary"
              autoComplete="email"
              className={`border rounded p-4 ${emailError ? "border-red-500" : "border-border"}`}
            />
            {emailError ? (
              <Text className="text-red-500 text-sm mt-2 ml-1">{emailError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={sentOtpMutation.isPending}
              activeOpacity={0.85}
              className={`mt-6 rounded py-4 items-center justify-center disabled:bg-muted-foreground bg-primary`}
            >
              <Text className={"text-primary-foreground"}>{sentOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}</Text>
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
              placeholderClassName="text-muted-foreground"
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
              <Text className="text-primary-foreground">{verifyOtpMutation.isPending ? "Verifying OTP..." : "Verify OTP"}</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}