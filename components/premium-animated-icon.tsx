import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { PremiumIcon } from "../icons/premium-icon";

export function PremiumAnimatedIcon() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous spin for arc ring
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Soft background breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bgOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.3],
  });
  const bgScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1.06],
  });

  return (
    <View
      style={{
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Breathing glow background */}
      <Animated.View
        style={{
          position: "absolute",
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#FBBF24",
          opacity: bgOpacity,
          transform: [{ scale: bgScale }],
        }}
      />

      {/* Spinning arc — primary (top-right amber) */}
      <Animated.View
        style={{
          position: "absolute",
          width: 31,
          height: 31,
          borderRadius: 18,
          borderWidth: 2,
          borderTopColor: "#F59E0B",
          borderRightColor: "#FBBF24",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
          transform: [{ rotate: spin }],
        }}
      />

      {/* Spinning arc — secondary (bottom-left lighter) */}
      <Animated.View
        style={{
          position: "absolute",
          width: 31,
          height: 31,
          borderRadius: 18,
          borderWidth: 2,
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#FDE68A",
          borderLeftColor: "#FCD34D",
          transform: [{ rotate: spin }],
        }}
      />

      {/* Twinkling sparkle dots — staggered so they never all fire at once */}
      <SparkleDot delay={0} style={{ top: 1, left: "50%", marginLeft: -2 }} />
      <SparkleDot delay={350} style={{ right: 1, top: "50%", marginTop: -2 }} />
      <SparkleDot
        delay={800}
        style={{ bottom: 1, left: "50%", marginLeft: -2 }}
      />
      <SparkleDot delay={1200} style={{ left: 1, top: "50%", marginTop: -2 }} />

      {/* Premium Icon - static, no movement */}
      <View className="z-10">
        <PremiumIcon width={20} height={20} className="text-amber-400" />
      </View>
    </View>
  );
}

function SparkleDot({ delay, style }: { delay: number; style: object }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: "#FCD34D",
          opacity: anim,
          transform: [{ scale: anim }],
        },
        style,
      ]}
    />
  );
}
