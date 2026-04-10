import { cn } from "@/utils/cn";
import { SafeAreaView } from "react-native-safe-area-context";
type Edge = "top" | "bottom" | "left" | "right";

interface ScreenWrapperProps {
  children: React.ReactNode;
  edges?: Edge[];
  className?: string;
}

export function ScreenWrapper({
  children,
  edges = ["top", "bottom"],
  className,
}: ScreenWrapperProps) {
  return (
    <SafeAreaView className={cn("flex-1", className)} edges={edges}>
      {children}
    </SafeAreaView>
  );
}
