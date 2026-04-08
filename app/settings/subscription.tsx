import { useCreateSubscription } from "@/api/subscription";
import { ScreenContainer } from "@/components/screen-container";
import { Check, ChevronDown, X } from "@/lib/icons";
import { useIAP } from "expo-iap";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        const product = products.find((p) => p.id === purchase.productId);

        if (!product || typeof product.price !== "number") {
          Alert.alert("Product not found", "Please contact support");
          return;
        }

        let purchasePrice = product.price;

        if (product.platform === "android") {
          const discountOffer = product.discountOffers?.[0];

          if (discountOffer?.displayPrice) {
            const numericPrice = Number(
              discountOffer.displayPrice.replace(/[^0-9.]/g, ""),
            );

            if (!Number.isNaN(numericPrice)) {
              purchasePrice = numericPrice;
            }
          }
        }

        await createSubscription({
          plan: "LIFETIME",
          price: purchasePrice || product.price,
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

  useEffect(() => {
    if (connected) {
      fetchProducts({
        skus: productIds,
        type: "in-app",
      });
    }
  }, [connected, fetchProducts]);

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

  const handleBuy = async () => {
    try {
      setIsProcessing(true);
      await requestPurchase({
        request: {
          google: {
            skus: ["cashy_lifetime"],
          },
        },
        type: "in-app",
      });
    } catch (error: any) {
      Alert.alert(
        "Purchase failed",
        error?.message || "Unable to start purchase",
      );
    } finally {
      setIsProcessing(false);
    }
  };

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
        options={{ title: "Cashy Subscription", headerTitleAlign: "left" }}
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
          <View className="bg-card rounded-3xl border border-border p-5 mb-8">
            <Text className="text-xl font-bold text-foreground mb-4 mt-2">
              Whats included in Pro
            </Text>

            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <Text className="flex-1 text-sm text-muted-foreground font-medium">
                Features
              </Text>
              <Text className="w-16 text-center text-sm text-foreground font-medium">
                Free
              </Text>
              <Text className="w-16 text-center text-sm text-amber-500 font-bold">
                Pro
              </Text>
            </View>

            {/* 5 Comparisons */}
            <ComparisonRow
              feature="Number of wallet"
              type="text"
              free={"5"}
              pro={"Unlimited"}
            />
            <ComparisonRow
              feature="Each wallet can be shared with"
              type="text"
              free={"1 member"}
              pro={"Unlimited"}
            />
            <ComparisonRow
              feature="Advance analytics"
              type="boolean"
              free={false}
              pro={true}
            />
            <ComparisonRow
              feature="Attach image with transaction"
              type="boolean"
              free={false}
              pro={true}
            />
          </View>

          {/* FAQ Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-foreground mb-3 px-1">
              FAQs
            </Text>
            <View className="bg-card rounded-3xl border border-border px-5">
              <FAQItem
                question="Is the lifetime deal really a one-time payment?"
                answer="Yes! You pay once and get access to all current and future Pro features forever. No subscriptions, no hidden fees ever."
              />
              <FAQItem
                question="How do I restore my purchase on a new device?"
                answer="Your subscription is linked to your Store account (Apple or Google). Simply use the 'Restore Purchase' option in settings or log in with the same account to automatically sync your Pro status."
              />
              <FAQItem
                question="Can I share my subscription with my family?"
                answer="Yes, our Pro plan supports Family Sharing where applicable through the App Store or Play Store. You can also share specific wallets with other users directly."
              />
              <FAQItem
                isLast
                question="Is my financial data secure?"
                answer="Security is our top priority. We use end-to-end encryption for your data and never share your financial information with third-party services. Your data remains private and secure."
              />
            </View>

            <View className="mt-6 p-4 flex-row items-center justify-between bg-card rounded-3xl border border-border">
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-foreground">
                  Still have questions?
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Can&apos;t find the answer you&apos;re looking for? Please
                  chat to our friendly team.
                </Text>
              </View>
              <TouchableOpacity className="bg-foreground px-5 py-2.5 rounded-full">
                <Text className="text-sm font-bold text-background">
                  Contact
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-bold text-lg text-white">
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

type ComparisonProps =
  | { type: "boolean"; free: boolean; pro: boolean }
  | { type: "text"; free: string; pro: string };

function ComparisonRow(props: { feature: string } & ComparisonProps) {
  const { feature, type, free, pro } = props;

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-border">
      <Text className="flex-1 text-base text-foreground font-medium pr-2">
        {feature}
      </Text>

      <View className="w-20 items-center justify-center">
        {type === "boolean" ? (
          free ? (
            <Check size={20} className="text-green-600" />
          ) : (
            <X size={20} className="text-muted-foreground" />
          )
        ) : (
          <Text className="text-sm text-muted-foreground text-center">
            {free}
          </Text>
        )}
      </View>

      <View className="w-20 items-center justify-center">
        {type === "boolean" ? (
          pro ? (
            <Check size={20} className="text-green-600" />
          ) : (
            <X size={20} className="text-muted-foreground" />
          )
        ) : (
          <Text className="text-sm text-muted-foreground">{pro}</Text>
        )}
      </View>
    </View>
  );
}

function FAQItem({
  question,
  answer,
  isLast,
}: {
  question: string;
  answer: string;
  isLast?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className={`${isLast ? "" : "border-b border-border/50"}`}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(!isOpen)}
        className="py-4 flex-row items-center justify-between"
      >
        <Text className="flex-1 text-base font-medium text-foreground pr-4 leading-relaxed">
          {question}
        </Text>
        <ChevronDown
          size={18}
          className={isOpen ? "text-foreground" : "text-muted-foreground"}
        />
      </TouchableOpacity>
      {isOpen && (
        <View className="pb-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}

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
