import { useUpdateProfile } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { languages, type LanguageCode } from "@/constants/onboarding";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ChevronLeft } from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import Feather from "@expo/vector-icons/Feather";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Popover from "react-native-popover-view";

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
  t,
}: {
  selected: "LIGHT" | "DARK";
  onSelect: (theme: "LIGHT" | "DARK") => void;
  t: (key: string) => string;
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
        {t("settings.theme")}
      </Text>

      {/* Segmented control */}
      <View className="flex-row bg-background rounded-xl overflow-hidden">
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

// ─── Language selector ───────────────────────────────────────────────────

function LanguageSelector({
  selected,
  onSelect,
  t,
}: {
  selected: LanguageCode;
  onSelect: (language: LanguageCode) => void;
  t: (key: string) => string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const selectedLanguage = languages.find((lang) => lang.code === selected);

  return (
    <View className="flex-row items-center py-4 gap-3">
      <View className="w-11 h-11 rounded-xl items-center justify-center mr-1 bg-blue-500/10">
        <Feather name="globe" size={22} color="#3b82f6" />
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">
        {t("settings.language")}
      </Text>

      {/* Dropdown */}
      <Popover
        isVisible={showDropdown}
        onRequestClose={() => setShowDropdown(false)}
        from={
          <TouchableOpacity
            onPress={() => setShowDropdown(true)}
            activeOpacity={0.7}
            className="flex-row items-center bg-background rounded-xl px-3 py-2 w-16"
          >
            <Text className="text-sm font-medium text-foreground flex-1 text-center">
              {selectedLanguage?.code.toUpperCase()}
            </Text>
            <Feather
              name="chevron-down"
              size={16}
              color="#9ca3af"
              style={{
                transform: [{ rotate: showDropdown ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>
        }
        popoverStyle={{
          borderRadius: 12,
          backgroundColor: "#ffffff",
          width: 140,
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderWidth: 0,
        }}
        backgroundStyle={{ backgroundColor: "transparent" }}
        arrowSize={{ width: 0, height: 0 }}
      >
        <View className="bg-card border border-border">
          {languages.map((lang) => {
            const isActive = lang.code === selected;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => {
                  onSelect(lang.code);
                  setShowDropdown(false);
                }}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between px-3 py-2.5 ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <View>
                  <Text
                    className={`text-sm font-medium ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {lang.label}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground">
                    {lang.nativeLabel}
                  </Text>
                </View>
                {isActive && <Feather name="check" size={16} color="#8b5cf6" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Popover>
    </View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────

export default function AppSettingsScreen() {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const { applyUserTheme } = useTheme();
  const user = authState.user;
  const { mutate: updateProfile } = useUpdateProfile();
  const { t } = useTranslation();

  // Derive display values from user
  const currentTheme = user?.theme ?? "LIGHT";
  const currentLanguage = (user?.language as LanguageCode) ?? "en";

  // Helper: update server + local user state
  const updateSetting = useCallback(
    (field: string, value: any) => {
      if (!user) return;

      updateProfile(
        { [field]: value },
        {
          onSuccess: (data) => {
            const updatedUser = { ...user, ...data.data };
            setAuthState({ ...authState, user: updatedUser });
            setUserInfo(updatedUser);
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

  const handleLanguageChange = useCallback(
    (language: LanguageCode) => {
      updateSetting("language", language);
    },
    [updateSetting],
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate("/settings");
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
    <>
      <Stack.Screen
        options={{
          title: t("settings.appSettings"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate("/settings")}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      {/* edges={["bottom"]} — top is handled by the native header */}
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pt-6 pb-10"
        >
          {/* ── App Settings ── */}
          <View className="bg-card rounded-2xl border border-border px-4 mb-6">
            <ThemeSelector
              selected={currentTheme}
              onSelect={handleThemeChange}
              t={t}
            />
            <View className="h-px bg-border" />
            <LanguageSelector
              selected={currentLanguage}
              onSelect={handleLanguageChange}
              t={t}
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
