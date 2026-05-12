import { useWallets } from "@/api/wallet";
import ApplyButton from "@/components/ui/modal/apply-button";
import BottomSheetModalWrapper from "@/components/ui/modal/bottom-sheet-modal-wrapper";
import { useAuth } from "@/context/auth-context";
import { Wallet } from "@/interface/wallet";
import { isWalletViewer } from "@/utils/is-owner";
import { Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface WalletSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (wallet: Wallet) => void;
  excludeWalletId?: string;
}

export default function WalletSelectorModal({
  visible,
  onClose,
  onApply,
  excludeWalletId,
}: WalletSelectorModalProps) {
  const { authState } = useAuth();
  const { data: wallets } = useWallets();
  const [tempSelectedWallet, setTempSelectedWallet] = useState<Wallet | null>(
    null,
  );

  // Reset temp selection when modal opens
  useEffect(() => {
    if (visible) {
      setTempSelectedWallet(null);
    }
  }, [visible]);

  const filteredWallets =
    wallets?.data?.filter((wallet) => wallet.id !== excludeWalletId) || [];

  const handleApply = () => {
    if (tempSelectedWallet) {
      onApply(tempSelectedWallet);
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
          applyDisabled={!tempSelectedWallet}
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
                onPress={() => setTempSelectedWallet(item)}
                activeOpacity={0.7}
                disabled={isWalletViewer(authState?.user?.id, item)}
                className="flex-row items-center space-y-20 gap-3 border border-border p-2 disabled:opacity-40"
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${tempSelectedWallet?.id === item.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                    }`}
                >
                  {tempSelectedWallet?.id === item.id && (
                    <Check size={12} color="#ffffff" />
                  )}
                </View>
                <View>
                  <Text className="text-[15px] text-foreground flex-1">
                    {item.name} {isWalletViewer(authState?.user?.id, item) && "(Viewer)"}
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
          <Text className="text-muted-foreground text-center py-8">
            No wallets available
          </Text>
        )}
      </View>
    </BottomSheetModalWrapper>
  );
}
