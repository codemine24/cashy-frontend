import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

const PREMIUM_FEATURES = [
  "Unlimited wallets & goals",
  "Share with unlimited members",
  "Advance analytics & reports",
];

function DiamondIcon() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, shimmerAnim]);

  const outerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.35],
  });

  return (
    <View className="items-center justify-center w-20 h-20">
      <Animated.View
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#F59E0B",
          opacity: outerOpacity,
          transform: [{ scale: scaleAnim }],
        }}
      />
      <View className="w-[62px] h-[62px] rounded-full bg-amber-500 items-center justify-center">
        <Text className="text-[28px]">💎</Text>
      </View>
    </View>
  );
}

interface PremiumUpsellCardProps {
  features?: string[];
  onUpgrade?: () => void;
}

export function PremiumUpSellCard({ features, onUpgrade }: PremiumUpsellCardProps) {
  const router = useRouter();
  const displayFeatures = features ?? PREMIUM_FEATURES;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/settings/subscription" as any);
    }
  };

  return (
    <View className="rounded-3xl overflow-hidden border border-amber-500/20">
      <View className="bg-amber-50 p-6">
        {/* Decorative blobs */}
        <View className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-amber-300 opacity-25" />
        <View className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-amber-200 opacity-30" />

        {/* Icon */}
        <View className="items-center mb-4">
          <DiamondIcon />
        </View>

        {/* Title */}
        <Text className="text-xl font-extrabold text-stone-900 text-center mb-1 tracking-wide">
          Unlock Premium Features
        </Text>

        {/* Subtitle */}
        <Text className="text-[13px] text-stone-500 text-center mb-5 leading-[18px]">
          One-time payment. Lifetime access. No subscriptions.
        </Text>

        {/* Features */}
        <View className="mb-6 flex flex-col gap-2.5">
          {displayFeatures.map((feature, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <View className="size-5 rounded-full bg-amber-500/15 items-center justify-center">
                <Text className="text-[11px]">✓</Text>
              </View>
              <Text className="text-sm text-stone-800 font-medium flex-1 leading-5">
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleUpgrade}
          className="bg-amber-500 rounded-2xl py-4 items-center justify-center flex-row space-x-2"
          style={{
            shadowColor: "#F59E0B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text className="text-sm">💎</Text>
          <Text className="text-white font-extrabold text-[15px] tracking-wide">
            Upgrade to Premium
          </Text>
        </TouchableOpacity>

        {/* Price */}
        <Text className="text-[11px] text-stone-400 text-center mt-2.5">
          Limited offer · Only{" "}
          <Text className="line-through">$14.99</Text>{" "}
          <Text className="text-amber-500 font-bold">$4.99</Text> one-time
        </Text>
      </View>
    </View>
  );
}