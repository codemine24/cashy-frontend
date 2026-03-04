import { RootNavigator } from "@/components/root-navigator";
import { RootProvider } from "@/components/root-provider";
import '@/styles/global.css';

export default function RootLayout() {
  return (
    <RootProvider>
      <RootNavigator />
    </RootProvider>
  );
}
