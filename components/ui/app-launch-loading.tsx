import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Wallet } from "@/lib/icons";
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
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container} className="bg-background">
      <View className="items-center justify-center">
        <Animated.View style={[styles.iconContainer, animatedIconStyle]} className="bg-primary/10">
          <Wallet size={48} className="text-primary" />
        </Animated.View>
        
        <H1 className="mt-8 text-4xl font-bold tracking-tighter">Cashy</H1>
        <Muted className="mt-2 text-sm font-medium">Launching your finance hub...</Muted>
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
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
});
