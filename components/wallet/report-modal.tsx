import { FileText, LayoutList, Tag, X } from "@/lib/icons";
import { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BottomSheetModal } from "../bottom-sheet-modal";

export type ReportType = "all-entries" | "day-wise" | "category-wise";

interface ReportOption {
  value: ReportType;
  label: string;
  subtext: string;
  Icon: React.ElementType;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    value: "all-entries",
    label: "All Entries",
    subtext: "List of all transactions with full details",
    Icon: LayoutList,
  },
  {
    value: "day-wise",
    label: "Day-wise",
    subtext: "Transactions grouped and summarized by date",
    Icon: FileText,
  },
  {
    value: "category-wise",
    label: "Category-wise",
    subtext: "Spending breakdown grouped by category",
    Icon: Tag,
  },
];

interface ReportModalProps {
  visible: boolean;
  selectedReport: ReportType;
  onSelectReport: (type: ReportType) => void;
  onGeneratePdf: () => void;
  onClose: () => void;
  isGenerating?: boolean;
}

export function ReportModal({
  visible,
  selectedReport,
  onSelectReport,
  onGeneratePdf,
  onClose,
  isGenerating = false,
}: ReportModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View className="px-5 pt-3">
        {/* Drag handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-border" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between pt-3 pb-4 border-b border-border">
          <View>
            <Text className="text-foreground font-bold text-[17px]">
              Generate Report
            </Text>
            <Text className="text-muted-foreground text-[12px] mt-0.5">
              Choose a report type to export as PDF
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            className="w-8 h-8 rounded-full bg-muted items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View className="pt-4 gap-3">
          {REPORT_OPTIONS.map(({ value, label, subtext, Icon }) => {
            const isSelected = selectedReport === value;
            return (
              <TouchableOpacity
                key={value}
                activeOpacity={0.7}
                onPress={() => onSelectReport(value)}
                className={`flex-row items-center px-4 py-3.5 rounded-2xl border ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                }`}
              >
                {/* Icon */}
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                    isSelected ? "bg-primary/15" : "bg-muted"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }
                  />
                </View>

                {/* Text */}
                <View className="flex-1">
                  <Text
                    className={`text-[14px] font-semibold ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {label}
                  </Text>
                  <Text className="text-muted-foreground text-[11px] mt-0.5">
                    {subtext}
                  </Text>
                </View>

                {/* Radio Button */}
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ml-2 ${
                    isSelected ? "border-primary" : "border-border"
                  }`}
                >
                  {isSelected && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Generate Button */}
        <View className="pt-5 pb-10">
          <TouchableOpacity
            onPress={onGeneratePdf}
            disabled={isGenerating}
            activeOpacity={0.8}
            className={`flex-row items-center justify-center py-4 rounded-2xl gap-2 ${
              isGenerating ? "bg-primary/50" : "bg-primary"
            }`}
          >
            <FileText size={17} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-bold text-[15px] tracking-wide">
              {isGenerating ? "Generating..." : "Generate PDF"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}
