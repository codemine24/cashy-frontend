import { useSendOtp, useVerifyOtp } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { InputField } from "@/components/ui/input-field";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { PasteIcon } from "@/icons/paste-icon";
import { ChevronLeft } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Animated,
  BackHandler,
  Clipboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

type Step = "email" | "otp";

export default function AuthScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: "", otp: "" },
    mode: "onBlur",
    shouldUnregister: false,
  });

  const sentOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const { setAuthState, authReady } = useAuth();
  const { applyUserTheme } = useTheme();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (step === "otp") {
      // Small delay to ensure the view is visible before focusing
      const timer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate(`/`);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router]),
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, []),
  );

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

  const handleSendOtp = async (data: EmailFormValues) => {
    try {
      const response = await sentOtpMutation.mutateAsync(data.email);

      Toast.show({
        type: "success",
        text1: response?.message || "OTP sent!",
      });

      otpForm.setValue("email", data.email);
      animateToStep("otp");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to send OTP",
      });
    }
  };

  const handleVerifyOtp = async (data: OtpFormValues) => {
    try {
      const response = await verifyOtpMutation.mutateAsync({
        email: data.email,
        otp: data.otp,
      });

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
          theme: response?.data?.theme,
          language: response?.data?.language,
          currency: response?.data?.currency,
          push_notification: response?.data?.push_notification,
        },
      });

      // Apply theme immediately on login
      const userTheme = response?.data?.theme ?? "LIGHT";
      applyUserTheme(userTheme);

      router.replace("/(tabs)");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Invalid OTP",
      });
    }
  };

  const handleResend = () => {
    otpForm.reset({ email: otpForm.getValues("email"), otp: "" });
    animateToStep("email");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 mt-4">
        <TouchableOpacity
          onPress={
            step === "otp"
              ? () => animateToStep("email")
              : () => router.navigate("/")
          }
          className="h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft size={26} className="text-foreground" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* EMAIL STEP */}
        <Animated.View
          style={{
            opacity: step === "email" ? fadeAnim : 0,
            transform: [{ translateY: slideAnim }],
            display: step === "email" ? "flex" : "none",
          }}
        >
          <View className="mt-8">
            <H2 className="text-center">Welcome!</H2>
            <Muted className="text-center mt-2 mb-6 w-4/5 mx-auto">
              Login / Signup to start using Cashy
            </Muted>
          </View>

          <Controller
            control={emailForm.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <InputField
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Email address"
                  placeholderClassName="text-foreground"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="email"
                  className={`${emailForm.formState.errors.email ? "border-destructive" : "border-border"}`}
                />
                <InputError error={emailForm.formState.errors.email?.message} />
              </View>
            )}
          />

          <Button
            onPress={emailForm.handleSubmit(handleSendOtp)}
            disabled={sentOtpMutation.isPending}
            className="mt-6"
          >
            <Text className="text-primary-foreground font-semibold text-base tracking-wide">
              {sentOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
            </Text>
          </Button>
        </Animated.View>

        {/* OTP STEP */}
        <Animated.View
          style={{
            opacity: step === "otp" ? fadeAnim : 0,
            transform: [{ translateY: slideAnim }],
            display: step === "otp" ? "flex" : "none",
          }}
        >
          <View className="mt-8">
            <H2 className="text-center">Check your email</H2>
            <Muted className="text-center mt-2 mb-6">
              We sent a code to {otpForm.watch("email")}
            </Muted>
          </View>

          <Controller
            control={otpForm.control}
            name="otp"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View
                  className={`flex-row items-center border rounded-xl ${otpForm.formState.errors.otp ? "border-destructive" : "border-border"}`}
                >
                  <TextInput
                    ref={otpInputRef}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter OTP"
                    placeholderClassName="text-secondary"
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!verifyOtpMutation.isPending}
                    className="flex-1 p-4 text-foreground"
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      const text = await Clipboard.getString();
                      if (text) onChange(text.replace(/\D/g, "").slice(0, 6));
                    }}
                    className="px-4 py-3"
                    hitSlop={8}
                  >
                    <PasteIcon size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                </View>
                <InputError error={otpForm.formState.errors.otp?.message} />
              </View>
            )}
          />

          <TouchableOpacity onPress={handleResend} className="mt-4">
            <Muted className="text-sm">
              Didn&apos;t receive it?{" "}
              <Muted className="underline text-sm">Resend</Muted>
            </Muted>
          </TouchableOpacity>

          <Button
            onPress={otpForm.handleSubmit(handleVerifyOtp)}
            disabled={verifyOtpMutation.isPending}
            className="mt-6 "
          >
            <Text
              className="text-primary-foreground font-semibold text-base tracking-wide"
              numberOfLines={1}
            >
              {verifyOtpMutation.isPending ? "Verifying OTP..." : "Verify OTP"}
            </Text>
          </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
