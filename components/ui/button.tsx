import { cn } from "@/utils/cn";
import React, { forwardRef } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  textClassName?: string;
}

const Button = forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  (
    {
      className,
      textClassName,
      variant = "default",
      size = "default",
      children,
      disabled,
      activeOpacity = 0.85,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseButtonClasses = "items-center justify-center rounded-xl flex-row";
    const baseTextClasses = "text-center font-medium";

    // Variant styles
    const variantButtonClasses = {
      default: "bg-primary",
      secondary: "bg-secondary",
      outline: "border border-input bg-background",
      ghost: "bg-transparent",
      destructive: "bg-destructive",
    };

    const variantTextClasses = {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
    };

    // Size styles
    const sizeButtonClasses = {
      default: "py-5 px-4",
      sm: "py-3 px-3",
      lg: "py-6 px-8",
      icon: "p-3",
    };

    const sizeTextClasses = {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "",
    };

    return (
      <TouchableOpacity
        ref={ref}
        activeOpacity={activeOpacity}
        disabled={disabled}
        className={cn(
          baseButtonClasses,
          variantButtonClasses[variant],
          sizeButtonClasses[size],
          disabled && "opacity-50",
          className
        )}
        {...props}
      >
        {typeof children === "string" ? (
          <Text
            className={cn(
              baseTextClasses,
              variantTextClasses[variant],
              sizeTextClasses[size],
              textClassName
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";

export { Button };
