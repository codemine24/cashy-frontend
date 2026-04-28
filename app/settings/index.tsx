import { ScreenContainer } from "@/components/screen-container";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { CommonActions } from "@react-navigation/native";
import { Stack, useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PremiumBadge } from "@/components/premium-badge";
import { PremiumUpSellCard } from "@/components/premium-upsell-card";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useIsPremium } from "@/hooks/use-is-premium";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  LogOut,
  Settings,
  User,
} from "@/lib/icons";
import { clearUserInfo, removeAccessToken } from "@/utils/auth";
import { makeImageUrl } from "@/utils/helper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Reusable row component ───────────────────────────────────────────────
function SettingsRow({
  icon,
  iconBgClass,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
    >
      {/* Icon bubble */}
      <View
        className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${iconBgClass}`}
      >
        {icon}
      </View>

      {/* Text */}
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${danger ? "text-destructive" : "text-foreground"}`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Arrow or danger icon */}
      {danger ? null : (
        <ChevronRight size={18} className="text-muted-foreground" />
      )}
    </TouchableOpacity>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────
function Divider() {
  return <View className="h-px bg-border ml-16" />;
}

// ─── Main screen ─────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { authState, setAuthState } = useAuth();
  const { t } = useTranslation();
  const { isPremium } = useIsPremium();
  const { setColorScheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await removeAccessToken();
    await clearUserInfo();
    setAuthState({ isAuthenticated: false, user: null });

    // Reset theme to light theme after logout
    setColorScheme("light");
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "login-type" }] }),
    );
  };

  const handleLogoutConfirm = async () => {
    await handleLogout();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate("/(tabs)");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router]),
  );

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <View className="flex-1 border-t border-border pt-2">
        <Stack.Screen
          options={{
            headerShown: true,
            title: t("settings.more"),
            animation: "none",
            headerBackTitle: t("common.back"),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.navigate("/(tabs)")}
                style={{ marginRight: 4 }}
              >
                <ChevronLeft size={26} className="text-foreground" />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
          }}
        >
          <TouchableOpacity
            className="flex-row items-center gap-3 bg-card rounded-2xl border border-border px-4 py-4"
            onPress={() => router.navigate("/settings/profile")}
          >
            <Image
              source={{
                uri: authState?.user?.avatar
                  ? authState.user.avatar.startsWith("http")
                    ? authState.user.avatar
                    : makeImageUrl(authState.user.avatar, "user")
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              className="size-11 rounded-full"
            />
            <View>
              <View className="flex-row items-center gap-2.5">
                <Text className="text-2xl font-bold text-foreground">
                  {authState?.user?.name || "N/A"}
                </Text>
                {isPremium && <PremiumBadge />}
              </View>
              <Text className="text-sm text-muted-foreground mt-1">
                {authState?.user?.email || "N/A"}
              </Text>
            </View>
          </TouchableOpacity>

          {!isPremium && <PremiumUpSellCard />}

          {/* ── Main settings group ── */}
          <View className="bg-card rounded-2xl border border-border px-4 my-4">
            <SettingsRow
              iconBgClass="bg-violet-500/10"
              icon={<Settings size={22} className="text-violet-500" />}
              title={t("settings.appSettings")}
              subtitle={
                t("settings.languageSection") +
                ", " +
                t("settings.theme") +
                ", " +
                t("settings.notifications")
              }
              onPress={() => router.push("/settings/app-settings" as any)}
            />
            <Divider />
            <SettingsRow
              iconBgClass="bg-blue-500/10"
              icon={<User size={22} className="text-blue-500" />}
              title={t("settings.profile")}
              subtitle={t("settings.profileInfo")}
              onPress={() => router.push("/settings/profile" as any)}
            />
            <Divider />
            <SettingsRow
              iconBgClass="bg-amber-500/10"
              icon={<Info size={22} className="text-amber-500" />}
              title={t("settings.aboutCashy")}
              subtitle={
                t("settings.privacyPolicy") +
                ", " +
                t("settings.deleteAccount") +
                ", " +
                t("settings.aboutUs")
              }
              onPress={() => router.push("/settings/about-cashy" as any)}
            />
          </View>

          {/* ── Logout ── */}
          <View
            className="bg-card rounded-2xl border border-border px-4"
            style={{ marginBottom: Math.min(insets.bottom, 20) }}
          >
            <TouchableOpacity
              onPress={() => setShowLogoutModal(true)}
              activeOpacity={0.7}
              className="flex-row items-center py-4 gap-3"
            >
              <View className="w-11 h-11 rounded-xl items-center justify-center bg-destructive/10">
                <LogOut size={22} className="text-destructive" />
              </View>
              <Text className="text-base font-semibold text-destructive">
                {t("settings.logOut")}{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title={t("settings.logOut")}
        message="Are you sure you want to log out?"
        confirmText={t("settings.logOut")}
        cancelText={t("common.cancel")}
      />
    </ScreenContainer>
  );
}
