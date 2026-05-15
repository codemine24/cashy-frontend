import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import OnboardingOne from "../assets/images/1.svg";
import OnboardingTwo from "../assets/images/2.svg";
import OnboardingThree from "../assets/images/3.svg";
import OnboardingFour from "../assets/images/4.svg";

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
    image: OnboardingOne,
  },
  {
    id: "2",
    title: "Share Wallet",
    subtitle: "Share any wallet with other Cashy users.",
    image: OnboardingTwo,
  },
  {
    id: "3",
    title: "Track Loans",
    subtitle: "Money that you lent or borrowed will be in safe hand.",
    image: OnboardingThree,
  },
  {
    id: "4",
    title: "Advance Analytics",
    subtitle: "Track your expense with advance analytics and report. ",
    image: OnboardingFour,
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
