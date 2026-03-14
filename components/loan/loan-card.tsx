import { Loan } from "@/interface/loan";
import { Edit3, MoreVertical, Trash2 } from "@/lib/icons";
import { formatCurrency, formatUpdateDate } from "@/utils";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Popover from "react-native-popover-view";

interface LoanCardProps {
  loan: Loan;
  onPress?: (loan: Loan) => void;
  onEdit?: (loan: Loan) => void;
  onDelete?: (loan: Loan) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  ONGOING: { bg: "bg-blue-500/15", text: "text-blue-500" },
  PAID: { bg: "bg-green-500/15", text: "text-green-500" },
  OVERDUE: { bg: "bg-red-500/15", text: "text-red-500" },
};

export const LoanCard = ({ loan, onPress, onEdit, onDelete }: LoanCardProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const showMenu = !!(onEdit || onDelete);

  const statusStyle = STATUS_STYLES[loan.status] || STATUS_STYLES.ONGOING;
  const progress = loan.amount > 0 ? Math.min((loan.paid_amount / loan.amount) * 100, 100) : 0;
  const remaining = Math.max(loan.amount - loan.paid_amount, 0);

  const handleAction = (action?: (loan: Loan) => void) => {
    setIsMenuVisible(false);
    if (action) {
      setTimeout(() => {
        action(loan);
      }, 100);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(loan)}
      className="bg-card rounded-2xl p-4 mt-3 border border-border active:opacity-70"
    >
      {/* Top Row: Name, Status, Menu */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-3">
          {/* Avatar */}
          <View className="size-11 items-center justify-center rounded-2xl mr-3 bg-primary/10">
            <Text className="text-primary font-bold text-lg">
              {loan.person_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-foreground font-bold text-base" numberOfLines={1}>
              {loan.person_name}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {loan.due_date
                ? `Due: ${new Date(loan.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : formatUpdateDate(loan.updated_at)
              }
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          {/* Status Badge */}
          <View className={`px-2.5 py-1 rounded-lg mr-1 ${statusStyle.bg}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${statusStyle.text}`}>
              {loan.status}
            </Text>
          </View>

          {showMenu && (
            <Popover
              isVisible={isMenuVisible}
              onRequestClose={() => setIsMenuVisible(false)}
              from={
                <TouchableOpacity
                  onPress={() => setIsMenuVisible(true)}
                  className="py-2 pl-1 rounded-full"
                >
                  <MoreVertical size={18} className="text-foreground" />
                </TouchableOpacity>
              }
              popoverStyle={{
                borderRadius: 8,
                backgroundColor: "#ffffff",
                paddingVertical: 12,
                paddingHorizontal: 16,
                width: 200,
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
                    <Edit3 size={18} className="text-black" />
                    <Text className="ml-4 text-[15px] text-black">Edit Loan</Text>
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    onPress={() => handleAction(onDelete)}
                    className="flex-row items-center"
                  >
                    <Trash2 size={18} className="text-red-500" />
                    <Text className="ml-4 text-[15px] text-red-500">Delete Loan</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Popover>
          )}
        </View>
      </View>

      {/* Amount Row */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs text-muted-foreground mb-0.5">Total</Text>
          <Text className="text-foreground font-bold text-lg">
            {formatCurrency(loan.amount)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted-foreground mb-0.5">Paid</Text>
          <Text className="text-success font-bold text-lg">
            {formatCurrency(loan.paid_amount)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <View
          className={`h-full rounded-full ${progress >= 100 ? "bg-success" : "bg-primary"}`}
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Progress Info */}
      <View className="flex-row justify-between">
        <Text className={`text-xs font-semibold ${progress >= 100 ? "text-success" : "text-primary"}`}>
          {progress.toFixed(0)}% paid
        </Text>
        {remaining > 0 ? (
          <Text className="text-xs text-muted-foreground">
            {formatCurrency(remaining)} remaining
          </Text>
        ) : (
          <Text className="text-xs font-semibold text-success">Fully paid ✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
