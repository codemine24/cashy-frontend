import { ScreenContainer } from "@/components/screen-container";
import { ChevronLeft } from "@/lib/icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutUsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate("/settings/about");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router]),
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "About Us",
          headerBackTitle: "Back",
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate("/settings/about")}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScreenContainer edges={["left", "right"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
          }}
        >
          {/* About Content */}
          <View className="bg-card rounded-2xl border border-border p-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              About Cashy
            </Text>
            <Text className="text-foreground text-sm leading-relaxed mb-4">
              Cashy is a modern expense management application designed to help
              you track your daily expenses, manage your budgets, and gain
              better control over your financial life.
            </Text>
            <Text className="text-foreground text-sm leading-relaxed mb-4">
              Our mission is to simplify expense tracking and provide you with
              powerful insights into your spending habits, helping you make
              informed financial decisions.
            </Text>
            <Text className="text-foreground text-sm leading-relaxed">
              Whether you&apos;re managing personal expenses, tracking business
              costs, or just trying to save money, Cashy provides the tools you
              need to stay on top of your finances.
            </Text>
          </View>

          {/* Key Features */}
          <View className="bg-card rounded-2xl border border-border p-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Key Features
            </Text>
            <View className="space-y-3">
              <Text className="text-foreground text-sm leading-relaxed">
                • Easy expense tracking and categorization
              </Text>
              <Text className="text-foreground text-sm leading-relaxed">
                • Multiple wallet support for different accounts
              </Text>
              <Text className="text-foreground text-sm leading-relaxed">
                • Detailed transaction history and reports
              </Text>
              <Text className="text-foreground text-sm leading-relaxed">
                • Budget management and financial insights
              </Text>
              <Text className="text-foreground text-sm leading-relaxed">
                • Secure data storage and privacy protection
              </Text>
            </View>
          </View>

          {/* Developer Info */}
          <View className="bg-card rounded-2xl border border-border p-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Developer
            </Text>
            <Text className="text-foreground text-sm leading-relaxed mb-2">
              Cashy is developed and maintained by Fazly.
            </Text>
            <Text className="text-foreground text-sm leading-relaxed">
              We&apos;re committed to providing you with the best expense
              management experience and continuously improving the app based on
              your feedback.
            </Text>
          </View>

          {/* Footer */}
          <View
            className="mt-8 items-center"
            style={{ marginBottom: Math.min(insets.bottom, 20) }}
          >
            <Text className="text-muted-foreground text-sm">
              © 2026 Cashy: Expense Manager
            </Text>
            <Text className="text-muted-foreground text-xs mt-1">
              Made with ❤️ for better financial management
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
