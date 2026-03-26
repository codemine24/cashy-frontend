import { useUpdateProfile } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { Bell } from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import Feather from "@expo/vector-icons/Feather";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ─── Helpers ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
      {children}
    </Text>
  );
}

function ToggleRow({
  icon,
  iconBgClass,
  label,
  value,
  onChange,
  loading,
}: {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  loading?: boolean;
}) {
  return (
    <View className="flex-row items-center py-4 gap-3">
      <View
        className={`w-11 h-11 rounded-xl items-center justify-center mr-1 ${iconBgClass}`}
      >
        {icon}
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: "#e5e7eb", true: "#ca8a04" }}
          thumbColor="#ffffff"
        />
      )}
    </View>
  );
}

// ─── Theme selector (3-state: LIGHT / DARK / SYSTEM) ────────────────

const THEME_OPTIONS: {
  value: "LIGHT" | "DARK";
  label: string;
  icon: string;
}[] = [
  { value: "LIGHT", label: "Light", icon: "sun" },
  { value: "DARK", label: "Dark", icon: "moon" },
];

function ThemeSelector({
  selected,
  onSelect,
}: {
  selected: "LIGHT" | "DARK";
  onSelect: (theme: "LIGHT" | "DARK") => void;
}) {
  return (
    <View className="flex-row items-center py-4 gap-3">
      <View className="w-11 h-11 rounded-xl items-center justify-center mr-1 bg-violet-500/10">
        <Feather
          name={
            selected === "DARK"
              ? "moon"
              : selected === "LIGHT"
                ? "sun"
                : "smartphone"
          }
          size={22}
          color="#8b5cf6"
        />
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">
        Theme
      </Text>

      {/* Segmented control */}
      <View className="flex-row bg-muted rounded-xl overflow-hidden">
        {THEME_OPTIONS.map((opt) => {
          const isActive = opt.value === selected;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
              className={`px-3 py-2 ${isActive ? "bg-primary/15" : ""}`}
            >
              <Feather
                name={opt.icon as any}
                size={16}
                color={isActive ? "#8b5cf6" : "#9ca3af"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────

export default function AppSettingsScreen() {
  const { authState, setAuthState } = useAuth();
  const { applyUserTheme } = useTheme();
  const user = authState.user;
  const { mutate: updateProfile } = useUpdateProfile();
  const { t } = useTranslation();

  // Derive display values from user
  const currentTheme = user?.theme ?? "LIGHT";
  const pushNotification = user?.push_notification ?? true;

  // Saving indicator per setting
  const [savingField, setSavingField] = useState<string | null>(null);

  // Helper: update server + local user state
  const updateSetting = useCallback(
    (field: string, value: any) => {
      if (!user) return;

      setSavingField(field);

      updateProfile(
        { [field]: value },
        {
          onSuccess: (data) => {
            const updatedUser = { ...user, ...data.data };
            setAuthState({ ...authState, user: updatedUser });
            setUserInfo(updatedUser);
            setSavingField(null);
          },
          onError: () => {
            setSavingField(null);
          },
        },
      );
    },
    [user, authState, setAuthState, updateProfile],
  );

  // ── Handlers ──
  const handleThemeChange = useCallback(
    (theme: "LIGHT" | "DARK") => {
      // Immediately apply locally (resolves SYSTEM → OS preference)
      applyUserTheme(theme);

      // Optimistic update
      if (user) {
        const updatedUser = { ...user, theme };
        setAuthState({ ...authState, user: updatedUser });
        setUserInfo(updatedUser);
      }

      updateSetting("theme", theme);
    },
    [user, authState, setAuthState, applyUserTheme, updateSetting],
  );

  const handleNotificationToggle = useCallback(
    (enabled: boolean) => {
      updateSetting("push_notification", enabled);
    },
    [updateSetting],
  );

  return (
    <>
      <Stack.Screen options={{ title: "App Settings" }} />
      {/* edges={["bottom"]} — top is handled by the native header */}
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pt-6 pb-10"
        >
          {/* ── Appearance ── */}
          <SectionLabel>{t("settings.appearance")}</SectionLabel>
          <View className="bg-card rounded-2xl border border-border px-4 mb-6">
            <ThemeSelector
              selected={currentTheme}
              onSelect={handleThemeChange}
            />
          </View>

          {/* ── Notifications ── */}
          <SectionLabel>{t("settings.notifications")}</SectionLabel>
          <View className="bg-card rounded-2xl border border-border px-4 mb-8">
            <ToggleRow
              iconBgClass="bg-amber-500/10"
              icon={<Bell size={22} className="text-amber-500" />}
              label={t("settings.pushNotifications")}
              value={pushNotification}
              onChange={handleNotificationToggle}
              loading={savingField === "push_notification"}
            />
          </View>

          <Text className="text-center text-xs text-muted-foreground">
            {t("settings.restartNote")}
          </Text>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
