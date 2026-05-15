import { ScreenWrapper } from "@/components/screen-wrapper";
import { AppLaunchLoading } from "@/components/ui/app-launch-loading";
import { Button } from "@/components/ui/button";
import { UpdateModal } from "@/components/update-modal";
import { OnboardingCarousel } from "@/components/welcome/onboarding-carousel";
import { WelcomeHeader } from "@/components/welcome/welcome-header";
import { useAuth } from "@/context/auth-context";
import { useAppUpdateContext } from "@/context/update-context";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { authState, authReady } = useAuth();
  const hasHandledAuthenticatedEntry = useRef(false);
  const userId = authState.user?.id;
  const isPinEnabled = authState.user?.is_pin_enabled;
  const hasPin = !!authState.user?.pin;
  const {
    isChecking,
    showModal,
    hasUpdate,
    versionInfo,
    isForceUpdate,
    checkUpdates,
    handleUpdateNow,
    handleSkip,
  } = useAppUpdate();
  const { isModalSkipped } = useAppUpdateContext();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      hasHandledAuthenticatedEntry.current = false;
      return;
    }

    if (hasHandledAuthenticatedEntry.current) return;
    if (isChecking) return;
    if (hasUpdate && isForceUpdate) return;

    const gateRoute =
      userId && isPinEnabled ? (hasPin ? "/pin-verify" : "/pin-setup") : "/(tabs)";

    if (authReady && authState.isAuthenticated && !hasUpdate) {
      hasHandledAuthenticatedEntry.current = true;
      return router.replace(gateRoute as any);
    }

    if (authReady && authState.isAuthenticated && hasUpdate && isModalSkipped) {
      hasHandledAuthenticatedEntry.current = true;
      router.replace(gateRoute as any);
    }
  }, [
    isChecking,
    authReady,
    authState.isAuthenticated,
    userId,
    isPinEnabled,
    hasPin,
    hasUpdate,
    isForceUpdate,
    isModalSkipped,
    router,
  ]);

  useEffect(() => {
    if (!isModalSkipped) {
      checkUpdates();
    }
  }, [checkUpdates, isModalSkipped]);

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

  if (isChecking || !authReady || authState.isAuthenticated) {
    return <AppLaunchLoading />;
  }

  return (
    <ScreenWrapper className="bg-background px-6">
      <WelcomeHeader />
      <OnboardingCarousel />

      <View className="mb-16">
        <Button
          disabled={isChecking}
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

      <UpdateModal
        visible={showModal && !isModalSkipped}
        versionInfo={versionInfo}
        onUpdateNow={handleUpdateNow}
        onSkip={handleSkip}
        isForceUpdate={isForceUpdate}
      />
    </ScreenWrapper>
  );
}
