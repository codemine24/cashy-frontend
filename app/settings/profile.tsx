import { useUpdateProfile } from "@/api/user";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/context/auth-context";
import { setUserInfo } from "@/utils/auth";
import { makeImageUrl } from "@/utils/helper";
import type { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { Camera, User } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { authState, setAuthState } = useAuth();
  const user = authState.user;

  const [name, setName] = useState(user?.name ?? "");
  const [contactNumber, setContactNumber] = useState(
    user?.contact_number ?? "",
  );
  const email = user?.email ?? "";
  const [avatarUri, setAvatarUri] = useState<string>(makeImageUrl(user?.avatar, "user"));
  const [pickedAsset, setPickedAsset] = useState<ImagePickerAsset | null>(null);
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

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

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    const payload: Parameters<typeof updateProfile>[0] = {
      name,
      contact_number: contactNumber,
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
        })
        Alert.alert("Saved", "Your profile has been updated.");
      },
      onError: (error) => {
        console.error("Update profile error:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Your Profile" }} />
      <ScreenContainer edges={["bottom"]} className="bg-background">
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
                  <User size={44} /> // TODO: color={colors.muted}
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
              Tap the camera icon to change avatar
            </Text>
          </View>

          {/* ── Name (editable) ── */}
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
            Account Info
          </Text>
          <View className="bg-surface rounded-2xl border border-border px-4 mb-6">
            <View className="py-4 border-b border-border">
              <Text className="text-xs text-muted-foreground mb-1">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                // TODO: placeholderTextColor={colors.muted}
                className="text-base text-foreground"
              />
            </View>

            {/* ── Email (locked) ── */}
            <View className="py-4 border-b border-border">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-xs text-muted-foreground">Email</Text>
                <View className="bg-background border border-border rounded-full px-2 py-0.5">
                  <Text className="text-xs text-muted-foreground">locked</Text>
                </View>
              </View>
              <Text className="text-base text-muted-foreground">{email}</Text>
            </View>

            {/* ── Contact Number (editable) ── */}
            <View className="py-4">
              <Text className="text-xs text-muted-foreground mb-1">
                Contact Number
              </Text>
              <TextInput
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="Your contact number"
                // TODO: placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                className="text-base text-foreground"
              />
            </View>
          </View>

          <Text className="text-xs text-muted-foreground mb-6 px-1">
            Email cannot be changed after registration.
          </Text>

          {/* ── Save button ── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className={`rounded-2xl py-4 items-center justify-center ${isSaving ? "bg-primary/50" : "bg-primary"
              }`}
          >
            <Text className="text-white font-bold text-base">
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
