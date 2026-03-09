import { Button } from "@/components/ui/button";
import { OnboardingCarousel } from "@/components/welcome/onboarding-carousel";
import { WelcomeHeader } from "@/components/welcome/welcome-header";
import { languages, type LanguageCode } from "@/constants/onboarding";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const currentLanguageLabel = languages.find((l) => l.code === selectedLanguage)?.label ?? "English";

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
    <SafeAreaView className="flex-1 bg-background">
      {/* ── Header: Logo ── */}
      <WelcomeHeader />

      {/* ── Onboarding Carousel ── */}
      <OnboardingCarousel />

      {/* ── Bottom CTA ── */}
      <View className="px-6 mb-16">
        <Button
          onPress={() => router.push("/login-type")}
        >
          Get Started
        </Button>
      </View>
    </SafeAreaView>
  );
}