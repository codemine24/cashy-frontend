import { useDeleteUser } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/auth-context";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  Trash2,
  Users,
} from "@/lib/icons";
import { clearUserInfo, removeAccessToken } from "@/utils/auth";
import { CommonActions } from "@react-navigation/native";
import { Stack, useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

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
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { setAuthState } = useAuth();
  const deleteAccountMutation = useDeleteUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteAccountConfirm = async () => {
    const result = await deleteAccountMutation.mutateAsync();
    if (result?.success) {
      await removeAccessToken();
      await clearUserInfo();
      setAuthState({ isAuthenticated: false, user: null });
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "auth" }] }),
      );
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete account",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate("/settings");
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
          title: t("about.title"),
          headerBackTitle: t("common.back"),
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate("/settings")}
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

          {/* ── Account Deletion Section ── */}
          <View className="bg-card rounded-2xl border border-border px-4 mb-6">
            <TouchableOpacity
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
              className="flex-row items-center py-4"
            >
              {/* Icon bubble */}
              <View className="w-11 h-11 rounded-xl items-center justify-center mr-4 bg-red-500/10">
                <Trash2 size={22} className="text-red-500" />
              </View>

              {/* Text */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {t("about.deleteAccount")}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {t("about.deleteAccountSubtitle")}
                </Text>
              </View>

              {/* Arrow */}
              <ChevronRight size={18} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteAccountMutation.isPending}
      />
    </>
  );
}
