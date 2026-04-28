import { cn } from "@/utils/cn";
import React, { forwardRef } from "react";
import { Text, TextProps } from "react-native";

export interface TypographyProps extends TextProps {
  className?: string;
}

const H1 = forwardRef<Text, TypographyProps>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("text-3xl font-extrabold tracking-tight text-foreground", className)}
      {...props}
    />
  );
});
H1.displayName = "H1";

const H2 = forwardRef<Text, TypographyProps>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("text-2xl font-semibold text-foreground", className)}
      {...props}
    />
  );
});
H2.displayName = "H2";

const H3 = forwardRef<Text, TypographyProps>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("text-xl font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
});
H3.displayName = "H3";

const P = forwardRef<Text, TypographyProps>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("text-base text-foreground leading-6", className)}
      {...props}
    />
  );
});
P.displayName = "P";

const Muted = forwardRef<Text, TypographyProps>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("text-base text-muted-foreground leading-6", className)}
      {...props}
    />
  );
});
Muted.displayName = "Muted";

export const Span = forwardRef<Text, TypographyProps>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("inline text-foreground leading-6", className)}
      {...props}
    />
  );
});
Span.displayName = "Span";

export { H1, H2, H3, Muted, P };
