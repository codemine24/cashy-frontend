import { vars } from "nativewind";

/**
 * Design tokens defined as CSS variables.
 * Each theme defines light and dark variants.
 *
 * ⚠️  All colour values MUST be space-separated RGB channels (e.g. "255 87 87")
 *     so that Tailwind's opacity modifier (bg-primary/10, text-foreground/50, …)
 *     works correctly via  rgb(var(--color-*) / <alpha-value>)
 *
 * Usage in className:  `bg-primary`, `bg-primary/10`, `text-foreground/80`, etc.
 */

// ─── Default (Brand) theme ──────────────────────────────────────────
const defaultLight = vars({
  "--color-primary": "255 87 87",
  "--color-primary-foreground": "255 255 255",
  "--color-secondary": "255 140 66",
  "--color-secondary-foreground": "255 255 255",
  "--color-accent": "255 215 0",
  "--color-accent-foreground": "17 24 39",

  "--color-background": "248 250 252",
  "--color-foreground": "17 24 39",

  "--color-card": "255 255 255",
  "--color-card-foreground": "17 24 39",

  "--color-muted": "241 245 249",
  "--color-muted-foreground": "100 116 139",

  "--color-border": "226 232 240",
  "--color-input": "226 232 240",
  "--color-ring": "255 87 87",

  "--color-destructive": "239 68 68",
  "--color-destructive-foreground": "255 255 255",

  "--color-success": "34 197 94",
  "--color-success-foreground": "255 255 255",
});

const defaultDark = vars({
  "--color-primary": "255 107 107",
  "--color-primary-foreground": "255 255 255",
  "--color-secondary": "255 163 110",
  "--color-secondary-foreground": "255 255 255",
  "--color-accent": "255 224 74",
  "--color-accent-foreground": "17 24 39",

  "--color-background": "15 23 42",
  "--color-foreground": "248 250 252",

  "--color-card": "30 41 59",
  "--color-card-foreground": "248 250 252",

  "--color-muted": "30 41 59",
  "--color-muted-foreground": "148 163 184",

  "--color-border": "51 65 85",
  "--color-input": "51 65 85",
  "--color-ring": "255 107 107",

  "--color-destructive": "248 113 113",
  "--color-destructive-foreground": "255 255 255",

  "--color-success": "74 222 128",
  "--color-success-foreground": "17 24 39",
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
