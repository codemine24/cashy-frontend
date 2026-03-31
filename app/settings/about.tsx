import { ScreenContainer } from "@/components/screen-container";
import { ChevronRight, FileText, ShieldCheck, Users } from "@/lib/icons";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// ─── Reusable row component ───────────────────────────────────────────────
function AboutRow({
  icon,
  iconBgClass,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
    >
      {/* Icon bubble */}
      <View
        className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${iconBgClass}`}
      >
        {icon}
      </View>

      {/* Text */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Arrow */}
      <ChevronRight size={18} className="text-muted-foreground" />
    </TouchableOpacity>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────
function Divider() {
  return <View className="h-px bg-border ml-16" />;
}

// ─── Main screen ─────────────────────────────────────────────────────────
export default function AboutScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePrivacyPolicy = () => {
    // Show privacy policy in a modal or navigate to a dedicated screen
    router.push("/settings/privacy-policy" as any);
  };

  const handleTermsAndConditions = () => {
    router.push("/settings/terms-and-conditions" as any);
  };

  const handleAboutUs = () => {
    router.push("/settings/about-us" as any);
  };

  const handleContactUs = () => {
    router.push("/settings/contact-us" as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("about.title"),
          headerBackTitle: t("common.back"),
          headerShadowVisible: true,
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
          {/* ── About options group ── */}
          <View className="bg-card rounded-2xl border border-border px-4 my-6">
            <AboutRow
              iconBgClass="bg-blue-500/10"
              icon={<ShieldCheck size={22} className="text-blue-500" />}
              title={t("about.privacyPolicy")}
              subtitle={t("about.privacyPolicySubtitle")}
              onPress={handlePrivacyPolicy}
            />
            <Divider />
            <AboutRow
              iconBgClass="bg-green-500/10"
              icon={<FileText size={22} className="text-green-500" />}
              title={t("about.termsAndConditions")}
              subtitle={t("about.termsAndConditionsSubtitle")}
              onPress={handleTermsAndConditions}
            />
            <Divider />
            <AboutRow
              iconBgClass="bg-purple-500/10"
              icon={<Users size={22} className="text-purple-500" />}
              title={t("about.aboutUs")}
              subtitle={t("about.aboutUsSubtitle")}
              onPress={handleAboutUs}
            />
            <Divider />
            <AboutRow
              iconBgClass="bg-orange-500/10"
              icon={<FileText size={22} className="text-orange-500" />}
              title={t("about.contactUs")}
              subtitle={t("about.contactUsSubtitle")}
              onPress={handleContactUs}
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
