import { RotateCcw } from "@/lib/icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function TransferModal({
  transferInfo,
  setTransferInfo,
  handleCreateSubscription,
  setIsProcessing,
}: {
  transferInfo: {
    email: string;
    token: string;
    productId: string;
    price: string;
  } | null;
  setTransferInfo: (transferInfo: any) => void;
  handleCreateSubscription: (params: any) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}) {
  return (
    <Modal
      visible={!!transferInfo}
      transparent
      animationType="fade"
      onRequestClose={() => setTransferInfo(null)}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-card border border-border w-full rounded-3xl p-6 shadow-2xl">
          <View className="w-16 h-16 bg-amber-500/10 rounded-full items-center justify-center mb-6 self-center">
            <RotateCcw size={32} className="text-amber-500" />
          </View>

          <Text className="text-2xl font-bold text-foreground text-center mb-4">
            Transfer Purchase
          </Text>

          <Text className="text-base text-muted-foreground text-center mb-6 leading-relaxed">
            We found a Lifetime Purchase linked to another account:{"\n"}
            <Text className="font-bold text-foreground">
              {transferInfo?.email}
            </Text>
            {"\n\n"}
            Would you like to transfer it to this account? It will be removed
            from the original account.
          </Text>

          <View className="gap-y-3">
            <TouchableOpacity
              onPress={() => {
                if (transferInfo) {
                  setIsProcessing(true);
                  handleCreateSubscription({
                    productId: transferInfo.productId,
                    purchaseToken: transferInfo.token,
                    price: transferInfo.price,
                    transfer: true,
                  });
                }
              }}
              className="bg-amber-500 py-4 rounded-xl items-center justify-center shadow-lg"
            >
              <Text className="text-white font-bold text-lg">
                Transfer to this account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTransferInfo(null)}
              className="py-4 rounded-xl items-center justify-center"
            >
              <Text className="text-muted-foreground font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
