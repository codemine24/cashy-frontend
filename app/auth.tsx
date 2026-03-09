import { useSendOtp, useVerifyOtp } from "@/api/auth";
import { BackButton } from "@/components/ui/back-button";
import { InputError } from "@/components/ui/input-error";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

const authSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

type Step = "email" | "otp";
type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
    mode: "onChange",
  });

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

  const handleSendOtp = async (data: AuthFormValues) => {
    try {
      const response = await sentOtpMutation.mutateAsync(data.email);

      Toast.show({
        type: "success",
        text1: response?.message || "OTP sent!",
      });
      animateToStep("otp");

    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to send OTP",
      });
    }
  };

  const handleVerifyOtp = async (data: AuthFormValues) => {
    try {
      const response = await verifyOtpMutation.mutateAsync({ email: data.email, otp: data.otp });

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

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderClassName="text-secondary"
                    autoComplete="email"
                    className={`border rounded-xl p-4 text-foreground ${errors.email ? "border-destructive" : "border-border"}`}
                  />
                  <InputError error={errors.email?.message} />
                </View>
              )}
            />

            <TouchableOpacity
              onPress={handleSubmit(handleSendOtp)}
              disabled={sentOtpMutation.isPending}
              activeOpacity={0.85}
              className={`mt-6 rounded-xl py-4 items-center justify-center disabled:bg-muted-foreground bg-primary`}
            >
              <Text className={"text-primary-foreground font-semibold text-base tracking-wide"}>{sentOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View className="mt-8">
              <H2 className="text-center">Check your email</H2>
              <Muted className="text-center mt-2 mb-6">We sent a code to {getValues("email")}</Muted>
            </View>

            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter OTP"
                    placeholderClassName="text-secondary"
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!verifyOtpMutation.isPending}
                    className={`border rounded-xl p-4 text-foreground ${errors.otp ? "border-destructive" : "border-border"}`}
                  />
                  <InputError error={errors.otp?.message} />
                </View>
              )}
            />

            <TouchableOpacity
              onPress={() => animateToStep("email")}
              className="mt-4"
            >
              <Muted className="text-center">
                Didn&apos;t receive it? <Text className="text-primary font-semibold">Resend</Text>
              </Muted>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit(handleVerifyOtp)}
              disabled={verifyOtpMutation.isPending}
              activeOpacity={0.85}
              className={`mt-6 rounded-xl py-4 items-center justify-center disabled:bg-muted-foreground bg-primary`}
            >
              <Text className="text-primary-foreground font-semibold text-base tracking-wide">
                {verifyOtpMutation.isPending ? "Verifying OTP..." : "Verify OTP"}
              </Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </SafeAreaView>
  );
}