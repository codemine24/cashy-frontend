import { ImageSourcePropType } from "react-native";

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Manage Expense",
    subtitle: "Create multiple wallet to track your expense separately. ",
    image: require("../assets/images/onboarding-1.svg"),
  },
];

export type LanguageCode = "en" | "bn";

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export const languages: Language[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "bn", label: "Bangla", nativeLabel: "বাংলা" },
];
