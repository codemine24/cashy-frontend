import { ScreenContainer } from "@/components/screen-container";
import { ChevronLeft, Mail, User } from "@/lib/icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  BackHandler,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContactUsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEmailPress = () => {
    Linking.openURL("mailto:codemine24@gmail.com");
  };

  const handleSubjectPress = (subject: string) => {
    Linking.openURL(
      `mailto:codemine24@gmail.com?subject=${encodeURIComponent(subject)}`,
    );
  };

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
          title: "Contact Us",
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
          {/* Contact Options */}
          <View className="bg-card rounded-2xl border border-border p-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              How to Reach Us
            </Text>

            {/* Email */}
            <TouchableOpacity
              onPress={handleEmailPress}
              className="flex-row items-center p-4 bg-muted/50 rounded-xl mb-3"
            >
              <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-4">
                <Mail size={20} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">Email</Text>
                <Text className="text-muted-foreground text-sm">
                  codemine24@gmail.com
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Contact Topics */}
          <View className="bg-card rounded-2xl border border-border p-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Quick Contact Topics
            </Text>

            <TouchableOpacity
              onPress={() => handleSubjectPress("Bug Report - Cashy App")}
              className="flex-row items-center p-4 bg-muted/50 rounded-xl mb-3"
            >
              <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-4">
                <Text className="text-red-600 font-bold">🐛</Text>
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  Report a Bug
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Found an issue? Let us know
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSubjectPress("Feature Request - Cashy App")}
              className="flex-row items-center p-4 bg-muted/50 rounded-xl mb-3"
            >
              <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold">💡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  Feature Request
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Suggest new features
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSubjectPress("General Inquiry - Cashy App")}
              className="flex-row items-center p-4 bg-muted/50 rounded-xl mb-3"
            >
              <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mr-4">
                <Text className="text-green-600 font-bold">💬</Text>
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  General Inquiry
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Other questions or feedback
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Response Time */}
          <View className="bg-card rounded-2xl border border-border p-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Response Time
            </Text>
            <Text className="text-foreground text-sm leading-relaxed mb-3">
              We typically respond to emails within 24-48 hours during business
              days. For urgent technical issues, please include detailed
              information about your device and the problem you&apos;re
              experiencing.
            </Text>
            <Text className="text-foreground text-sm leading-relaxed">
              We appreciate you taking the time to reach out!
            </Text>
          </View>

          {/* Developer Info */}
          <View className="bg-card rounded-2xl border border-border p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center mr-3">
                <User size={20} className="text-primary" />
              </View>
              <Text className="text-lg font-semibold text-foreground">
                Developer
              </Text>
            </View>
            <Text className="text-foreground text-sm leading-relaxed">
              Cashy is developed by Codemine with passion for creating useful
              financial tools that make everyday life easier.
            </Text>
          </View>

          {/* Footer */}
          <View
            className="mt-8 items-center"
            style={{ marginBottom: Math.min(insets.bottom, 20) }}
          >
            <Text className="text-muted-foreground text-sm text-center">
              Thank you using Cashy! 🎉
            </Text>
            <Text className="text-muted-foreground text-xs mt-1 text-center">
              We look forward to hearing from you
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
