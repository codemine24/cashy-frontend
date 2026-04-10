import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { OnboardingCarousel } from "@/components/welcome/onboarding-carousel";
import { WelcomeHeader } from "@/components/welcome/welcome-header";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const { authState, authReady } = useAuth();

  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, authState.isAuthenticated, router]);

  if (!authReady) {
    return null;
  }
  return (
    <ScreenWrapper className="bg-background px-6 ">
      {/* <View className="flex-1 px-6"> */}
      {/* ── Header: Logo ── */}
      <WelcomeHeader />

      {/* ── Onboarding Carousel ── */}
      <OnboardingCarousel />

      {/* ── Bottom CTA ── */}
      <View className="mb-16">
        <Button onPress={() => router.push("/login-type" as any)}>Get Started</Button>
      </View>
      {/* </View> */}
    </ScreenWrapper>
  );
}
