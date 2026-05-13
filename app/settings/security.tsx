import { useUpdateProfile } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/context/auth-context";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Lock,
  ShieldCheck,
} from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// ─── Section header ─────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 ml-1">
      {label}
    </Text>
  );
}

// ─── Row with right arrow (navigation) ──────────────────────────────────────
function NavRow({
  icon,
  iconBg,
  title,
  subtitle,
  disabled,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`flex-row items-center py-4 ${disabled ? "opacity-40" : ""}`}
    >
      <View
        className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${iconBg}`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      <ChevronRight size={18} className="text-muted-foreground" />
    </TouchableOpacity>
  );
}

// ─── Divider ────────────────────────────────────────────────────────────────
function Divider() {
  return <View className="h-px bg-border" />;
}

// ─── Main screen ────────────────────────────────────────────────────────────
export default function SecurityScreen() {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const { mutate: updateProfile } = useUpdateProfile();

  const user = authState.user;
  const isPinEnabled = user?.is_pin_enabled ?? false;
  const hasPin = !!user?.pin;

  const [toggling, setToggling] = useState(false);

  console.log(user)

  const handleTogglePinEnabled = useCallback(
    (value: boolean) => {
      if (!user) return;
      setToggling(true);

      updateProfile(
        { is_pin_enabled: value } as any,
        {
          onSuccess: (data) => {
            const updatedUser = {
              ...user,
              is_pin_enabled: data?.data?.is_pin_enabled ?? value,
            };
            setAuthState({ ...authState, user: updatedUser });
            setUserInfo(updatedUser);
            Toast.show({
              type: "success",
              text1: value ? "PIN enabled" : "PIN disabled",
            });
          },
          onError: (error: any) => {
            Toast.show({
              type: "error",
              text1: "Failed to update",
              text2: error?.message || "Please try again",
            });
          },
          onSettled: () => setToggling(false),
        },
      );
    },
    [user, authState, setAuthState, updateProfile],
  );

  return (
    <ScreenContainer edges={["bottom"]} className="bg-background">
      <Stack.Screen
        options={{
          title: "Security",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 border-t border-border px-5 pt-6">
        {/* ── PIN Lock Section ── */}
        <SectionLabel label="PIN Lock" />
        <View className="bg-card rounded-2xl border border-border px-4 mb-6">
          {/* Enable / Disable toggle */}
          <View className="flex-row items-center py-4">
            <View className="w-11 h-11 rounded-xl items-center justify-center mr-4 bg-primary/10">
              <ShieldCheck size={22} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                PIN Lock
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {isPinEnabled
                  ? "PIN lock is active"
                  : "Enable to secure your account"}
              </Text>
            </View>
            {toggling ? (
              <ActivityIndicator size="small" />
            ) : (
              <Switch
                value={isPinEnabled}
                onValueChange={handleTogglePinEnabled}
                trackColor={{ false: "#d1d5db", true: "#02929a" }}
                thumbColor="#ffffff"
              />
            )}
          </View>

          {/* Separator */}
          <Divider />

          {/* Set up / Reset PIN */}
          {hasPin ? (
            <NavRow
              icon={<KeyRound size={22} className="text-emerald-500" />}
              iconBg="bg-emerald-500/10"
              title="Reset PIN"
              subtitle="Change your existing security PIN"
              disabled={!isPinEnabled}
              onPress={() => router.push("/settings/change-pin" as any)}
            />
          ) : (
            <NavRow
              icon={<Lock size={22} className="text-emerald-500" />}
              iconBg="bg-emerald-500/10"
              title="Set up PIN"
              subtitle="Create a 4-digit security PIN"
              disabled={!isPinEnabled}
              onPress={() => router.push("/settings/setup-pin" as any)}
            />
          )}
        </View>

        {/* ── PIN Actions (only shown when pin exists) ── */}
        {hasPin && (
          <>
            <SectionLabel label="PIN Actions" />
            <View className="bg-card rounded-2xl border border-border px-4 mb-6">
              <NavRow
                icon={<ShieldCheck size={22} className="text-teal-500" />}
                iconBg="bg-teal-500/10"
                title="Verify PIN"
                subtitle="Confirm your current PIN is correct"
                disabled={!isPinEnabled}
                onPress={() => router.push("/settings/verify-pin" as any)}
              />
            </View>
          </>
        )}

        {/* ── Info note ── */}
        <Text className="text-xs text-muted-foreground text-center px-4">
          {isPinEnabled
            ? "PIN lock protects your account. You will be asked for your PIN when accessing sensitive areas."
            : "PIN lock is currently disabled. Enable it above to protect your account."}
        </Text>
      </View>
    </ScreenContainer>
  );
}
