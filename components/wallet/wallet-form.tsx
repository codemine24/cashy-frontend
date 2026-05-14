import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { Wallet } from "@/lib/icons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WalletFormProps = {
  mode: "create" | "edit";
  initialName?: string;
  isSubmitting?: boolean;
  onSubmit: (name: string) => Promise<void> | void;
};

export function WalletForm({
  mode,
  initialName = "",
  isSubmitting = false,
  onSubmit,
}: WalletFormProps) {
  const inputRef = useRef<TextInput>(null);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();
  const isKeyboardVisible = useKeyboardVisible();

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Wallet name is required");
      return;
    }

    if (trimmedName.length > 60) {
      setError("Wallet name must be at most 60 characters");
      return;
    }

    setError("");
    await onSubmit(trimmedName);
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
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
              <Wallet size={32} className="text-primary" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              {mode === "edit" ? "Rename Wallet" : "Add Wallet"}
            </Text>
            <Text className="text-sm text-muted-foreground text-center mt-2 px-4">
              {mode === "edit"
                ? "Update the wallet name shown across your records."
                : "Create a wallet to group transactions, members, and reports."}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Wallet name
            </Text>
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (error) setError("");
              }}
              placeholder="e.g., January Expenses"
              placeholderTextColor="#94a3b8"
              editable={!isSubmitting}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              className={`rounded-xl px-4 py-4 border bg-card text-foreground text-base ${
                error ? "border-destructive" : "border-border"
              }`}
            />
            <InputError error={error} />
          </View>
        </ScrollView>
      </View>

      <View
        className="px-5 pt-3 pb-2 bg-background border-t border-border"
        style={{
          marginBottom: isKeyboardVisible ? 0 : Math.min(insets.bottom, 20),
        }}
      >
        <Button disabled={isSubmitting} onPress={handleSubmit}>
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save Changes"
              : "Create Wallet"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
