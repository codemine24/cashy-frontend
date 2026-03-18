import { BellIcon } from "@/icons/bell-icon";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import { Menu } from "@/lib/icons";


function PremiumIcon() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous spin for arc ring
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
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
      ])
    ).start();

    // Crown gentle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -2.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim, pulseAnim, spinAnim]);

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
    <View style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}>

      {/* Breathing glow background */}
      <Animated.View
        style={{
          position: "absolute",
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#FBBF24",
          opacity: bgOpacity,
          transform: [{ scale: bgScale }],
        }}
      />

      {/* Spinning arc — primary (top-right amber) */}
      <Animated.View
        style={{
          position: "absolute",
          width: 35,
          height: 35,
          borderRadius: 20,
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
          width: 35,
          height: 35,
          borderRadius: 20,
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
      <SparkleDot delay={800} style={{ bottom: 1, left: "50%", marginLeft: -2 }} />
      <SparkleDot delay={1200} style={{ left: 1, top: "50%", marginTop: -2 }} />

      {/* Crown — gently floating */}
      <Animated.Text
        style={{
          fontSize: 17,
          zIndex: 2,
          transform: [{ translateY: bounceAnim }],
        }}
      >
        👑
      </Animated.Text>
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
      ])
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

export const TabHeader = () => {
  const router = useRouter();

  return (
    <View
      className="bg-background border-b border-border"
      style={{
        paddingHorizontal: 20,
        paddingBottom: 12,
        paddingTop: 4,
      }}
    >
      <View className="flex-row items-center justify-between">

        {/* Left: App Name */}
        <View>
          <Text className="text-foreground text-3xl font-bold">CASHY</Text>
        </View>

        {/* Right: Premium + Notification + Menu */}
        <View className="flex-row items-center gap-2.5">

          {/* Premium animated icon */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push("/settings/subscription")}
            className="size-10 items-center justify-center"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <PremiumIcon />
          </TouchableOpacity>

          {/* Notification */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/notifications" as any)}
            className="size-10 items-center justify-center"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <BellIcon className="text-foreground" />
          </TouchableOpacity>

          {/* Breadcrumb / Menu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/settings" as any)}
            className="size-10 items-center justify-center bg-muted rounded-xl"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Menu size={18} className="text-foreground" />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}