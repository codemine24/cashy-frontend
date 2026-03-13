import { useTheme } from "@/context/theme-context";
import { cn } from "@/utils/cn";
import { Text, TextInput, View } from "react-native";

interface InputFieldProps {
  placeholder?: string;
  label?: string;
  keyboardType?: "email-address" | "numeric" | "default" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  textContentType?: "emailAddress" | "password" | "name" | "telephoneNumber" | "postalCode";
  autoComplete?: "email" | "password" | "name" | "tel" | "postal-code";
  className?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
}

export const InputField = ({
  placeholder,
  label,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  textContentType,
  autoComplete,
  className,
  value,
  onChangeText,
  onBlur
}: InputFieldProps) => {
  const { isDark } = useTheme()

  return (
    <View>
      {label && <Text className="text-foreground">{label}</Text>}
      <TextInput
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        textContentType={textContentType}
        autoComplete={autoComplete}
        placeholderTextColor={isDark ? "#fff" : "#000"}
        className={cn(`border rounded-xl p-4 text-foreground`, className)}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
      />
    </View>
  );
};