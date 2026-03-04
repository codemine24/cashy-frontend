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
    image: require("../assets/images/onboarding-slide-1.png"),
  },
  {
    id: "2",
    title: "Track Every Transaction",
    subtitle: "Record cash-in and cash-out with ease daily",
    image: require("../assets/images/onboarding-slide-2.png"),
  },
  {
    id: "3",
    title: "Visual Reports & Insights",
    subtitle: "Understand your finances with clean charts",
    image: require("../assets/images/onboarding-slide-3.png"),
  },
  {
    id: "4",
    title: "Share With Your Team",
    subtitle: "Collaborate on wallets with family or staff",
    image: require("../assets/images/onboarding-slide-4.png"),
  },
];

export const languages = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "bn", label: "Bangla", nativeLabel: "বাংলা" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];
