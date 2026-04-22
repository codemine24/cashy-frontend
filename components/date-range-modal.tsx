import { P } from "@/components/ui/typography";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { BottomSheetModal } from "./bottom-sheet-modal";

interface DateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

export function DateRangeModal({
  visible,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}: DateRangeModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(
    initialStartDate || null,
  );
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
      onClose();
    }
  };

  const handleClose = () => {
    setStartDate(initialStartDate || null);
    setEndDate(initialEndDate || null);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View className="px-6 pt-3 pb-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 border-b border-border pb-3">
          <P className="text-xl font-bold text-foreground" numberOfLines={1}>
            Custom Date Range
          </P>
          <TouchableOpacity
            onPress={handleClose}
            className="w-8 h-8 items-center justify-center"
          >
            <P className="text-xl text-foreground">✕</P>
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View className="gap-4 mb-6">
          <View>
            <P className="text-sm font-normal text-foreground mb-2">
              Start Date
            </P>
            <TouchableOpacity
              className="bg-surface rounded-lg px-4 py-3 border border-border"
              onPress={() => setShowStartPicker(true)}
            >
              <P className="text-foreground">
                {startDate
                  ? startDate.toLocaleDateString()
                  : "Select start date"}
              </P>
            </TouchableOpacity>
          </View>

          <View>
            <P className="text-sm font-normal text-foreground mb-2">End Date</P>
            <TouchableOpacity
              className="bg-surface rounded-lg px-4 py-3 border border-border"
              onPress={() => setShowEndPicker(true)}
            >
              <P className="text-foreground">
                {endDate ? endDate.toLocaleDateString() : "Select end date"}
              </P>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3 pb-6">
          <TouchableOpacity
            onPress={handleApply}
            disabled={!startDate || !endDate}
            className={`flex-1 rounded-lg py-3 items-center justify-center ${
              startDate && endDate ? "bg-primary" : "bg-muted opacity-50"
            }`}
          >
            <P
              className={`font-semibold text-base ${
                startDate && endDate
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
              numberOfLines={1}
            >
              Apply Date Range
            </P>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </BottomSheetModal>
  );
}
