import { ArrowLeft } from "@/lib/icons";
import { cn } from "@/utils/cn";
import { Href, useRouter } from "expo-router";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";

export interface BackButtonProps extends TouchableOpacityProps {
  containerClassName?: string;
  iconSize?: number;
  iconClassName?: string;
  path?: Href;
}

export function BackButton({
  className,
  containerClassName,
  iconSize = 20,
  iconClassName,
  path,
  onPress,
  ...props
}: BackButtonProps) {
  const router = useRouter();

  return (
    <View className={cn("px-6 mt-4", containerClassName)}>
      <TouchableOpacity
        onPress={(e) => {
          if (onPress) {
            onPress(e);
          } else if (path) {
            router.push(path);
          } else {
            router.back();
          }
        }}
        className={cn("h-10 w-10 items-center justify-center rounded-full bg-muted", className)}
        {...props}
      >
        <ArrowLeft size={iconSize} className={cn("text-foreground", iconClassName)} />
      </TouchableOpacity>
    </View>
  );
}