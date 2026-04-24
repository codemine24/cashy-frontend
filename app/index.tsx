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
  // const {
  //   isChecking,
  //   showModal,
  //   versionInfo,
  //   isForceUpdate,
  //   checkUpdates,
  //   handleUpdateNow,
  //   handleSkip,
  // } = useAppUpdate();

  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, authState.isAuthenticated, router]);

  // useEffect(() => {
  //   checkUpdates();
  // }, [checkUpdates]);

  if (!authReady) {
    return null;
  }

  return (
    <ScreenWrapper className="bg-background px-6">
      <WelcomeHeader />
      <OnboardingCarousel />

      <View className="mb-16">
        <Button
          onPress={() => {
            try {
              router.push("/login-type");
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
        >
          Get Started
        </Button>
      </View>

      {/* <UpdateModal
        visible={showModal}
        versionInfo={versionInfo}
        onUpdateNow={handleUpdateNow}
        onSkip={handleSkip}
        isForceUpdate={isForceUpdate}
      /> */}
    </ScreenWrapper>
  );
}
