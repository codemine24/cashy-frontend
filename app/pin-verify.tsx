import { useVerifyPin } from "@/api/user";
import { Button } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { Delete, ShieldCheck } from "@/lib/icons";
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

export default function PinVerifyScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const verifyPinMutation = useVerifyPin();

  const [pin, setPin] = useState("");

  // Block hardware back — user must verify PIN
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, []),
  );

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) setPin((p) => p + num);
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  const handleVerify = async () => {
    try {
      const response = await verifyPinMutation.mutateAsync({ pin });

      if (response.success) {
        router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Incorrect PIN",
          text2: response.message,
        });
        setPin("");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Incorrect PIN",
        text2: error?.message || "Please try again",
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-10">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-6">
            <ShieldCheck size={40} className="text-primary" />
          </View>
          <H2 className="text-center font-bold">Enter your PIN</H2>
          <Muted className="text-center mt-2">
            Enter your 4-digit PIN to continue
          </Muted>
          {authState.user?.email ? (
            <Muted className="text-center text-xs mt-1">
              Signed in as {authState.user.email}
            </Muted>
          ) : null}
        </View>

        {/* PIN dots */}
        <View className="flex-row justify-center items-center mb-10">
          {[...Array(4)].map((_, i) => renderDot(i < pin.length))}
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
            disabled={pin.length !== 4 || verifyPinMutation.isPending}
            onPress={handleVerify}
          >
            {verifyPinMutation.isPending ? "Verifying..." : "Verify PIN"}
          </Button>

          {/* Forgot PIN */}
          <TouchableOpacity
            onPress={() => router.push("/pin-forgot")}
            className="mt-5 items-center"
          >
            <Muted className="text-sm underline">Forgot PIN?</Muted>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
