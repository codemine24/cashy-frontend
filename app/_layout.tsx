import { RootNavigator } from "@/components/root-navigator";
import { ThemeProvider } from "@/context/theme-context";
import { AppUpdateProvider } from "@/context/update-context";
import "@/i18n";
import "@/styles/global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppUpdateProvider>
          <RootNavigator />
        </AppUpdateProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
