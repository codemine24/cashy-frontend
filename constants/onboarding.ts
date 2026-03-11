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
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export const currencies = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "BDT", symbol: "৳", label: "Bangladeshi Taka" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];
