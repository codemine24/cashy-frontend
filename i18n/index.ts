import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import bn from "./locales/bn.json";
import en from "./locales/en.json";

const resources = {
  en: { translation: en },
  bn: { translation: bn },
};

// Get the device locale as fallback (e.g. "en-US" → "en")
const deviceLang = Localization.getLocales()?.[0]?.languageCode ?? "en";

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLang, // will be overridden by user preference once loaded
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
  },
  compatibilityJSON: "v4",
});

export default i18n;
