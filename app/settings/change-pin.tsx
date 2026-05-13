import { useChangePin } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { ChevronLeft, Delete, Lock } from "@/lib/icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type Step = "old" | "new" | "confirm";

export default function ChangePinScreen() {
  const router = useRouter();
  const changePinMutation = useChangePin();

  const [step, setStep] = useState<Step>("old");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleNumberPress = (num: string) => {
    if (step === "old") {
      if (oldPin.length < 4) setOldPin(prev => prev + num);
    } else if (step === "new") {
      if (newPin.length < 4) setNewPin(prev => prev + num);
    } else {
      if (confirmPin.length < 4) setConfirmPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (step === "old") {
      setOldPin(prev => prev.slice(0, -1));
    } else if (step === "new") {
      setNewPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleNext = () => {
    if (step === "old" && oldPin.length === 4) {
      setStep("new");
    } else if (step === "new" && newPin.length === 4) {
      setStep("confirm");
    }
  };

  const handleChangePin = async () => {
    if (newPin !== confirmPin) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "New PINs do not match",
      });
      setConfirmPin("");
      return;
    }

    try {
      const response = await changePinMutation.mutateAsync({
        old_pin: oldPin,
        new_pin: newPin,
        confirm_pin: confirmPin,
      });

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "PIN changed successfully",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.message || "Failed to change PIN",
        });
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to change PIN",
      });
      if (error?.message?.toLowerCase().includes("old pin")) {
        setStep("old");
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
      }
    }
  };

  const renderDot = (filled: boolean) => (
    <View
      className={`w-4 h-4 rounded-full border-2 mx-3 ${filled ? "bg-primary border-primary" : "border-muted-foreground/30"
        }`}
    />
  );

  const getCurrentPin = () => {
    if (step === "old") return oldPin;
    if (step === "new") return newPin;
    return confirmPin;
  };

  const currentPin = getCurrentPin();

  const getHeaderTitle = () => {
    if (step === "old") return "Current PIN";
    if (step === "new") return "New PIN";
    return "Confirm New PIN";
  };

  const getHeaderSub = () => {
    if (step === "old") return "Enter your current 4-digit PIN";
    if (step === "new") return "Set a new 4-digit PIN";
    return "Re-enter your new PIN to confirm";
  };

  return (
    <ScreenContainer className="bg-background">
      <Stack.Screen
        options={{
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (step === "confirm") setStep("new");
                else if (step === "new") setStep("old");
                else router.back();
              }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 px-6 pt-10">
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-6">
            <Lock size={40} className="text-primary" />
          </View>
          <H2 className="text-center font-bold">{getHeaderTitle()}</H2>
          <Muted className="text-center mt-2">{getHeaderSub()}</Muted>
        </View>

        <View className="flex-row justify-center items-center mb-20">
          {[...Array(4)].map((_, i) => renderDot(i < currentPin.length))}
        </View>

        <View className="flex-1 justify-end pb-10">
          <View className="flex-row flex-wrap justify-center gap-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => handleNumberPress(num.toString())}
                className="w-1/3 items-center py-4"
              >
                <Text className="text-3xl font-semibold text-foreground">{num}</Text>
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
            className="mt-10"
            disabled={currentPin.length !== 4 || changePinMutation.isPending}
            onPress={step === "confirm" ? handleChangePin : handleNext}
          >
            {changePinMutation.isPending ? "Changing..." : step === "confirm" ? "Change PIN" : "Next"}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}
