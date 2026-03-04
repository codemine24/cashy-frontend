import { vars } from "nativewind";

/**
 * Design tokens defined as CSS variables.
 * Each theme defines light and dark variants.
 *
 * Usage in className:  `bg-primary`, `text-foreground`, etc.
 * All colours resolve through CSS vars so switching themes is instant.
 */

// ─── Default (Brand) theme ──────────────────────────────────────────
const defaultLight = vars({
  "--color-primary": "#FF5757",
  "--color-primary-foreground": "#ffffff",
  "--color-secondary": "#FF8C42",
  "--color-secondary-foreground": "#ffffff",
  "--color-accent": "#FFD700",
  "--color-accent-foreground": "#111827",

  "--color-background": "#f8fafc",
  "--color-foreground": "#111827",

  "--color-card": "#ffffff",
  "--color-card-foreground": "#111827",

  "--color-muted": "#f1f5f9",
  "--color-muted-foreground": "#64748b",

  "--color-border": "#e2e8f0",
  "--color-input": "#e2e8f0",
  "--color-ring": "#FF5757",

  "--color-destructive": "#ef4444",
  "--color-destructive-foreground": "#ffffff",

  "--color-success": "#22c55e",
  "--color-success-foreground": "#ffffff",
});

const defaultDark = vars({
  "--color-primary": "#FF6B6B",
  "--color-primary-foreground": "#ffffff",
  "--color-secondary": "#FFA36E",
  "--color-secondary-foreground": "#ffffff",
  "--color-accent": "#FFE04A",
  "--color-accent-foreground": "#111827",

  "--color-background": "#0f172a",
  "--color-foreground": "#f8fafc",

  "--color-card": "#1e293b",
  "--color-card-foreground": "#f8fafc",

  "--color-muted": "#1e293b",
  "--color-muted-foreground": "#94a3b8",

  "--color-border": "#334155",
  "--color-input": "#334155",
  "--color-ring": "#FF6B6B",

  "--color-destructive": "#f87171",
  "--color-destructive-foreground": "#ffffff",

  "--color-success": "#4ade80",
  "--color-success-foreground": "#111827",
});

// ─── Theme registry ─────────────────────────────────────────────────
export const themes = {
  default: {
    light: defaultLight,
    dark: defaultDark,
  },
  // Add more themes here, e.g.:
  // ocean: { light: oceanLight, dark: oceanDark },
} as const;

export type ThemeName = keyof typeof themes;
