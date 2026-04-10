import Slide1 from "@/assets/images/onboarding-1.svg";
import { ComponentType } from "react";
import { SvgProps } from "react-native-svg";

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  image: ComponentType<SvgProps>;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Manage Expense",
    subtitle: "Create multiple wallet to track your expense separately. ",
    image: Slide1,
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
