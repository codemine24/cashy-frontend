import { Button } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { Delete, Lock } from "@/lib/icons";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export type PinSetupStep = "enter" | "confirm";

export type PinSetupFormRef = {
  resetToEnter: () => void;
};

type PinSetupFormProps = {
  enterTitle: string;
  confirmTitle: string;
  enterSubtitle: string;
  confirmSubtitle: string;
  confirmButtonLabel?: string;
  loadingLabel?: string;
  isSubmitting?: boolean;
  skipLabel?: string;
  dotSpacingClassName?: string;
  keypadGapClassName?: string;
  buttonClassName?: string;
  onStepChange?: (step: PinSetupStep) => void;
  onSubmit: (pin: string, confirmPin: string) => Promise<void> | void;
  onSkip?: () => void;
};

function PinDot({ filled }: { filled: boolean }) {
  return (
    <View
      className={`w-4 h-4 rounded-full border-2 mx-3 ${
        filled ? "bg-primary border-primary" : "border-muted-foreground/30"
      }`}
    />
  );
}

export const PinSetupForm = forwardRef<PinSetupFormRef, PinSetupFormProps>(
  (
    {
      enterTitle,
      confirmTitle,
      enterSubtitle,
      confirmSubtitle,
      confirmButtonLabel = "Confirm PIN",
      loadingLabel = "Setting up...",
      isSubmitting = false,
      skipLabel,
      dotSpacingClassName = "mb-10",
      keypadGapClassName = "gap-y-4",
      buttonClassName = "mt-8",
      onStepChange,
      onSubmit,
      onSkip,
    },
    ref,
  ) => {
    const [step, setStep] = useState<PinSetupStep>("enter");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    const currentPin = step === "enter" ? pin : confirmPin;

    const setCurrentStep = useCallback(
      (nextStep: PinSetupStep) => {
        setStep(nextStep);
        onStepChange?.(nextStep);
      },
      [onStepChange],
    );

    useImperativeHandle(
      ref,
      () => ({
        resetToEnter: () => {
          setConfirmPin("");
          setCurrentStep("enter");
        },
      }),
      [setCurrentStep],
    );

    const title = step === "enter" ? enterTitle : confirmTitle;
    const subtitle = step === "enter" ? enterSubtitle : confirmSubtitle;
    const buttonLabel = useMemo(() => {
      if (isSubmitting) return loadingLabel;
      return step === "enter" ? "Next" : confirmButtonLabel;
    }, [confirmButtonLabel, isSubmitting, loadingLabel, step]);

    const handleNumberPress = (num: string) => {
      if (step === "enter") {
        if (pin.length < 4) setPin((prev) => prev + num);
        return;
      }

      if (confirmPin.length < 4) setConfirmPin((prev) => prev + num);
    };

    const handleDelete = () => {
      if (step === "enter") {
        setPin((prev) => prev.slice(0, -1));
        return;
      }

      setConfirmPin((prev) => prev.slice(0, -1));
    };

    const handlePrimaryPress = async () => {
      if (step === "enter") {
        if (pin.length === 4) setCurrentStep("confirm");
        return;
      }

      if (pin !== confirmPin) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "PINs do not match",
        });
        setConfirmPin("");
        return;
      }

      await onSubmit(pin, confirmPin);
    };

    return (
      <View className="flex-1 px-6 pt-10">
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-6">
            <Lock size={40} className="text-primary" />
          </View>
          <H2 className="text-center font-bold">{title}</H2>
          <Muted className="text-center mt-2">{subtitle}</Muted>
        </View>

        <View className={`flex-row justify-center items-center ${dotSpacingClassName}`}>
          {[...Array(4)].map((_, index) => (
            <PinDot key={index} filled={index < currentPin.length} />
          ))}
        </View>

        <View className="flex-1 justify-end pb-10">
          <View className={`flex-row flex-wrap justify-center ${keypadGapClassName}`}>
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
            className={buttonClassName}
            disabled={currentPin.length !== 4 || isSubmitting}
            onPress={handlePrimaryPress}
          >
            {buttonLabel}
          </Button>

          {skipLabel && onSkip ? (
            <TouchableOpacity onPress={onSkip} className="mt-5 items-center">
              <Muted className="text-foreground underline">{skipLabel}</Muted>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  },
);

PinSetupForm.displayName = "PinSetupForm";
