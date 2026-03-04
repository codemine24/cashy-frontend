import { useState } from "react";
import { LanguageModal } from "@/components/welcome/language-modal";
import { OnboardingCarousel } from "@/components/welcome/onboarding-carousel";
import { WelcomeHeader } from "@/components/welcome/welcome-header";
import { languages, type LanguageCode } from "@/constants/onboarding";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

  const currentLanguageLabel =
    languages.find((l) => l.code === selectedLanguage)?.label ?? "English";

  const handleLanguageSelect = (code: LanguageCode) => {
    setSelectedLanguage(code);
    setLanguageModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* ── Header: Logo + Language ── */}
      <WelcomeHeader
        currentLanguage={currentLanguageLabel}
        onLanguagePress={() => setLanguageModalVisible(true)}
      />

      {/* ── Onboarding Carousel ── */}
      <OnboardingCarousel />

      {/* ── Bottom CTA ── */}
      <View className="px-6 pb-3">
        {/* Get Started button */}
        <TouchableOpacity
          onPress={() => router.push("/login-type")}
          activeOpacity={0.85}
          className="items-center rounded bg-primary py-4"
        >
          <Text className="text-base font-bold uppercase tracking-wider text-primary-foreground">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Language Modal ── */}
      <LanguageModal
        visible={languageModalVisible}
        selectedLanguage={selectedLanguage}
        onSelect={handleLanguageSelect}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}