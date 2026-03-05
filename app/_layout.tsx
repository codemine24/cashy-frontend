import { RootNavigator } from "@/components/root-navigator";
import { ThemeProvider } from "@/context/theme-context";
import '@/styles/global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
