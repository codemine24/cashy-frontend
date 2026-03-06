import { ScreenContainer } from "@/components/screen-container";
import { Stack } from "expo-router";
import { ScrollView, Text } from "react-native";

export default function Subscription() {
  return (
    <>
      <Stack.Screen options={{ title: "App Settings" }} />
      {/* edges={["bottom"]} — top is handled by the native header */}
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pt-6 pb-10"
        >


          <Text>Subscription</Text>
        </ScrollView>
      </ScreenContainer>
    </>
  )
}