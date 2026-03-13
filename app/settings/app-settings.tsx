import { useUpdateProfile } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { currencies, languages } from "@/constants/onboarding";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { Bell, Check, ChevronRight, Globe, X } from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import Feather from "@expo/vector-icons/Feather";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
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
      <View className={`w-11 h-11 rounded-xl items-center justify-center mr-1 ${iconBgClass}`}>
        {icon}
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">{label}</Text>
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

function SelectRow({
  icon,
  iconBgClass,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4 gap-3"
    >
      <View className={`w-11 h-11 rounded-xl items-center justify-center mr-1 ${iconBgClass}`}>
        {icon}
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">{label}</Text>
      <Text className="text-sm font-medium text-muted-foreground mr-1">{value}</Text>
      <ChevronRight size={18} className="text-muted-foreground" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-border ml-16" />;
}

// ─── Selection bottom-sheet modal ───────────────────────────────────

function SelectionModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { code: T; label: string; extra?: string }[];
  selected: T;
  onSelect: (code: T) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable onPress={onClose} className="flex-1 bg-black/40" />

      {/* Bottom sheet */}
      <View className="rounded-t-3xl bg-card px-5 pb-10 pt-5">
        {/* Handle bar */}
        <View className="mb-4 items-center">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>

        {/* Header */}
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-card-foreground">{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <X size={22} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Options list */}
        {options.map((opt) => {
          const isSelected = opt.code === selected;
          return (
            <TouchableOpacity
              key={opt.code}
              onPress={() => onSelect(opt.code)}
              activeOpacity={0.7}
              className={`mb-2 flex-row items-center justify-between rounded-xl px-4 py-3.5 ${isSelected ? "bg-primary/10" : "bg-muted"
                }`}
            >
              <View className="flex-row items-center gap-3">
                <Text
                  className={`text-base font-semibold ${isSelected ? "text-primary" : "text-card-foreground"
                    }`}
                >
                  {opt.label}
                </Text>
                {opt.extra && (
                  <Text className="text-sm text-muted-foreground">{opt.extra}</Text>
                )}
              </View>

              {isSelected && <Check size={20} className="text-primary" />}
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
}

// ─── Theme selector (3-state: LIGHT / DARK / SYSTEM) ────────────────

const THEME_OPTIONS: { value: "LIGHT" | "DARK" | "SYSTEM"; label: string; icon: string }[] = [
  { value: "LIGHT", label: "Light", icon: "sun" },
  { value: "DARK", label: "Dark", icon: "moon" },
  { value: "SYSTEM", label: "System", icon: "smartphone" },
];

function ThemeSelector({
  selected,
  onSelect,
}: {
  selected: "LIGHT" | "DARK" | "SYSTEM";
  onSelect: (theme: "LIGHT" | "DARK" | "SYSTEM") => void;
}) {
  return (
    <View className="flex-row items-center py-4 gap-3">
      <View className="w-11 h-11 rounded-xl items-center justify-center mr-1 bg-violet-500/10">
        <Feather
          name={selected === "DARK" ? "moon" : selected === "LIGHT" ? "sun" : "smartphone"}
          size={22}
          color="#8b5cf6"
        />
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">Theme</Text>

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
  const currentTheme = user?.theme ?? "SYSTEM";
  const currentLanguage = user?.language ?? "en";
  const currentCurrency = user?.currency ?? "USD";
  const pushNotification = user?.push_notification ?? true;

  // Modal visibility
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

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
    (theme: "LIGHT" | "DARK" | "SYSTEM") => {
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

  const handleLanguageSelect = useCallback(
    (code: string) => {
      setLanguageModalVisible(false);
      updateSetting("language", code);
    },
    [updateSetting],
  );

  const handleCurrencySelect = useCallback(
    (code: string) => {
      setCurrencyModalVisible(false);
      updateSetting("currency", code);
    },
    [updateSetting],
  );

  const handleNotificationToggle = useCallback(
    (enabled: boolean) => {
      updateSetting("push_notification", enabled);
    },
    [updateSetting],
  );

  // ── Derived display labels ──

  const languageLabel =
    languages.find((l) => l.code === currentLanguage)?.label ?? currentLanguage;

  const currencyObj = currencies.find((c) => c.code === currentCurrency);
  const currencyLabel = currencyObj
    ? `${currencyObj.code} (${currencyObj.symbol})`
    : currentCurrency;

  const languageOptions = languages.map((l) => ({
    code: l.code,
    label: l.label,
    extra: l.nativeLabel,
  }));

  const currencyOptions = currencies.map((c) => ({
    code: c.code,
    label: c.label,
    extra: c.symbol,
  }));

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
            <ThemeSelector selected={currentTheme} onSelect={handleThemeChange} />
          </View>

          {/* ── Localisation ── */}
          <SectionLabel>{t("settings.localisation")}</SectionLabel>
          <View className="bg-card rounded-2xl border border-border px-4 mb-6">
            <SelectRow
              iconBgClass="bg-blue-500/10"
              icon={<Globe size={22} className="text-blue-500" />}
              label={t("settings.language")}
              value={languageLabel}
              onPress={() => setLanguageModalVisible(true)}
            />
            <Divider />
            <SelectRow
              iconBgClass="bg-emerald-500/10"
              icon={<Text style={{ fontSize: 18 }}>💱</Text>}
              label={t("settings.currency")}
              value={currencyLabel}
              onPress={() => setCurrencyModalVisible(true)}
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

      {/* ── Modals ── */}
      <SelectionModal
        visible={languageModalVisible}
        title={t("settings.selectLanguage")}
        options={languageOptions}
        selected={currentLanguage}
        onSelect={handleLanguageSelect}
        onClose={() => setLanguageModalVisible(false)}
      />

      <SelectionModal
        visible={currencyModalVisible}
        title={t("settings.selectCurrency")}
        options={currencyOptions}
        selected={currentCurrency}
        onSelect={handleCurrencySelect}
        onClose={() => setCurrencyModalVisible(false)}
      />
    </>
  );
}