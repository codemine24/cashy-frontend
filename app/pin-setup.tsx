import { useSetupPin, useUpdateProfile } from "@/api/user";
import { PinSetupForm } from "@/components/pin/pin-setup-form";
import { useAuth } from "@/context/auth-context";
import { setUserInfo } from "@/utils/auth";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PinSetupScreen() {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const setupPinMutation = useSetupPin();
  const { mutate: updateProfile } = useUpdateProfile();

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, []),
  );

  const handleSetup = async (pin: string, confirmPin: string) => {
    try {
      const response = await setupPinMutation.mutateAsync({
        pin,
        confirm_pin: confirmPin,
      });

      if (response.success) {
        Toast.show({ type: "success", text1: "PIN set up successfully" });

        if (authState.user) {
          const updatedUser = {
            ...authState.user,
            pin: "set",
            is_pin_enabled: true,
          };
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

    const updatedUser = { ...authState.user, is_pin_enabled: false };
    setAuthState({ ...authState, user: updatedUser });
    setUserInfo(updatedUser);
    router.replace("/(tabs)");
    updateProfile({ is_pin_enabled: false } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PinSetupForm
        enterTitle="Set up your PIN"
        confirmTitle="Confirm your PIN"
        enterSubtitle="Create a 4-digit PIN to secure your account"
        confirmSubtitle="Re-enter your PIN to confirm"
        confirmButtonLabel="Confirm PIN"
        isSubmitting={setupPinMutation.isPending}
        onSubmit={handleSetup}
        skipLabel="Skip for now"
        onSkip={handleSkip}
      />
    </SafeAreaView>
  );
}
