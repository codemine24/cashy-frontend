import { Loan } from "@/interface/loan";
import { Edit3, MoreVertical, Trash2 } from "@/lib/icons";
import { formatNumber, getWalletColorCombination } from "@/utils";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Popover from "react-native-popover-view";

interface LoanCardProps {
  loan: Loan;
  index: number;
  onEdit?: (loan: Loan) => void;
  onDelete?: (loan: Loan) => void;
}

export const LoanCard = ({ loan, index, onEdit, onDelete }: LoanCardProps) => {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const showMenu = !!(onEdit || onDelete);

  // Get color combination based on loan index for repeating color pattern
  const colors = getWalletColorCombination(index);

  const handleAction = (action?: (loan: Loan) => void) => {
    setIsMenuVisible(false);
    if (action) {
      // Small timeout to allow popover to close before opening other modals
      setTimeout(() => {
        action(loan);
      }, 100);
    }
  };

  // Determine color based on loan type and status
  const getAmountColor = () => {
    if (loan.type === "GIVEN") {
      // Lent loans - green when positive (someone owes you money)
      return "text-green-600";
    } else {
      // Borrowed loans - red when positive (you owe someone money)
      return "text-red-600";
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/loan/${loan.id}` as any)}
      className="bg-card rounded-2xl p-3 mt-3 border border-border active:opacity-70"
    >
      {/* Top: Icon and Name/Date */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="size-13 items-center justify-center rounded-2xl mr-4"
            style={{ backgroundColor: colors.bg }}
          >
            <Text
              className="font-bold text-lg px-4 py-2"
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {loan.person_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1 mr-4">
            <Text
              className="text-foreground font-bold text-lg"
              numberOfLines={1}
            >
              {loan.person_name}
            </Text>
            {loan.contact_number && (
              <Text className="text-sm text-muted-foreground mt-0.5">
                {loan.contact_number}
              </Text>
            )}
          </View>
        </View>

        {/* Amount and Options Menu */}
        <View className="flex-row items-center">
          <View className="items-end mr-1">
            <Text className={`font-semibold ${getAmountColor()}`}>
              {formatNumber(loan.amount)}
            </Text>
          </View>

          {showMenu && (
            <Popover
              isVisible={isMenuVisible}
              onRequestClose={() => setIsMenuVisible(false)}
              from={
                <TouchableOpacity
                  onPress={() => setIsMenuVisible(true)}
                  className="py-2 pl-2 rounded-full"
                >
                  <MoreVertical size={20} className="text-foreground" />
                </TouchableOpacity>
              }
              popoverStyle={{
                borderRadius: 8,
                backgroundColor: "#ffffff",
                paddingVertical: 12,
                paddingHorizontal: 16,
                width: 220,
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 8,
                borderColor: "#e5e7eb",
              }}
              backgroundStyle={{
                backgroundColor: "transparent",
              }}
            >
              <View className="bg-surface flex flex-col gap-4">
                {onEdit && (
                  <TouchableOpacity
                    onPress={() => handleAction(onEdit)}
                    className="flex-row items-center"
                  >
                    <Edit3 size={20} className="text-black" />
                    <Text className="ml-4 text-[16px] text-black">
                      Edit Loan
                    </Text>
                  </TouchableOpacity>
                )}

                {onDelete && (
                  <TouchableOpacity
                    onPress={() => handleAction(onDelete)}
                    className="flex-row items-center mt-1"
                  >
                    <Trash2 size={20} className="text-red-500" />
                    <Text className="ml-4 text-[16px] text-red-500">
                      Delete Loan
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Popover>
          )}
        </View>
      </View>

      {/* Bottom: Progress Bar */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-xs text-muted-foreground">
          {formatNumber(Math.max(loan.amount - loan.paid_amount, 0))} left
        </Text>
        <Text className="text-xs text-muted-foreground font-medium">
          {Math.min(Math.round((loan.paid_amount / loan.amount) * 100), 100)}%
        </Text>
      </View>
      <View className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <View
          className="h-full bg-green-500 rounded-full"
          style={{
            width: `${Math.min((loan.paid_amount / loan.amount) * 100, 100)}%`,
          }}
        />
      </View>
    </TouchableOpacity>
  );
};
