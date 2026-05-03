import { useWallets } from "@/api/wallet";
import ApplyButton from "@/components/ui/modal/apply-button";
import BottomSheetModalWrapper from "@/components/ui/modal/bottom-sheet-modal-wrapper";
import RadioButton from "@/components/ui/radio-button";
import { Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface WalletSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (walletId: string) => void;
  excludeWalletId?: string;
  selectedWalletId?: string;
}

export default function WalletSelectorModal({
  visible,
  onClose,
  onApply,
  excludeWalletId,
  selectedWalletId,
}: WalletSelectorModalProps) {
  const { data: wallets } = useWallets();
  const [tempSelectedWalletId, setTempSelectedWalletId] = useState<string>(
    selectedWalletId || "",
  );

  // Reset temp selection when modal opens
  useEffect(() => {
    if (visible) {
      setTempSelectedWalletId(selectedWalletId || "");
    }
  }, [visible, selectedWalletId]);

  console.log("wallets", wallets?.data);

  const filteredWallets =
    wallets?.data?.filter((wallet) => wallet.id !== excludeWalletId) || [];

  console.log("filteredWallets", filteredWallets.length);

  const handleApply = () => {
    if (tempSelectedWalletId) {
      onApply(tempSelectedWalletId);
    }
  };

  return (
    <BottomSheetModalWrapper
      visible={visible}
      title="Select Destination Wallet"
      onClose={onClose}
      footer={
        <ApplyButton
          onApply={handleApply}
          applyDisabled={!tempSelectedWalletId}
          title="Select"
        />
      }
    >
      <View className="flex-col">
        {filteredWallets.length > 0 ? (
          <FlatList
            data={filteredWallets}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setTempSelectedWalletId(item.id)}
                activeOpacity={0.7}
                className="flex-row items-center space-y-20 gap-3 border border-border p-2"
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    tempSelectedWalletId === item.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {tempSelectedWalletId === item.id && (
                    <Check size={12} color="#ffffff" />
                  )}
                </View>
                <View>
                  <Text className="text-[15px] text-foreground flex-1">
                    {item.name}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    Balance: {item.balance}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-2" />}
          />
        ) : (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-muted-foreground text-center">
              No wallets available
            </Text>
          </View>
        )}
      </View>
    </BottomSheetModalWrapper>
  );
}
