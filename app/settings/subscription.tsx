import { getAvailablePurchases, useIAP } from "expo-iap";
import React, { useEffect } from "react";
import { Alert, Button, Text, View } from "react-native";

const productIds = ["lifetime_premium"];

export default function PremiumScreen() {
  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        // 1) Send purchase to backend for verification
        // const res = await fetch(
        //   "https://cashflow-backend-six.vercel.app/api/v1/subscription",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: "Bearer YOUR_USER_TOKEN",
        //     },
        //     body: JSON.stringify({
        //       productId: purchase.productId,
        //       purchaseToken: purchase.purchaseToken,
        //       orderId: purchase.transactionId,
        //       packageName: "your.android.package.name",
        //     }),
        //   },
        // );

        // const data = await res.json();

        // if (!res.ok || !data.success) {
        //   throw new Error(data.message || "Purchase verification failed");
        // }

        // 2) Finish transaction only after successful verification
        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        Alert.alert("Success", "Lifetime premium unlocked");
      } catch (error: any) {
        Alert.alert(
          "Verification failed",
          error?.message || "Please contact support",
        );
      }
    },
    onPurchaseError: (error) => {
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

  const handleBuy = async () => {
    try {
      await requestPurchase({
        request: {
          google: {
            skus: ["lifetime_premium"],
          },
        },
        type: "in-app",
      });
    } catch (error: any) {
      Alert.alert(
        "Purchase failed",
        error?.message || "Unable to start purchase",
      );
    }
  };

  const handleRestore = async () => {
    try {
      const purchases = await getAvailablePurchases();
      const owned = (purchases || []).find(
        (p) => p.productId === "lifetime_premium",
      );

      if (owned) {
        Alert.alert("Restored", "You already own lifetime premium");
      } else {
        Alert.alert("Not found", "No lifetime purchase found for this account");
      }
    } catch (error: any) {
      Alert.alert(
        "Restore failed",
        error?.message || "Could not restore purchases",
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        Upgrade to Premium
      </Text>

      {products.map((product) => (
        <View key={product.id} style={{ marginBottom: 16 }}>
          <Text>{product.title}</Text>
          <Text>{product.description}</Text>
          <Text>{product.displayPrice}</Text>
        </View>
      ))}

      <Button title="Buy Lifetime Premium" onPress={handleBuy} />
      <View style={{ height: 12 }} />
      <Button title="Restore Purchase" onPress={handleRestore} />
    </View>
  );
}
