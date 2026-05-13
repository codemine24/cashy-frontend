import { useSetupPin, useUpdateProfile } from "@/api/user";
import { Button } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { Delete, Lock } from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type Step = "enter" | "confirm";

export default function PinSetupScreen() {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const setupPinMutation = useSetupPin();
  const { mutate: updateProfile } = useUpdateProfile();

  const [step, setStep] = useState<Step>("enter");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Block hardware back — user must set PIN or skip
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, []),
  );

  const currentPin = step === "enter" ? pin : confirmPin;

  const handleNumberPress = (num: string) => {
    if (step === "enter") {
      if (pin.length < 4) setPin((p) => p + num);
    } else {
      if (confirmPin.length < 4) setConfirmPin((p) => p + num);
    }
  };

  const handleDelete = () => {
    if (step === "enter") setPin((p) => p.slice(0, -1));
    else setConfirmPin((p) => p.slice(0, -1));
  };

  const handleNext = () => {
    if (step === "enter" && pin.length === 4) setStep("confirm");
  };

  const handleSetup = async () => {
    if (pin !== confirmPin) {
      Toast.show({ type: "error", text1: "PINs do not match" });
      setConfirmPin("");
      return;
    }
    try {
      const response = await setupPinMutation.mutateAsync({
        pin,
        confirm_pin: confirmPin,
      });
      if (response.success) {
        Toast.show({ type: "success", text1: "PIN set up successfully" });
        if (authState.user) {
          const updatedUser = { ...authState.user, pin: "set", is_pin_enabled: true };
          setAuthState({ ...authState, user: updatedUser });
          setUserInfo(updatedUser);
        }
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to setup PIN",
      });
    }
  };

  const handleSkip = () => {
    if (!authState.user) return;

    // 1. Update local state immediately (optimistic)
    const updatedUser = { ...authState.user, is_pin_enabled: false };
    setAuthState({ ...authState, user: updatedUser });
    setUserInfo(updatedUser);

    // 2. Navigate away immediately
    router.replace("/(tabs)");

    // 3. Fire API in background — no component-scoped callbacks needed
    //    since state is already updated. If it fails, it's a silent no-op.
    updateProfile({ is_pin_enabled: false } as any);
  };

  const renderDot = (filled: boolean) => (
    <View
      className={`w-4 h-4 rounded-full border-2 mx-3 ${filled ? "bg-primary border-primary" : "border-muted-foreground/30"
        }`}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-10">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-6">
            <Lock size={40} className="text-primary" />
          </View>
          <H2 className="text-center font-bold">
            {step === "enter" ? "Set up your PIN" : "Confirm your PIN"}
          </H2>
          <Muted className="text-center mt-2">
            {step === "enter"
              ? "Create a 4-digit PIN to secure your account"
              : "Re-enter your PIN to confirm"}
          </Muted>
        </View>

        {/* PIN dots */}
        <View className="flex-row justify-center items-center mb-10">
          {[...Array(4)].map((_, i) => renderDot(i < currentPin.length))}
        </View>

        {/* Number pad */}
        <View className="flex-1 justify-end pb-10">
          <View className="flex-row flex-wrap justify-center gap-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => handleNumberPress(num.toString())}
                className="w-1/3 items-center py-4"
              >
                <Text className="text-3xl font-semibold text-foreground">
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
            <View className="w-1/3" />
            <TouchableOpacity
              onPress={() => handleNumberPress("0")}
              className="w-1/3 items-center py-4"
            >
              <Text className="text-3xl font-semibold text-foreground">0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="w-1/3 items-center py-4"
            >
              <Delete size={30} className="text-foreground" />
            </TouchableOpacity>
          </View>

          <Button
            className="mt-8"
            disabled={currentPin.length !== 4 || setupPinMutation.isPending}
            onPress={step === "enter" ? handleNext : handleSetup}
          >
            {setupPinMutation.isPending
              ? "Setting up..."
              : step === "enter"
                ? "Next"
                : "Confirm PIN"}
          </Button>

          {/* Skip option */}
          <TouchableOpacity
            onPress={handleSkip}
            className="mt-5 items-center"
          >
            <Muted className="text-foreground underline">Skip for now</Muted>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
