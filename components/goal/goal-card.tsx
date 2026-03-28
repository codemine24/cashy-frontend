import { useAuth } from "@/context/auth-context";
import { Goal } from "@/interface/goal";
import { Edit3, MoreVertical, Target, Trash2, UserPlus } from "@/lib/icons";
import { formatUpdateDate } from "@/utils";
import { isOwner } from "@/utils/is-owner";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Popover from "react-native-popover-view";

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onAddMember?: (goal: Goal) => void;
  onDelete?: (goalId: string, goalName: string) => void;
}

export const GoalCard = ({
  goal,
  onEdit,
  onAddMember,
  onDelete,
}: GoalCardProps) => {
  const router = useRouter();
  const { authState } = useAuth();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const isCurrentUserOwner = isOwner(authState.user?.id, goal.created_by);

  const progress = Math.min(
    Math.max((goal.balance / goal.target_amount) * 100, 0),
    100,
  );
  const isComplete = progress >= 100;

  const handleAction = (action?: () => void) => {
    setIsMenuVisible(false);
    if (action) {
      setTimeout(() => {
        action();
      }, 100);
    }
  };

  const showMenu = !!(onEdit || onAddMember || onDelete);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/goal/[id]",
          params: { id: goal.id },
        } as any)
      }
      className="bg-card rounded-2xl p-4 mb-4 border border-border active:opacity-70"
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Icon and Name/Text */}
        <View className="flex-row items-center flex-1">
          <View className="size-13 items-center justify-center rounded-2xl mr-4 bg-primary/10">
            <Target size={26} className="text-primary" />
          </View>
          <View className="flex-1 mr-4">
            <Text
              className="text-foreground font-bold text-lg"
              numberOfLines={1}
            >
              {goal.name}
            </Text>
          </View>
        </View>

        {/* Right: Amount and Options Menu */}
        <View className="flex-row items-center">
          <View className="items-end mr-1">
            <Text className="text-lg font-bold text-primary">
              {goal.balance}
            </Text>
            <Text className="text-[10px] text-muted-foreground">
              Target: {goal.target_amount}
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
                    onPress={() => handleAction(() => onEdit(goal))}
                    className="flex-row items-center"
                    disabled={!isCurrentUserOwner}
                    style={{ opacity: isCurrentUserOwner ? 1 : 0.4 }}
                  >
                    <Edit3 size={20} className="text-black" />
                    <Text className="ml-4 text-[16px] text-black">Edit</Text>
                  </TouchableOpacity>
                )}
                {onAddMember && (
                  <TouchableOpacity
                    onPress={() => handleAction(() => onAddMember(goal))}
                    className="flex-row items-center"
                    disabled={!isCurrentUserOwner}
                    style={{ opacity: isCurrentUserOwner ? 1 : 0.4 }}
                  >
                    <UserPlus size={20} className="text-black" />
                    <Text className="ml-4 text-[16px] text-black">
                      Add Members
                    </Text>
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    onPress={() =>
                      handleAction(() => onDelete(goal.id, goal.name))
                    }
                    className="flex-row items-center mt-1"
                    disabled={!isCurrentUserOwner}
                    style={{ opacity: isCurrentUserOwner ? 1 : 0.4 }}
                  >
                    <Trash2 size={20} className="text-red-500" />
                    <Text className="ml-4 text-[16px] text-red-500">
                      Delete Goal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Popover>
          )}
        </View>
      </View>

      {/* Progress Line in the bottom */}
      <View className="mt-2">
        <View className="h-1 bg-muted rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${isComplete ? "bg-primary" : "bg-primary"}`}
            style={{ width: `${progress}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-[10px] text-muted-foreground">
            <Text className="text-xs text-muted-foreground mt-0.5">
              {formatUpdateDate(goal.updated_at)}
            </Text>
          </Text>
          <Text className={`text-xs text-muted-foreground`}>
            {progress.toFixed(1)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
