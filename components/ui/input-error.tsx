import { cn } from "@/utils/cn";
import { View } from "react-native";
import { Muted } from "./typography";

export interface InputErrorProps {
  error?: string;
  className?: string;
}

export function InputError({ error, className }: InputErrorProps) {
  if (!error) return null;

  return (
    <View className={cn("mt-2 ml-1", className)}>
      <Muted className="text-destructive text-sm leading-tight">{error}</Muted>
    </View>
  );
}
