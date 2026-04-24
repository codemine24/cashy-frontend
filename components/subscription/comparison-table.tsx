import { Check, X } from "@/lib/icons";
import { Text, View } from "react-native";

export function ComparisonTable() {
  return (
    <View className="bg-card rounded-3xl border border-border p-5 mb-8">
      <Text className="text-xl font-bold text-foreground mb-4 mt-2">
        Whats included in Pro
      </Text>

      <View className="flex-row items-center justify-between py-4 border-b border-border">
        <Text className="flex-1 text-sm text-muted-foreground font-medium">
          Features
        </Text>

        <View className="w-20 items-center justify-center">
          <Text className="text-sm text-foreground text-center font-medium">
            Free
          </Text>
        </View>

        <View className="w-20 items-center justify-center">
          <Text className="text-sm text-amber-500 font-bold">Pro</Text>
        </View>
      </View>

      {/* 5 Comparisons */}
      <ComparisonRow
        feature="Number of wallet"
        type="text"
        free={"5"}
        pro={"Unlimited"}
      />
      <ComparisonRow
        feature="Number of loan"
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
        feature="Attach image with transaction"
        type="boolean"
        free={false}
        pro={true}
        isLast
      />
    </View>
  );
}

type ComparisonProps =
  | { type: "boolean"; free: boolean; pro: boolean }
  | { type: "text"; free: string; pro: string };

export function ComparisonRow(
  props: { feature: string; isLast?: boolean } & ComparisonProps,
) {
  const { feature, type, free, pro, isLast = false } = props;

  return (
    <View
      className={`flex-row items-center justify-between py-4 ${isLast ? "" : "border-b border-border"}`}
    >
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
