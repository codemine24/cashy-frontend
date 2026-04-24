import { Crown, Info, X } from "@/lib/icons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function LearnMoreModal({
  showLearnMore,
  setShowLearnMore,
}: {
  showLearnMore: boolean;
  setShowLearnMore: (show: boolean) => void;
}) {
  return (
    <Modal
      visible={showLearnMore}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLearnMore(false)}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-card border-t border-border w-full rounded-t-[40px] p-8 pb-12 shadow-2xl max-h-[80%]">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-blue-500/10 rounded-full items-center justify-center">
                <Info size={22} className="text-blue-500" />
              </View>
              <Text className="text-2xl font-bold text-foreground">
                Purchase Info
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowLearnMore(false)}
              className="w-10 h-10 bg-muted/20 rounded-full items-center justify-center"
            >
              <X size={20} className="text-foreground" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="gap-y-8">
            <View>
              <Text className="text-lg font-bold text-foreground mb-2">
                Why can&apos;t I purchase twice?
              </Text>
              <Text className="text-base text-muted-foreground leading-relaxed">
                Google Play Store allows only one Lifetime purchase per Google
                account to prevent double charging. If you already bought it,
                Google will block a second purchase.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-bold text-foreground mb-2">
                What is Transfer?
              </Text>
              <Text className="text-base text-muted-foreground leading-relaxed">
                If you use multiple emails in Cashy but one Google account, you
                can move your premium access between them. Transferring
                activates premium for your current email and deactivates it for
                the previous one.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-bold text-foreground mb-2">
                Want an additional purchase?
              </Text>
              <Text className="text-base text-muted-foreground leading-relaxed">
                If you truly want to have two separate paid accounts (for
                example, personal and business), you must switch to a different
                Google account in your phone&apos;s Play Store settings before
                clicking buy.
              </Text>
            </View>

            <View className="bg-amber-500/5 mt-4 border border-amber-500/20 p-5 rounded-2xl flex-row gap-4 items-start">
              <Crown size={24} className="text-amber-500 mt-1" />
              <View className="flex-1">
                <Text className="text-amber-500 font-bold text-lg mb-1">
                  Lifetime Deal
                </Text>
                <Text className="text-amber-500/80 text-sm leading-snug">
                  Your premium is forever. We match your store account to ensure
                  you always have access.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
