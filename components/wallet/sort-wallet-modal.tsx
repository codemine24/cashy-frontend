import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import { Button } from "@/components/ui/button";
import { H3, Muted } from "@/components/ui/typography";
import { CrossIcon } from "@/icons/cross-icon";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SortOption = "name" | "created_at" | "updated_at";

const SORT_OPTIONS = (
  t: (key: string) => string,
): {
  key: SortOption;
  label: string;
  order: "asc" | "desc";
}[] => [
  { key: "updated_at", label: t("wallets.lastUpdated"), order: "desc" },
  { key: "name", label: t("wallets.nameAZ"), order: "asc" },
  { key: "created_at", label: t("wallets.lastCreated"), order: "desc" },
];

type Props = {
  showSortModal: boolean;
  setShowSortModal: (showSortModal: boolean) => void;
  tempSortBy: SortOption;
  tempSortOrder: "asc" | "desc";
  setTempSortBy: (tempSortBy: SortOption) => void;
  setTempSortOrder: (tempSortOrder: "asc" | "desc") => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
};

export default function SortWalletModal({
  showSortModal,
  setShowSortModal,
  tempSortBy,
  tempSortOrder,
  setTempSortBy,
  setTempSortOrder,
  setSortBy,
  setSortOrder,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetModal
      visible={showSortModal}
      onClose={() => setShowSortModal(false)}
    >
      <View className="px-6 pt-3" style={{ paddingBottom: 30 }}>
        {/* Handle */}
        <View className="items-center mb-5">
          <View className="w-10 h-1 rounded-full bg-foreground" />
        </View>

        {/* Title */}
        <View className="flex-row items-center justify-between mb-2  border-b border-border pb-4">
          <H3>{t("wallets.sortWalletBy")}</H3>
          <TouchableOpacity
            onPress={() => setShowSortModal(false)}
            className="p-1"
          >
            <CrossIcon className="size-4 text-foreground" />
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View className="mb-5">
          {SORT_OPTIONS(t).map((option, index) => {
            const isActive = tempSortBy === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => {
                  setTempSortBy(option.key);
                  setTempSortOrder(option.order);
                }}
                className={`flex-row items-center py-3`}
              >
                {/* Radio Circle */}
                <View
                  className={`size-4 items-center justify-center border border-foreground rounded-full mr-3 ${isActive ? "border-primary" : "border-border"}`}
                >
                  {isActive && (
                    <View className="size-2 rounded-full bg-primary" />
                  )}
                </View>
                <Muted>{option.label}</Muted>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          onPress={() => {
            setSortBy(tempSortBy);
            setSortOrder(tempSortOrder);
            setShowSortModal(false);
          }}
          style={{ marginBottom: Math.min(insets.bottom, 20) }}
        >
          Apply
        </Button>
      </View>
    </BottomSheetModal>
  );
}
