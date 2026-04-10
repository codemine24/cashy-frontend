import { RootNavigator } from "@/components/root-navigator";
import { ThemeProvider } from "@/context/theme-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/i18n";
import '@/styles/global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
