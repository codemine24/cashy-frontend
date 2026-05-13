import { useVerifyPin } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { ChevronLeft, Delete, ShieldCheck } from "@/lib/icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function VerifyPinScreen() {
  const router = useRouter();
  const verifyPinMutation = useVerifyPin();

  const [pin, setPin] = useState("");

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) setPin((prev) => prev + num);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleVerify = async () => {
    try {
      const response = await verifyPinMutation.mutateAsync({ pin });

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Verified",
          text2: "PIN verified successfully",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Incorrect PIN",
          text2: response.message,
        });
        setPin("");
      }
    } catch (error: any) {
      console.log(error, 'pin error')
      Toast.show({
        type: "error",
        text1: "Incorrect PIN",
        text2: error?.message || "The PIN you entered is incorrect",
      });
      setPin("");
    }
  };

  const renderDot = (filled: boolean) => (
    <View
      className={`w-4 h-4 rounded-full border-2 mx-3 ${filled ? "bg-primary border-primary" : "border-muted-foreground/30"
        }`}
    />
  );

  return (
    <ScreenContainer className="bg-background">
      <Stack.Screen
        options={{
          title: "",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 px-6 pt-10">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-3xl bg-emerald-500/10 items-center justify-center mb-6">
            <ShieldCheck size={40} className="text-emerald-500" />
          </View>
          <H2 className="text-center font-bold">Verify PIN</H2>
          <Muted className="text-center mt-2">
            Enter your 4-digit PIN to verify
          </Muted>
        </View>

        {/* PIN Dots */}
        <View className="flex-row justify-center items-center mb-20">
          {[...Array(4)].map((_, i) => renderDot(i < pin.length))}
        </View>

        {/* Number Pad + Button */}
        <View className="flex-1 justify-end pb-10">
          <View className="flex-row flex-wrap justify-center gap-y-6">
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
            className="mt-10"
            disabled={pin.length !== 4 || verifyPinMutation.isPending}
            onPress={handleVerify}
          >
            {verifyPinMutation.isPending ? "Verifying..." : "Verify"}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}
