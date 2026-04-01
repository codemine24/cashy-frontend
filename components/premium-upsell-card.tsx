import { useTheme } from "@/context/theme-context";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

function DiamondIcon() {
  const { isDark } = useTheme();
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
      ]),
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
      ]),
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
          backgroundColor: isDark ? "#8B5CF6" : "#F59E0B", // Purple in dark, amber in light
          opacity: outerOpacity,
          transform: [{ scale: scaleAnim }],
        }}
      />
      <View
        className={`w-[62px] h-[62px] rounded-full items-center justify-center ${
          isDark ? "bg-violet-600" : "bg-amber-500" // Theme-aware background
        }`}
      >
        <Text className="text-[28px]">💎</Text>
      </View>
    </View>
  );
}

interface PremiumUpsellCardProps {
  features?: string[];
  onUpgrade?: () => void;
}

export function PremiumUpSellCard({
  features,
  onUpgrade,
}: PremiumUpsellCardProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const displayFeatures = features ?? [
    t("premium.unlimitedWallets"),
    t("premium.shareWithUnlimitedMembers"),
    t("premium.advanceAnalyticsReports"),
  ];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/settings/subscription" as any);
    }
  };

  return (
    <View
      className={`rounded-3xl overflow-hidden border ${
        isDark ? "border-violet-500/20" : "border-amber-500/20"
      }`}
    >
      <View
        className={`${isDark ? "bg-violet-950/30" : "bg-amber-50"} p-6 relative`}
      >
        {/* Decorative blobs - theme-aware */}
        <View
          className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${
            isDark ? "bg-violet-600 opacity-20" : "bg-amber-300 opacity-25"
          }`}
        />
        <View
          className={`absolute -bottom-5 -left-5 w-20 h-20 rounded-full ${
            isDark ? "bg-violet-700 opacity-25" : "bg-amber-200 opacity-30"
          }`}
        />

        {/* Icon */}
        <View className="items-center mb-4">
          <DiamondIcon />
        </View>

        {/* Title */}
        <Text
          className={`text-xl font-extrabold text-center mb-1 tracking-wide ${
            isDark ? "text-violet-100" : "text-stone-900"
          }`}
        >
          {t("premium.unlockPremiumFeatures")}
        </Text>

        {/* Subtitle */}
        <Text
          className={`text-[13px] text-center mb-5 leading-[18px] ${
            isDark ? "text-violet-200" : "text-stone-500"
          }`}
        >
          {t("premium.oneTimePaymentLifetimeAccess")}
        </Text>

        {/* Features */}
        <View className="mb-6 flex flex-col gap-2.5">
          {displayFeatures.map((feature, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <View
                className={`size-5 rounded-full items-center justify-center ${
                  isDark ? "bg-violet-500/20" : "bg-amber-500/15"
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    isDark ? "text-violet-300" : "text-amber-700"
                  }`}
                >
                  ✓
                </Text>
              </View>
              <Text
                className={`text-sm font-medium flex-1 leading-5 ${
                  isDark ? "text-violet-100" : "text-stone-800"
                }`}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleUpgrade}
          className={`rounded-2xl py-4 items-center justify-center flex-row space-x-2 ${
            isDark ? "bg-violet-600" : "bg-amber-500"
          }`}
          style={{
            shadowColor: isDark ? "#8B5CF6" : "#F59E0B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text className="text-sm">💎</Text>
          <Text className="text-white font-extrabold text-[15px] tracking-wide">
            {t("premium.upgradeToPremium")}
          </Text>
        </TouchableOpacity>

        {/* Price */}
        <View
          className={`flex-row items-center justify-center mt-2.5 ${isDark ? "text-violet-300" : "text-stone-400"}`}
        >
          <Text
            className={`text-[11px] ${isDark ? "text-violet-300" : "text-stone-400"}`}
          >
            {t("premium.limitedOfferPrefix")} · {t("premium.limitedOfferOnly")}
          </Text>
          <Text
            className={`text-[11px] mx-1 ${isDark ? "text-violet-300" : "text-stone-400"}`}
            style={{ textDecorationLine: "line-through" }}
          >
            {t("premium.originalPrice")}
          </Text>
          <Text
            className={`text-[11px] font-bold ${isDark ? "text-violet-400" : "text-amber-500"}`}
          >
            {" "}
            {t("premium.discountedPrice")}
          </Text>
          <Text
            className={`text-[11px] ${isDark ? "text-violet-300" : "text-stone-400"}`}
          >
            {" "}
            {t("premium.oneTime")}
          </Text>
        </View>
      </View>
    </View>
  );
}
