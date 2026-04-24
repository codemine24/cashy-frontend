import { useCreateSubscription } from "@/api/subscription";
import { ScreenContainer } from "@/components/screen-container";
import { ComparisonTable } from "@/components/subscription/comparison-table";
import { FAQSection } from "@/components/subscription/faq-section";
import LearnMoreModal from "@/components/subscription/learn-more-modal";
import SuccessScreen from "@/components/subscription/success-screen";
import TransferModal from "@/components/subscription/transfer-modal";
import { useAuth } from "@/context/auth-context";
import { ChevronLeft } from "@/lib/icons";
import * as Crypto from "expo-crypto";
import { useIAP } from "expo-iap";
import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const productIds = ["cashy_lifetime"];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "lifetime">(
    "lifetime",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transferInfo, setTransferInfo] = useState<{
    email: string;
    token: string;
    productId: string;
    price: string;
  } | null>(null);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const insets = useSafeAreaInsets();
  const { mutateAsync: createSubscription } = useCreateSubscription();
  const { authState } = useAuth();
  const userEmail = authState.user?.email;

  const handleCreateSubscription = async (
    params: {
      productId: string;
      purchaseToken: string;
      price: string;
      transfer?: boolean;
    },
    purchase?: any,
  ) => {
    try {
      await createSubscription({
        plan: "LIFETIME",
        price: params.price,
        product_id: params.productId,
        package_name: "com.codemine.cashy",
        purchase_token: params.purchaseToken,
        transfer: params.transfer,
      });

      if (purchase) {
        await finishTransaction({
          purchase,
          isConsumable: false,
        });
      }

      setTransferInfo(null);
      setIsProcessing(false);
      setShowSuccess(true);
    } catch (error: any) {
      if (error?.message?.startsWith("ALREADY_LINKED|")) {
        const linkedEmail = error.message.split("|")[1];
        setTransferInfo({
          email: linkedEmail,
          token: params.purchaseToken,
          productId: params.productId,
          price: params.price,
        });
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        Alert.alert(
          "Verification failed",
          error?.message || "Please contact support",
        );
      }
    }
  };

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
    availablePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        const product = products.find((p) => p.id === purchase.productId);

        if (!product) {
          Alert.alert("Product not found", "Please contact support");
          return;
        }

        const discountOffer = (product as any)?.discountOffers?.find(
          (i: any) => i.id === "opening-discount",
        );

        let originalPrice = product.displayPrice;
        let discountPrice = discountOffer?.displayPrice;
        const finalPrice = discountPrice || originalPrice;

        if (!purchase.purchaseToken) {
          Alert.alert("Error", "Invalid purchase token");
          return;
        }

        await handleCreateSubscription(
          {
            productId: purchase.productId,
            purchaseToken: purchase.purchaseToken,
            price: finalPrice,
          },
          purchase,
        );
      } catch (error: any) {
        setIsProcessing(false);
        Alert.alert("Error", error?.message || "Something went wrong");
      }
    },
    onPurchaseError: (error) => {
      setIsProcessing(false);
      Alert.alert("Purchase failed", error.message || "Something went wrong");
    },
  });

  const handleBuy = async () => {
    try {
      if (!userEmail) {
        Alert.alert("Not signed in", "Please sign in to continue.");
        return;
      }

      setIsProcessing(true);

      const accountHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        userEmail.trim().toLowerCase(),
      );

      const product = products.find((p) => p.id === "cashy_lifetime");
      const discountOffer = (product as any)?.discountOffers?.find(
        (i: any) => i.id === "opening-discount",
      );
      const offerToken = discountOffer?.offerTokenAndroid;

      const owned = (availablePurchases || []).find(
        (p) => p.productId === "cashy_lifetime",
      );

      if (owned) {
        const originalPrice = product?.displayPrice ?? "";
        const discountPrice = discountOffer?.displayPrice;
        const finalPrice = discountPrice || originalPrice;

        if (!owned.purchaseToken) {
          Alert.alert("Error", "Invalid purchase token");
          return;
        }

        await handleCreateSubscription(
          {
            productId: owned.productId,
            purchaseToken: owned.purchaseToken,
            price: finalPrice,
          },
          owned,
        );
        return;
      }

      await requestPurchase({
        request: {
          google: {
            skus: ["cashy_lifetime"],
            obfuscatedAccountId: accountHash,
            offerToken,
          },
        },
        type: "in-app",
      });
    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert(
        "Purchase failed",
        error?.message || "Unable to start purchase",
      );
    }
  };

  useEffect(() => {
    if (connected) {
      fetchProducts({
        skus: productIds,
        type: "in-app",
      });
      getAvailablePurchases();
    }
  }, [connected, fetchProducts, getAvailablePurchases]);

  // Handle device back button press
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
    }, []),
  );

  if (showSuccess) {
    return <SuccessScreen />;
  }

  return (
    <View className="flex-1 border-t border-border">
      <Stack.Screen
        options={{
          title: "Cashy Subscription",
          headerTitleAlign: "left",
          animation: "none",
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
      <ScreenContainer edges={[]} className="bg-background relative">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 260 + insets.bottom }}
          className="px-5 pt-6"
        >
          {/* Header area */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              Upgrade to premium
            </Text>
            <Text className="text-sm font-medium text-muted-foreground text-center px-2">
              Grab the limited &quot;Lifetime Deal&quot; and get all premium
              feature and updates with no additional cost.
            </Text>
          </View>
          <ComparisonTable />
          <FAQSection />
        </ScrollView>

        {/* Sticky Bottom Area */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border px-5"
          style={{ paddingBottom: Math.max(insets.bottom, 20), paddingTop: 20 }}
        >
          {/* Packages */}
          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedPlan("free")}
              className={`flex-1 rounded-2xl border-2 p-4 pt-5 ${
                selectedPlan === "free"
                  ? "border-foreground bg-card"
                  : "border-border bg-card/50"
              }`}
            >
              <Text className="text-lg font-semibold text-center text-foreground mb-2">
                Free
              </Text>
              <Text className="text-2xl font-bold text-center text-foreground mt-auto">
                $0
              </Text>
              <Text className="text-xs text-center text-muted-foreground mt-1">
                Forever
              </Text>
            </TouchableOpacity>

            {(() => {
              const product = products.find((p) => p.id === "cashy_lifetime");

              if (!product) {
                return (
                  <View className="flex-1 rounded-2xl border-2 border-border bg-card/50 p-4 items-center justify-center min-h-[140px]">
                    <ActivityIndicator size="small" color="#F59E0B" />
                    <Text className="text-[10px] text-muted-foreground mt-2">
                      Fetching deal...
                    </Text>
                  </View>
                );
              }

              const discountOffer = (product as any)?.discountOffers?.find(
                (i: any) => i.id === "opening-discount",
              );

              let originalPrice = product.displayPrice;
              let discountPrice = discountOffer?.displayPrice;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlan("lifetime")}
                  className={`flex-1 rounded-2xl border-2 p-4 pt-5 relative ${
                    selectedPlan === "lifetime"
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-border bg-card/50"
                  }`}
                >
                  <View className="absolute -top-3.5 self-center bg-amber-500 px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-white tracking-wider">
                      Limited offer
                    </Text>
                  </View>
                  <Text className="text-lg font-semibold text-center text-foreground mb-2">
                    {product.displayName}
                  </Text>

                  <View className="items-center justify-center mt-auto flex-col gap-0.5">
                    {discountPrice && (
                      <Text className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground">
                        {originalPrice}
                      </Text>
                    )}

                    <Text className="text-2xl font-bold text-foreground">
                      {discountPrice || originalPrice}
                    </Text>
                  </View>
                  <Text className="text-xs text-center text-muted-foreground mt-2 leading-tight">
                    {product.description}
                  </Text>
                </TouchableOpacity>
              );
            })()}
          </View>

          {/* Subscribe Button */}
          {selectedPlan === "lifetime" && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBuy}
              disabled={isProcessing}
              className={`rounded-full py-4 items-center justify-center relative overflow-hidden ${
                isProcessing ? "bg-amber-500/70" : "bg-amber-500"
              }`}
              style={{ marginBottom: 12 }}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className="font-bold text-lg text-white"
                  numberOfLines={1}
                >
                  Get Started
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowLearnMore(true)}
            className="items-center justify-center py-2"
            style={{ marginBottom: Math.max(insets.bottom, 20) }}
          >
            <Text className="text-sm font-medium text-muted-foreground border-b border-muted-foreground/30">
              Learn more about purchases
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transfer Modal */}
        <TransferModal
          transferInfo={transferInfo}
          setTransferInfo={setTransferInfo}
          handleCreateSubscription={handleCreateSubscription}
          setIsProcessing={setIsProcessing}
        />

        {/* Learn More Modal */}
        <LearnMoreModal
          showLearnMore={showLearnMore}
          setShowLearnMore={setShowLearnMore}
        />
      </ScreenContainer>
    </View>
  );
}
