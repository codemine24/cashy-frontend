import { useCreateSubscription, useCreateTemporary } from "@/api/subscription";
import { ScreenContainer } from "@/components/screen-container";
import { ComparisonTable } from "@/components/subscription/comparison-table";
import { FAQSection } from "@/components/subscription/faq-section";
import SuccessScreen from "@/components/subscription/success-screen";
import { useAuth } from "@/context/auth-context";
import { ChevronLeft } from "@/lib/icons";
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
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Must match the entitlement identifier configured in the RevenueCat dashboard
const PREMIUM_ENTITLEMENT_ID = "premium";

type PlanKey = "free" | "monthly" | "yearly";

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [offeringLoading, setOfferingLoading] = useState(true);

  const insets = useSafeAreaInsets();
  const { mutateAsync: createSubscription } = useCreateSubscription();
  const { mutateAsync: createTemporary } = useCreateTemporary();
  const { authState } = useAuth();
  const userId = authState.user?.id;

  useEffect(() => {
    console.log("in the offering use effect");
    let cancelled = false;
    (async () => {
      try {
        const offerings = await Purchases.getOfferings();
        console.log("Offerings monthly:", JSON.stringify(offerings, null, 2));
        await createTemporary({
          offering_check: JSON.stringify(offerings),
        });
        if (!cancelled) setOffering(offerings.current);
      } catch {
        // leave offering null; UI will show loader / disabled state
      } finally {
        if (!cancelled) setOfferingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createTemporary]);

  const monthlyPkg = offering?.monthly ?? null;
  const yearlyPkg = offering?.annual ?? null;

  const recordPurchase = async (
    pkg: PurchasesPackage,
    plan: "MONTHLY" | "YEARLY",
  ) => {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement =
      customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];

    await createSubscription({
      plan,
      price: pkg.product.priceString,
      product_id: pkg.product.identifier,
      rc_app_user_id: customerInfo.originalAppUserId,
      expires_at: entitlement?.expirationDate ?? "",
    });
  };

  const handleBuy = async () => {
    if (selectedPlan === "free") return;
    if (!userId) {
      Alert.alert("Not signed in", "Please sign in to continue.");
      return;
    }

    const pkg = selectedPlan === "monthly" ? monthlyPkg : yearlyPkg;
    if (!pkg) {
      Alert.alert("Unavailable", "This plan is not available right now.");
      return;
    }

    try {
      setIsProcessing(true);
      await Purchases.purchasePackage(pkg);
      await recordPurchase(
        pkg,
        selectedPlan === "monthly" ? "MONTHLY" : "YEARLY",
      );
      setShowSuccess(true);
    } catch (error: any) {
      if (error?.userCancelled) return;
      Alert.alert(
        "Purchase failed",
        error?.message || "Unable to complete purchase",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      const customerInfo = await Purchases.restorePurchases();
      const entitlement =
        customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];

      if (!entitlement) {
        Alert.alert("Nothing to restore", "No active subscription was found.");
        return;
      }

      const productId = entitlement.productIdentifier;
      const pkg =
        monthlyPkg?.product.identifier === productId
          ? monthlyPkg
          : yearlyPkg?.product.identifier === productId
            ? yearlyPkg
            : null;

      if (pkg) {
        await createSubscription({
          plan: pkg === monthlyPkg ? "MONTHLY" : "YEARLY",
          price: pkg.product.priceString,
          product_id: productId,
          rc_app_user_id: customerInfo.originalAppUserId,
          expires_at: entitlement.expirationDate ?? "",
        });
      }

      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert("Restore failed", error?.message || "Please try again");
    } finally {
      setIsRestoring(false);
    }
  };

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
          contentContainerStyle={{ paddingBottom: 420 + insets.bottom }}
          className="px-5 pt-6"
        >
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              Upgrade to premium
            </Text>
            <Text className="text-sm font-medium text-muted-foreground text-center px-2">
              Unlock every premium feature with a Monthly or Yearly plan.
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
          <View className="flex-row gap-3 mb-5">
            <PlanCard
              label="Free"
              priceLine="$0"
              caption="Forever"
              selected={selectedPlan === "free"}
              onPress={() => setSelectedPlan("free")}
            />
            <PlanCard
              label="Monthly"
              priceLine={monthlyPkg?.product.priceString}
              caption="per month"
              loading={offeringLoading && !monthlyPkg}
              selected={selectedPlan === "monthly"}
              onPress={() => monthlyPkg && setSelectedPlan("monthly")}
            />
            <PlanCard
              label="Yearly"
              priceLine={yearlyPkg?.product.priceString}
              caption="per year"
              badge="Best value"
              loading={offeringLoading && !yearlyPkg}
              selected={selectedPlan === "yearly"}
              onPress={() => yearlyPkg && setSelectedPlan("yearly")}
            />
          </View>

          {selectedPlan !== "free" && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBuy}
              disabled={isProcessing || (!monthlyPkg && !yearlyPkg)}
              className={`rounded-full py-4 items-center justify-center ${
                isProcessing ? "bg-amber-500/70" : "bg-amber-500"
              }`}
              style={{ marginBottom: 8 }}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className="font-bold text-lg text-white"
                  numberOfLines={1}
                >
                  Subscribe
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleRestore}
            disabled={isRestoring}
            className="items-center justify-center py-2"
          >
            {isRestoring ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text className="text-sm font-medium text-muted-foreground border-b border-muted-foreground/30">
                Restore purchases
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </View>
  );
}

type PlanCardProps = {
  label: string;
  priceLine?: string;
  caption: string;
  badge?: string;
  loading?: boolean;
  selected: boolean;
  onPress: () => void;
};

function PlanCard({
  label,
  priceLine,
  caption,
  badge,
  loading,
  selected,
  onPress,
}: PlanCardProps) {
  const borderClass = badge
    ? selected
      ? "border-amber-500 bg-amber-500/10"
      : "border-border bg-card/50"
    : selected
      ? "border-foreground bg-card"
      : "border-border bg-card/50";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`flex-1 rounded-2xl border-2 p-3 pt-5 relative ${borderClass}`}
    >
      {badge && (
        <View className="absolute -top-3 self-center bg-amber-500 px-2 py-0.5 rounded-full">
          <Text className="text-[9px] font-bold text-white tracking-wider">
            {badge}
          </Text>
        </View>
      )}
      <Text className="text-base font-semibold text-center text-foreground mb-1">
        {label}
      </Text>
      <View className="items-center justify-center mt-auto">
        {loading ? (
          <ActivityIndicator size="small" color="#F59E0B" />
        ) : (
          <Text className="text-xl font-bold text-foreground">
            {priceLine ?? "—"}
          </Text>
        )}
        <Text className="text-[10px] text-center text-muted-foreground mt-1">
          {caption}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
