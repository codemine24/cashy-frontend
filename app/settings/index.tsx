import { ScreenContainer } from "@/components/screen-container";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PremiumUpSellCard } from "@/components/premium-upsell-card";
import { useAuth } from "@/context/auth-context";
import { ChevronRight, Info, LogOut, Settings, User } from "@/lib/icons";
import { clearUserInfo, removeAccessToken } from "@/utils/auth";
import { makeImageUrl } from "@/utils/helper";

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
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await removeAccessToken();
    await clearUserInfo();
    setAuthState({ isAuthenticated: false, user: null });
    router.replace("/");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("settings.more"),
          headerBackTitle: t("common.back"),
          headerShadowVisible: true,
        }}
      />
      <ScreenContainer edges={["left", "right"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
          }}
        >
          <View className="mb-6 flex-row items-center gap-3 bg-card rounded-2xl border border-border px-4 py-4">
            <Image
              source={{ uri: makeImageUrl(authState?.user?.avatar, "user") }}
              className="size-11 rounded-full"
            />
            <View>
              <Text className="text-2xl font-bold text-foreground">
                {authState?.user?.name}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {authState?.user?.email}
              </Text>
            </View>
          </View>

          <PremiumUpSellCard />

          {/* ── Main settings group ── */}
          <View className="bg-card rounded-2xl border border-border px-4 my-6">
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
                t("settings.termsAndConditions") +
                ", " +
                t("settings.aboutUs")
              }
              onPress={() => router.push("/settings/about" as any)}
            />
          </View>

          {/* ── Logout ── */}
          <View className="bg-card rounded-2xl border border-border px-4">
            <TouchableOpacity
              onPress={() =>
                Alert.alert(t("settings.logOut"), t("settings.logOutConfirm"), [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("settings.logOut"),
                    style: "destructive",
                    onPress: handleLogout,
                  },
                ])
              }
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
      </ScreenContainer>
    </>
  );
}
