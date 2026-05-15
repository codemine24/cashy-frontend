import Purchases, { LOG_LEVEL, LogInResult } from "react-native-purchases";

let configured = false;

export function configureRevenueCat() {
  if (configured) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY!;

  Purchases.configure({ apiKey });
  configured = true;
}

export async function loginRevenueCat(userId: string) {
  if (!configured) configureRevenueCat();

  try {
    const logInResult: LogInResult = await Purchases.logIn(userId);

    if (logInResult.created) {
      console.log("New RevenueCat user created successfully!");
    } else {
      console.log("Logged into existing RevenueCat user successfully!");
    }

    console.log("Customer Info:", logInResult.customerInfo);

    return { success: true, ...logInResult };
  } catch (error) {
    console.error("Failed to log in to RevenueCat:", error);
    return { success: false, error };
  }
}

export async function logoutRevenueCat() {
  if (!configured) return;
  await Purchases.logOut();
}

export async function getRevenueCatOfferings() {
  if (!configured) configureRevenueCat();
  return await Purchases.getOfferings();
}
