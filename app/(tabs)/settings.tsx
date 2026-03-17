import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/context/auth-context";
import {
  ChevronRight,
  Info,
  LogOut,
  Settings,
  User,
} from "@/lib/icons";
import { clearUserInfo, removeAccessToken } from "@/utils/auth";

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
          <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
        ) : null}
      </View>

      {/* Arrow or danger icon */}
      {danger ? null : <ChevronRight size={18} className="text-muted-foreground" />}
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
  const { setAuthState } = useAuth();

  const handleLogout = async () => {
    // Clear local tokens and user info using the app's auth helpers
    await removeAccessToken();
    await clearUserInfo();
    setAuthState({ isAuthenticated: false, user: null });

    // Redirect user to the login screen
    router.replace("/login-type");
  };

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 40,
        }}
      >

        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Manage your account &amp; preferences
          </Text>
        </View>

        {/* ── Main settings group ── */}
        <View className="bg-card rounded-2xl border border-border px-4 mb-4">
          <SettingsRow
            iconBgClass="bg-violet-500/10"
            icon={<Settings size={22} className="text-violet-500" />}
            title="App Settings"
            subtitle="Language, Theme, Notifications"
            onPress={() => router.push("/settings/app-settings" as any)}
          />
          <Divider />
          <SettingsRow
            iconBgClass="bg-blue-500/10"
            icon={<User size={22} className="text-blue-500" />}
            title="Your Profile"
            subtitle="Name, Avatar, Email"
            onPress={() => router.push("/settings/profile" as any)}
          />
          <Divider />
          <SettingsRow
            iconBgClass="bg-amber-500/10"
            icon={<Info size={22} className="text-amber-500" />}
            title="About Cashy"
            subtitle="Privacy Policy, T&C, About us"
            onPress={() => router.push("/settings/about" as any)}
          />
        </View>

        {/* ── Logout ── */}
        <View className="bg-card rounded-2xl border border-border px-4">
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Log Out", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log Out",
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
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}