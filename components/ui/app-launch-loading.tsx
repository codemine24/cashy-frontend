import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { H1, Muted } from "./typography";

export function AppLaunchLoading() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [opacity, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <View className="items-center justify-center">
        <Animated.Image source={require("@/assets/images/logo.png")} style={[styles.iconContainer, animatedIconStyle]} />
        <H1 className="mt-8 text-4xl font-bold tracking-tighter uppercase text-foreground">Cashy</H1>
        <Muted className="mt-2 text-sm font-medium text-foreground">Loading...</Muted>
      </View>

      <View style={styles.footer}>
        <View className="flex-row items-center gap-2">
          <View className="h-1 w-1 rounded-full bg-primary" />
          <View className="h-1 w-1 rounded-full bg-primary/60" />
          <View className="h-1 w-1 rounded-full bg-primary/30" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
});
