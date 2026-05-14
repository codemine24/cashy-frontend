import { useSetupPin } from "@/api/user";
import {
  PinSetupForm,
  PinSetupFormRef,
  PinSetupStep,
} from "@/components/pin/pin-setup-form";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/context/auth-context";
import { ChevronLeft } from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

export default function SetupPinScreen() {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const setupPinMutation = useSetupPin();
  const formRef = useRef<PinSetupFormRef>(null);
  const [step, setStep] = useState<PinSetupStep>("enter");

  const handleBackPress = () => {
    // if (step === "confirm") {
    //   formRef.current?.resetToEnter();
    //   return;
    // }

    router.back();
  };

  const handleSetup = async (pin: string, confirmPin: string) => {
    try {
      const response = await setupPinMutation.mutateAsync({
        pin,
        confirm_pin: confirmPin,
      });

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "PIN set up successfully",
        });

        if (authState.user) {
          const updatedUser = {
            ...authState.user,
            pin: "set",
            is_pin_enabled: true,
          };
          setAuthState({ ...authState, user: updatedUser });
          setUserInfo(updatedUser);
        }

        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to setup PIN",
      });
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <Stack.Screen
        options={{
          title: "",
          headerLeft: () => (
            <TouchableOpacity onPress={handleBackPress}>
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <PinSetupForm
        ref={formRef}
        enterTitle="Create your PIN"
        confirmTitle="Confirm your PIN"
        enterSubtitle="Set a secure 4-digit PIN for your account"
        confirmSubtitle="Please re-enter your PIN to confirm"
        confirmButtonLabel="Confirm"
        dotSpacingClassName="mb-20"
        keypadGapClassName="gap-y-6"
        buttonClassName="mt-10"
        isSubmitting={setupPinMutation.isPending}
        onStepChange={setStep}
        onSubmit={handleSetup}
      />
    </ScreenContainer>
  );
}
