import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import '../styles/global.css';
import { RootProvider } from "@/components/root-provider";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <RootProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
      </Stack>
    </RootProvider>
  );
}
