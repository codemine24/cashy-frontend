import { useNetworkStatus } from "@/hooks/use-network-status";
import { WifiOff } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOnline) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -60,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOnline, slideAnim, opacityAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
      pointerEvents="none"
    >
      <View
        style={{
          backgroundColor: "#1e293b",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 10,
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        <WifiOff size={15} color="#f87171" />
        <Text
          style={{
            color: "#f1f5f9",
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 0.2,
          }}
        >
          No internet connection
        </Text>
      </View>
    </Animated.View>
  );
}
