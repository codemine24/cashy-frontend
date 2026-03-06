import { ScreenContainer } from "@/components/screen-container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Bell, ChevronRight, Globe } from "@/lib/icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

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
}: {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center py-4 gap-3">
      <View className={`w-11 h-11 rounded-xl items-center justify-center mr-1 ${iconBgClass}`}>
        {icon}
      </View>
      <Text className="flex-1 text-base font-semibold text-foreground">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#e5e7eb", true: "#ca8a04" }}
        thumbColor="#ffffff"
      />
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

export default function AppSettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [language] = useState("English");
  const [currency] = useState("USD ($)");

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
          <SectionLabel>Appearance</SectionLabel>
          <View className="bg-card rounded-2xl border border-border px-4 mb-6">
            <ThemeSwitcher />
          </View>

          {/* ── Localisation ── */}
          <SectionLabel>Localisation</SectionLabel>
          <View className="bg-card rounded-2xl border border-border px-4 mb-6">
            <SelectRow
              iconBgClass="bg-blue-500/10"
              icon={<Globe size={22} className="text-blue-500" />}
              label="Language"
              value={language}
              onPress={() => { }}
            />
            <Divider />
            <SelectRow
              iconBgClass="bg-emerald-500/10"
              icon={<Text style={{ fontSize: 18 }}>💱</Text>}
              label="Currency"
              value={currency}
              onPress={() => { }}
            />
          </View>

          {/* ── Notifications ── */}
          <SectionLabel>Notifications</SectionLabel>
          <View className="bg-card rounded-2xl border border-border px-4 mb-8">
            <ToggleRow
              iconBgClass="bg-amber-500/10"
              icon={<Bell size={22} className="text-amber-500" />}
              label="Push Notifications"
              value={notifications}
              onChange={setNotifications}
            />
          </View>

          <Text className="text-center text-xs text-muted-foreground">
            Some settings may require a restart to take effect.
          </Text>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}