import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { Mail, ShieldCheck, UserPlus } from "@/lib/icons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type WalletMemberRole = "VIEWER" | "EDITOR" | "ADMIN";

type MemberFormProps = {
  mode: "create" | "edit";
  initialEmail?: string;
  initialRole?: WalletMemberRole;
  isSubmitting?: boolean;
  onSubmit: (payload: {
    email: string;
    role: WalletMemberRole;
  }) => Promise<void> | void;
};

const ROLE_OPTIONS: {
  value: WalletMemberRole;
  label: string;
  summary: string;
  permissions: string[];
}[] = [
  {
    value: "VIEWER",
    label: "Viewer",
    summary: "Read-only access",
    permissions: [
      "View all transactions",
      "View balance and summary",
      "Cannot add or edit transactions",
      "Cannot manage members",
    ],
  },
  {
    value: "EDITOR",
    label: "Editor",
    summary: "Can work with entries",
    permissions: [
      "View all transactions",
      "Add and edit transactions",
      "Delete own transactions",
      "Cannot manage members",
    ],
  },
  {
    value: "ADMIN",
    label: "Admin",
    summary: "Can manage the wallet",
    permissions: [
      "View all transactions",
      "Add and edit transactions",
      "Delete any transaction",
      "Manage and invite members",
    ],
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MemberForm({
  mode,
  initialEmail = "",
  initialRole = "VIEWER",
  isSubmitting = false,
  onSubmit,
}: MemberFormProps) {
  const inputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState<WalletMemberRole>(initialRole);
  const [emailError, setEmailError] = useState("");
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();
  const isKeyboardVisible = useKeyboardVisible();

  useEffect(() => {
    setEmail(initialEmail);
    setRole(initialRole);
  }, [initialEmail, initialRole]);

  useEffect(() => {
    if (mode === "create") {
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email address is required");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    await onSubmit({ email: trimmedEmail, role });
  };

  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={keyboardOffset}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 112,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Email
            </Text>
            <View
              className={`flex-row items-center rounded-xl border px-4 bg-card ${
                emailError ? "border-destructive" : "border-border"
              } ${mode === "edit" ? "opacity-70" : ""}`}
            >
              <Mail size={18} className="text-muted-foreground" />
              <TextInput
                ref={inputRef}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (emailError) setEmailError("");
                }}
                placeholder="member@example.com"
                placeholderTextColor="#94a3b8"
                editable={mode === "create" && !isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                className="flex-1 py-4 ml-3 text-base text-foreground"
              />
            </View>
            <InputError error={emailError} />
          </View>

          <Text className="text-sm font-semibold text-foreground mt-6 mb-3">
            Role
          </Text>
          <View className="flex-row items-center gap-2">
            {ROLE_OPTIONS.map((option) => {
              const isActive = option.value === role;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setRole(option.value)}
                  activeOpacity={0.75}
                  disabled={isSubmitting}
                  className={`flex-1 rounded-xl border py-3.5 px-2 items-center ${
                    isActive
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                  {/* <Text
                  className="text-xs text-muted-foreground mt-0.5 text-center"
                  numberOfLines={1}
                >
                  {option.summary}
                </Text> */}
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="rounded-xl bg-muted border border-border p-4 mt-5">
            <Text className="text-xs font-bold text-muted-foreground uppercase mb-3">
              {selectedRole?.label} can
            </Text>
            <View className="flex-col gap-2">
              {(role === "VIEWER"
                ? [
                    { icon: "✅", label: "View all transactions" },
                    { icon: "✅", label: "View balance & summary" },
                    { icon: "❌", label: "Add or edit transactions" },
                    { icon: "❌", label: "Manage members" },
                  ]
                : role === "EDITOR"
                  ? [
                      { icon: "✅", label: "View all transactions" },
                      { icon: "✅", label: "Add & edit transactions" },
                      { icon: "✅", label: "Delete own transactions" },
                      { icon: "❌", label: "Manage members" },
                    ]
                  : [
                      { icon: "✅", label: "View all transactions" },
                      { icon: "✅", label: "Add & edit transactions" },
                      { icon: "✅", label: "Delete any transactions" },
                      { icon: "✅", label: "Manage & invite members" },
                    ]
              ).map((item, i) => (
                <View key={i} className="flex-row items-center">
                  <Text className="text-sm mr-2">{item.icon}</Text>
                  <Text className="text-sm text-foreground">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <View
        className="px-5 pt-3 pb-2 bg-background border-t border-border"
        style={{
          marginBottom: isKeyboardVisible ? 0 : Math.min(insets.bottom, 20),
        }}
      >
        <Button
          disabled={isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting
            ? mode === "edit"
              ? "SAVING..."
              : "ADDING..."
            : mode === "edit"
              ? "SAVE ROLE"
              : "ADD MEMBER"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
