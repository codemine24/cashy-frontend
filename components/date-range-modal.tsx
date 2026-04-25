import { P } from "@/components/ui/typography";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RotateCcw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import ApplyButton from "./ui/modal/apply-button";
import BottomSheetModalWrapper from "./ui/modal/bottom-sheet-modal-wrapper";

interface DateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: Date | null, endDate: Date | null) => void;
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

  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate || null);
      setEndDate(initialEndDate || null);
    }
  }, [visible, initialStartDate, initialEndDate]);

  const handleApply = () => {
    if (startDate && endDate && endDate >= startDate) {
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
    <BottomSheetModalWrapper
      visible={visible}
      title="Select Range"
      onClose={handleClose}
      footer={
        <ApplyButton
          onApply={handleApply}
          applyDisabled={!startDate || !endDate || endDate < startDate}
        />
      }
    >
      {startDate && endDate && (
        <TouchableOpacity
          onPress={() => {
            setStartDate(null);
            setEndDate(null);
            onApply(null, null);
          }}
          className={`w-24 mb-4 ml-auto flex-row gap-2 rounded-lg items-center justify-center`}
        >
          <P
            className={`font-semibold text-base text-destructive`}
            numberOfLines={1}
          >
            Reset
          </P>
          <RotateCcw size={16} color="red" />
        </TouchableOpacity>
      )}

      {/* Date Selection */}
      <View className="gap-4 mb-1">
        <View>
          <P className="text-sm font-normal text-foreground mb-2">Start Date</P>
          <TouchableOpacity
            className="bg-surface rounded-lg px-4 py-3 border border-border"
            onPress={() => setShowStartPicker(true)}
          >
            <P className="text-foreground">
              {startDate ? startDate.toLocaleDateString() : "Select start date"}
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

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          maximumDate={endDate || new Date()}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              if (endDate && selectedDate > endDate) {
                setEndDate(selectedDate);
              }
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || startDate || new Date()}
          mode="date"
          display="default"
          minimumDate={startDate || undefined}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </BottomSheetModalWrapper>
  );
}
