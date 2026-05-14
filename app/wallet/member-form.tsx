import { useShareWallet } from "@/api/wallet";
import { ScreenContainer } from "@/components/screen-container";
import {
  MemberForm,
  WalletMemberRole,
} from "@/components/wallet/member-form";
import { ChevronLeft } from "@/lib/icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

export default function MemberFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    walletId: string;
    memberId?: string;
    email?: string;
    role?: WalletMemberRole;
  }>();
  const shareWalletMutation = useShareWallet();

  const isEdit = !!params.memberId;

  const handleSubmit = async ({
    email,
    role,
  }: {
    email: string;
    role: WalletMemberRole;
  }) => {
    try {
      const response = await shareWalletMutation.mutateAsync({
        wallet_id: params.walletId,
        email,
        role,
      });

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: isEdit
            ? "Member updated successfully"
            : "Member added successfully",
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to save member",
      });
    }
  };

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEdit ? "Edit Member" : "Add Member",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 4 }}>
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <MemberForm
        mode={isEdit ? "edit" : "create"}
        initialEmail={params.email ?? ""}
        initialRole={params.role ?? "VIEWER"}
        isSubmitting={shareWalletMutation.isPending}
        onSubmit={handleSubmit}
      />
    </ScreenContainer>
  );
}
