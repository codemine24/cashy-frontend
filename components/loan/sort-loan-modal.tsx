import { useTranslation } from "react-i18next";
import { View } from "react-native";
import ApplyButton from "../ui/modal/apply-button";
import BottomSheetModalWrapper from "../ui/modal/bottom-sheet-modal-wrapper";
import RadioButton from "../ui/radio-button";

export type SortOption = "person_name" | "updated_at" | "created_at";

const SORT_OPTIONS = (
  t: (key: string) => string,
): {
  key: SortOption;
  label: string;
  order: "asc" | "desc";
}[] => [
  { key: "updated_at", label: t("wallets.lastUpdated"), order: "desc" },
  { key: "person_name", label: t("wallets.nameAZ"), order: "asc" },
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

export default function SortLoanModal({
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

  return (
    <BottomSheetModalWrapper
      visible={showSortModal}
      title="Sort Loans By"
      onClose={() => setShowSortModal(false)}
      footer={
        <ApplyButton
          onApply={() => {
            setSortBy(tempSortBy);
            setSortOrder(tempSortOrder);
            setShowSortModal(false);
          }}
          applyDisabled={false}
        />
      }
    >
      <View className="flex-col gap-3">
        {SORT_OPTIONS(t).map((option, index) => {
          const isActive = tempSortBy === option.key;
          return (
            <RadioButton
              key={option.key}
              label={option.label}
              selected={isActive}
              onPress={() => {
                setTempSortBy(option.key);
                setTempSortOrder(option.order);
              }}
            />
          );
        })}
      </View>
    </BottomSheetModalWrapper>
  );
}
