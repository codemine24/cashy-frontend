import { useCreateWallet, useUpdateWallet } from "@/api/wallet";
import { ScreenContainer } from "@/components/screen-container";
import { WalletForm } from "@/components/wallet/wallet-form";
import { ChevronLeft } from "@/lib/icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

export default function WalletFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    walletId?: string;
    walletName?: string;
  }>();
  const createWalletMutation = useCreateWallet();
  const updateWalletMutation = useUpdateWallet();

  const isEdit = !!params.walletId;
  const isSubmitting =
    createWalletMutation.isPending || updateWalletMutation.isPending;

  const handleSubmit = async (name: string) => {
    try {
      if (isEdit && params.walletId) {
        await updateWalletMutation.mutateAsync({
          id: params.walletId,
          name,
        });
      } else {
        await createWalletMutation.mutateAsync(name);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Wallet ${isEdit ? "updated" : "created"} successfully`,
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    }
  };

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEdit ? "Rename Wallet" : "Add Wallet",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 4 }}>
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <WalletForm
        mode={isEdit ? "edit" : "create"}
        initialName={params.walletName ?? ""}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </ScreenContainer>
  );
}
