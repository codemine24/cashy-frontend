import { ScreenWrapper } from "@/components/screen-wrapper";
import { Button } from "@/components/ui/button";
import { UpdateModal } from "@/components/update-modal";
import { OnboardingCarousel } from "@/components/welcome/onboarding-carousel";
import { WelcomeHeader } from "@/components/welcome/welcome-header";
import { useAuth } from "@/context/auth-context";
import { useAppUpdate } from "@/hooks/use-app-update";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { authState, authReady } = useAuth();
  const {
    isChecking,
    showModal,
    versionInfo,
    isForceUpdate,
    checkUpdates,
    handleUpdateNow,
    handleSkip,
  } = useAppUpdate();

  useEffect(() => {
    if (authReady && authState.isAuthenticated && !isChecking) {
      router.replace("/(tabs)");
    }
  }, [authReady, authState.isAuthenticated, router, isChecking]);

  useEffect(() => {
    checkUpdates();
  }, [checkUpdates]);

  // Don't render anything if update is forced and modal is shown
  if (showModal && isForceUpdate) {
    return (
      <UpdateModal
        visible={showModal}
        versionInfo={versionInfo}
        onUpdateNow={handleUpdateNow}
        onSkip={handleSkip}
        isForceUpdate={isForceUpdate}
      />
    );
  }

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
        <Button
          onPress={() => {
            try {
              router.push("/login-type");
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
          disabled={isChecking}
        >
          {isChecking ? "Checking..." : "Get Started"}
        </Button>
      </View>
      {/* </View> */}
      <UpdateModal
        visible={showModal}
        versionInfo={versionInfo}
        onUpdateNow={handleUpdateNow}
        onSkip={handleSkip}
        isForceUpdate={isForceUpdate}
      />
    </ScreenWrapper>
  );
}
