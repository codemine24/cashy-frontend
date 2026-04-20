import { useUpdateProfile } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { InputError } from "@/components/ui/input-error";
import { useAuth } from "@/context/auth-context";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { ChevronLeft } from "@/lib/icons";
import { setUserInfo } from "@/utils/auth";
import { makeImageUrl } from "@/utils/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Camera, User } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const { t } = useTranslation();
  const user = authState.user;

  const [avatarUri, setAvatarUri] = useState<string>(
    makeImageUrl(user?.avatar, "user"),
  );
  const [pickedAsset, setPickedAsset] = useState<ImagePickerAsset | null>(null);
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();
  const isKeyboardVisible = useKeyboardVisible();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
    mode: "onBlur",
  });

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to change your avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
      setPickedAsset(result.assets[0]);
    }
  };

  const handleSave = (data: ProfileFormValues) => {
    const payload: Parameters<typeof updateProfile>[0] = {
      name: data.name,
    };

    if (pickedAsset) {
      const uri = pickedAsset.uri;
      const ext = uri.split(".").pop() ?? "jpg";
      payload.avatar = {
        uri,
        name: `avatar.${ext}`,
        type: pickedAsset.mimeType ?? `image/${ext}`,
      };
    }

    updateProfile(payload, {
      onSuccess: (data) => {
        if (!authState.user) return;
        setAuthState({
          ...authState,
          user: {
            ...authState.user,
            name: data.data.name,
            contact_number: data.data.contact_number,
            avatar: data.data.avatar,
          },
        });
        setUserInfo({
          ...authState.user,
          name: data.data.name,
          contact_number: data.data.contact_number,
          avatar: data.data.avatar,
        });
        Alert.alert("Saved", "Your profile has been updated.");
        router.push("/settings");
      },
      onError: () => {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      },
    });
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
          title: t("profile.title"),
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
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <KeyboardAvoidingView
          behavior="height"
          keyboardVerticalOffset={keyboardOffset}
          style={{ flex: 1 }}
        >
          <View
            style={{ flex: 1 }}
            className={`bg-background ${isKeyboardVisible ? "pb-0" : "pb-8"}`}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 24,
                paddingBottom: 40,
              }}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── Avatar ── */}
              <View className="items-center mb-8">
                <View className="relative">
                  <View className="w-24 h-24 rounded-full bg-surface border-2 border-border items-center justify-center overflow-hidden">
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        className="w-24 h-24 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <User size={44} />
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={handlePickAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-background"
                  >
                    <Camera size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-muted-foreground mt-3">
                  {t("profile.changeAvatar")}
                </Text>
              </View>

              {/* ── Fields ── */}
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                {t("profile.accountInfo")}
              </Text>
              <View className="bg-card rounded-2xl border border-border px-4 mb-6">
                {/* Name */}
                <View className="pt-4 border-b border-border">
                  <Text className="text-xs text-muted-foreground mb-1">
                    {t("profile.fullName")}
                  </Text>
                  <Controller
                    control={form.control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your name"
                        placeholderTextColor="#9CA3AF"
                        className="text-base text-foreground pb-3"
                      />
                    )}
                  />
                  <InputError error={form.formState.errors.name?.message} />
                </View>

                {/* Email (locked) */}
                <View className="py-4 border-b border-border">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xs text-muted-foreground">
                      {t("profile.email")}
                    </Text>
                    <View className="bg-primary border border-border rounded-full px-2 py-0.5">
                      <Text className="text-xs text-white">
                        {t("profile.locked")}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base text-foreground">
                    {user?.email ?? ""}
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-muted-foreground mb-6 px-1">
                {t("profile.emailLocked")}
              </Text>
            </ScrollView>
          </View>

          {/* ── Save button ── */}
          <View
            className="px-5 pt-3 pb-2 bg-background border-t border-border"
            style={{
              marginBottom: isKeyboardVisible ? 0 : Math.min(insets.bottom, 20),
            }}
          >
            <TouchableOpacity
              onPress={form.handleSubmit(handleSave)}
              disabled={isSaving}
              className={`rounded-2xl py-4 items-center justify-center ${
                isSaving ? "bg-primary/50" : "bg-primary"
              }`}
            >
              <Text
                className="text-white font-bold text-base"
                numberOfLines={1}
              >
                {isSaving ? t("profile.saving") : t("profile.saveChanges")}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </>
  );
}
