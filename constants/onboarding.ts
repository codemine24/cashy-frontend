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
    title: "Set-Up Multiple Businesses",
    subtitle: "Keep multiple business records on one app",
    image: require("../assets/images/onboarding.png"),
  },
  {
    id: "2",
    title: "Track Every Transaction",
    subtitle: "Record cash-in and cash-out with ease daily",
    image: require("../assets/images/onboarding.png"),
  },
  {
    id: "3",
    title: "Visual Reports & Insights",
    subtitle: "Understand your finances with clean charts",
    image: require("../assets/images/onboarding.png"),
  },
  {
    id: "4",
    title: "Share With Your Team",
    subtitle: "Collaborate on wallets with family or staff",
    image: require("../assets/images/onboarding.png"),
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
