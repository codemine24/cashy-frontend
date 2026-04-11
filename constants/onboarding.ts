import Slide1 from "@/assets/images/onboarding-1.svg";
import Slide2 from "@/assets/images/onboarding-2.svg";
import Slide3 from "@/assets/images/onboarding-3.svg";
import Slide4 from "@/assets/images/onboarding-4.svg";
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
    subtitle: "Create multiple wallet to track your expense. ",
    image: Slide1,
  },
  {
    id: "2",
    title: "Share Wallet",
    subtitle: "Share any wallet with other Cashy users.",
    image: Slide2,
  },
  {
    id: "3",
    title: "Track Loans",
    subtitle: "Money that you lent or borrowed will be in safe hand.",
    image: Slide3,
  },
  {
    id: "4",
    title: "Advance Analytics",
    subtitle: "Track your expense with advance analytics and report. ",
    image: Slide4,
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
