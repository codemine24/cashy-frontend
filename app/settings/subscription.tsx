import { useCreateSubscription } from "@/api/subscription";
import { ScreenContainer } from "@/components/screen-container";
import { ComparisonTable } from "@/components/subscription/comparison-table";
import { FAQSection } from "@/components/subscription/faq-section";
import { useAuth } from "@/context/auth-context";
import { Check, ChevronLeft } from "@/lib/icons";
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
  const insets = useSafeAreaInsets();
  const { mutateAsync: createSubscription } = useCreateSubscription();
  const { authState } = useAuth();
  const userEmail = authState.user?.email;

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

        await createSubscription({
          plan: "LIFETIME",
          price: discountPrice || originalPrice,
          product_id: purchase.productId,
          package_name: "com.codemine.cashy",
          purchase_token: purchase.purchaseToken,
        });

        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        setIsProcessing(false);
        setShowSuccess(true);
      } catch (error: any) {
        setIsProcessing(false);
        Alert.alert(
          "Verification failed",
          error?.message || "Please contact support",
        );
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

        await createSubscription({
          plan: "LIFETIME",
          price: discountPrice || originalPrice,
          product_id: owned.productId,
          package_name: "com.codemine.cashy",
          purchase_token: owned.purchaseToken,
        });

        await finishTransaction({
          purchase: owned,
          isConsumable: false,
        });

        setIsProcessing(false);
        setShowSuccess(true);
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
    return (
      <>
        <Stack.Screen options={{ title: "Success", headerLeft: () => null }} />
        <ScreenContainer edges={["bottom"]} className="bg-background">
          <View className="flex-1 items-center justify-center px-6">
            <View className="items-center mb-10">
              <View className="w-24 h-24 bg-amber-500 rounded-full items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
                <Check size={48} className="text-white" />
              </View>
              <Text className="text-3xl font-bold text-foreground text-center mb-2">
                You&apos;re all set!
              </Text>
              <Text className="text-lg text-muted-foreground text-center">
                Welcome to Cashy Premium.
              </Text>
            </View>

            <View className="bg-card border border-border rounded-3xl p-6 w-full mb-12">
              <Text className="text-lg font-bold text-foreground mb-4">
                Unlimited access unlocked:
              </Text>
              <View className="gap-y-4">
                {[
                  "Unlimited multi-currency wallets",
                  "Advanced shared wallet members",
                  "Attach images to transactions",
                  "Detailed financial analytics",
                ].map((feature, i) => (
                  <View key={i} className="flex-row items-center">
                    <View className="w-6 h-6 bg-amber-500/10 rounded-full items-center justify-center mr-3">
                      <Check size={14} className="text-amber-500" />
                    </View>
                    <Text className="text-base text-foreground font-medium">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace("/settings" as any)}
              className="w-full bg-foreground py-4.5 rounded-2xl items-center justify-center shadow-lg"
            >
              <Text className="text-lg font-bold text-background">
                Start Using Pro
              </Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Cashy Subscription",
          headerTitleAlign: "left",
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

          {/* Comparison Table */}
          <ComparisonTable />

          {/* FAQ Section */}
          <FAQSection />

          {/* Sync Logic Button */}
          {/* <View className="mb-8">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSaveProducts}
              className="bg-card w-full py-4 rounded-3xl border border-border items-center justify-center"
            >
              <Text className="text-sm font-bold text-muted-foreground">
                Sync Product Catalog
              </Text>
            </TouchableOpacity>
          </View> */}
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
              style={{ marginBottom: Math.min(insets.bottom, 20) }}
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
        </View>
      </ScreenContainer>
    </>
  );
}

// const handleSaveProducts = async () => {
//   if (!products || products.length === 0) {
//     Alert.alert("No products", "No products data available to save");
//     return;
//   }

//   try {
//     setIsProcessing(true);
//     await apiClient.post("/temporary", { products });
//     Alert.alert("Success", "Products data saved successfully");
//   } catch (error: any) {
//     Alert.alert(
//       "Error",
//       error?.response?.data?.message ||
//         error?.message ||
//         "Failed to save products data",
//     );
//   } finally {
//     setIsProcessing(false);
//   }
// };

// const handleRestore = async () => {
//   try {
//     const purchases = await getAvailablePurchases();
//     const owned = (purchases || []).find(
//       (p) => p.productId === "cashy_lifetime",
//     );

//     if (owned) {
//       Alert.alert("Restored", "You already own lifetime premium");
//     } else {
//       Alert.alert("Not found", "No lifetime purchase found for this account");
//     }
//   } catch (error: any) {
//     Alert.alert(
//       "Restore failed",
//       error?.message || "Could not restore purchases",
//     );
//   }
// };
