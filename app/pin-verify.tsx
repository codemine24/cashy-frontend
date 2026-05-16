import { useVerifyPin } from "@/api/user";
import { H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { Delete, ShieldCheck } from "@/lib/icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const Dot = ({ filled, error }: { filled: boolean; error: boolean }) => (
  <View
    className={`w-4 h-4 rounded-full border-2 mx-3 ${error
      ? "border-destructive bg-destructive/80"
      : filled
        ? "bg-primary border-primary"
        : "border-muted-foreground/30"
      }`}
  />
);

export default function PinVerifyScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { mutateAsync, isPending } = useVerifyPin();

  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Block Android hardware back — user must verify PIN
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, []),
  );

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleVerify = useCallback(
    async (currentPin: string) => {
      setErrorMessage(null);
      try {
        const response = await mutateAsync({ pin: currentPin });

        if (response.success) {
          router.replace("/(tabs)");
          return;
        }

        triggerShake();
        setErrorMessage(response.message || "Incorrect PIN. Please try again.");
        setPin("");
      } catch (error: unknown) {
        triggerShake();
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Incorrect PIN. Please try again.",
        );
        setPin("");
      }
    },
    [mutateAsync, router, triggerShake],
  );

  // Auto-verify when 4 digits entered, with 0.5s debounce
  useEffect(() => {
    if (pin.length !== 4 || isPending) return;

    const timer = setTimeout(() => handleVerify(pin), 100);
    return () => clearTimeout(timer);
  }, [handleVerify, isPending, pin]);

  const handleNumberPress = useCallback(
    (num: string) => {
      if (isPending) return;
      setErrorMessage(null);
      setPin((prev) => (prev.length >= 4 ? prev : prev + num));
    },
    [isPending],
  );

  const handleDelete = useCallback(() => {
    if (isPending) return;
    setErrorMessage(null);
    setPin((prev) => prev.slice(0, -1));
  }, [isPending]);

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* Full-screen loading overlay */}
      <Modal
        visible={isPending}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 items-center justify-center">
          <View className="bg-card rounded-2xl p-8 items-center gap-4 shadow-lg">
            <ActivityIndicator size="large" className="text-primary" />
            <Text className="text-card-foreground text-sm font-medium">
              Verifying PIN…
            </Text>
          </View>
        </View>
      </Modal>

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

        {/* PIN dots with shake animation */}
        <Animated.View
          style={{ transform: [{ translateX: shakeAnim }] }}
          className="flex-row justify-center items-center mb-6"
        >
          {[...Array(4)].map((_, i) => (
            <Dot key={i} filled={i < pin.length} error={!!errorMessage} />
          ))}
        </Animated.View>

        {/* Inline error message */}
        <View className="items-center mb-6 h-6 justify-center">
          {errorMessage ? (
            <Text className="text-destructive text-sm text-center">
              {errorMessage}
            </Text>
          ) : null}
        </View>

        {/* Keypad */}
        <View className="flex-1 justify-end pb-10">
          <View className="flex-row flex-wrap justify-center gap-y-4">
            {NUMBERS.map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => handleNumberPress(num.toString())}
                className="w-1/3 items-center py-4"
                disabled={isPending}
                activeOpacity={0.7}
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
              disabled={isPending}
              activeOpacity={0.7}
            >
              <Text className="text-3xl font-semibold text-foreground">0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              className="w-1/3 items-center py-4"
              disabled={isPending}
              activeOpacity={0.7}
            >
              <Delete size={30} className="text-foreground" />
            </TouchableOpacity>
          </View>

          {/* Forgot PIN */}
          <TouchableOpacity
            onPress={() => router.push("/pin-forgot")}
            className="mt-8 items-center"
            disabled={isPending}
            activeOpacity={0.7}
          >
            <Muted className="text-sm underline">Forgot PIN?</Muted>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}