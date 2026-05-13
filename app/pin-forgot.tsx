import { useSendOtp, useVerifyOtp } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { PasteIcon } from "@/icons/paste-icon";
import { ChevronLeft, KeyRound } from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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

/**
 * Forgot PIN screen (auth-gate version).
 * User re-verifies via email OTP, then gets redirected to /pin-setup
 * so they can set a fresh PIN.
 */
export default function PinForgotScreen() {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const { applyUserTheme } = useTheme();
  const [step, setStep] = useState<Step>("email");

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: authState.user?.email ?? "" },
    mode: "onBlur",
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: authState.user?.email ?? "", otp: "" },
    mode: "onBlur",
    shouldUnregister: false,
  });

  const sentOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (step === "otp") {
      const t = setTimeout(() => otpInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Allow back to pin-verify
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          router.back();
          return true;
        },
      );
      return () => sub.remove();
    }, [router]),
  );

  const handleSendOtp = async (data: EmailFormValues) => {
    try {
      const response = await sentOtpMutation.mutateAsync(data.email);
      Toast.show({ type: "success", text1: response?.message || "OTP sent!" });
      otpForm.setValue("email", data.email);
      setStep("otp");
    } catch (error: any) {
      Toast.show({ type: "error", text1: error?.message || "Failed to send OTP" });
    }
  };

  const handleVerifyOtp = async (data: OtpFormValues) => {
    try {
      const response = await verifyOtpMutation.mutateAsync({
        email: data.email,
        otp: data.otp,
      });

      Toast.show({ type: "success", text1: "Verified! Please set a new PIN." });

      // Update auth state with fresh user data
      const userData = {
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
        is_pin_enabled: response?.data?.is_pin_enabled,
        pin: response?.data?.pin,
      };
      setAuthState({ isAuthenticated: true, user: userData });
      setUserInfo(userData);
      applyUserTheme(response?.data?.theme ?? "LIGHT");

      // Go to setup (not verify) since they're resetting their PIN
      router.replace("/pin-setup");
    } catch (error: any) {
      Toast.show({ type: "error", text1: error?.message || "Invalid OTP" });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* <View className="px-6 mt-4">
        <TouchableOpacity
          onPress={() => (step === "otp" ? setStep("email") : router.back())}
          className="h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft size={26} className="text-foreground" />
        </TouchableOpacity>
      </View> */}

      <View className="flex-1 px-6">
        <View className="items-center mt-8 mb-8">
          <View className="w-20 h-20 rounded-3xl bg-amber-500/10 items-center justify-center mb-6">
            <KeyRound size={40} className="text-amber-500" />
          </View>
          <H2 className="text-center font-bold">Forgot PIN?</H2>
          <Muted className="text-center mt-2">
            {step === "email"
              ? "Verify your email to reset your PIN"
              : `We sent a code to ${otpForm.watch("email")}`}
          </Muted>
        </View>

        {/* Email step */}
        <View style={{ display: step === "email" ? "flex" : "none" }}>
          <Controller
            control={emailForm.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`border rounded-xl p-4 text-foreground ${emailForm.formState.errors.email
                      ? "border-destructive"
                      : "border-border"
                    }`}
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
            <Text className="text-primary-foreground font-semibold text-base">
              {sentOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
            </Text>
          </Button>
        </View>

        {/* OTP step */}
        <View style={{ display: step === "otp" ? "flex" : "none" }}>
          <Controller
            control={otpForm.control}
            name="otp"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View
                  className={`flex-row items-center border rounded-xl ${otpForm.formState.errors.otp
                      ? "border-destructive"
                      : "border-border"
                    }`}
                >
                  <TextInput
                    ref={otpInputRef}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter OTP"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="flex-1 p-4 text-foreground"
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      const text = await Clipboard.getString();
                      if (text) onChange(text.replace(/\D/g, "").slice(0, 6));
                    }}
                    className="px-4 py-3"
                  >
                    <PasteIcon size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                </View>
                <InputError error={otpForm.formState.errors.otp?.message} />
              </View>
            )}
          />

          <TouchableOpacity
            onPress={() => {
              otpForm.reset({ email: otpForm.getValues("email"), otp: "" });
              setStep("email");
            }}
            className="mt-4"
          >
            <Muted className="text-sm">
              Didn&apos;t receive it?{" "}
              <Muted className="underline text-sm">Resend</Muted>
            </Muted>
          </TouchableOpacity>

          <Button
            onPress={otpForm.handleSubmit(handleVerifyOtp)}
            disabled={verifyOtpMutation.isPending}
            className="mt-6"
          >
            <Text className="text-primary-foreground font-semibold text-base">
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Reset PIN"}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
