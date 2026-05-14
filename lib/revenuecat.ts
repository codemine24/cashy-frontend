import Purchases, { LOG_LEVEL } from "react-native-purchases";

// TODO: replace with your RevenueCat Android API key (and iOS key when needed)
const REVENUECAT_ANDROID_API_KEY = "goog_rQMURicPvxtotROJXWqozuuCoCk";

let configured = false;

export function configureRevenueCat() {
  if (configured) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  const apiKey = REVENUECAT_ANDROID_API_KEY;

  Purchases.configure({ apiKey });
  configured = true;
}

export async function loginRevenueCat(userId: string) {
  if (!configured) configureRevenueCat();
  await Purchases.logIn(userId);
}

export async function logoutRevenueCat() {
  if (!configured) return;
  await Purchases.logOut();
}
