import { useDeleteGoal, useGoals } from "@/api/goal";
import { CreateGoalModal } from "@/components/goal/create-goal-modal";
import { ScreenContainer } from "@/components/screen-container";
import { GoalsSkeleton } from "@/components/skeletons/goals-skeleton";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function GoalsScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editGoal, setEditGoal] = useState<{ id: string; name: string; target_amount: number } | null>(null);
  const { data: goalsData, isLoading } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const handleDeleteGoal = (goalId: string, goalName: string) => {
    Alert.alert("Delete Goal", `Delete "${goalName}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const res: any = await deleteGoalMutation.mutateAsync(goalId);
            if (res?.success) {
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Goal deleted successfully",
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: res?.message || "Failed to delete goal",
              });
            }
          } catch (error: any) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: error?.message || "Something went wrong",
            });
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleOptionsPress = (goal: any) => {
    Alert.alert("Goal Action", `What do you want to do with "${goal.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Rename",
        onPress: () => {
          setEditGoal({ id: goal.id, name: goal.name, target_amount: goal.target_amount });
          setShowCreateModal(true);
        }
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteGoal(goal.id, goal.name)
      }
    ]);
  };

  return (
    <>
      <ScreenContainer edges={["left", "right"]} className="p-4 bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground">Goals</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Track your savings goals
            </Text>
          </View>

          {/* Goals List */}
          {isLoading ? (
            <GoalsSkeleton />
          ) : goalsData?.data?.length === 0 ? (
            <View className="bg-card rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-4xl mb-3">🎯</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">
                No goals yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-4">
                Create your first savings goal to start tracking
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-white font-semibold">Create Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={goalsData?.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item: goal }) => {
                const progress = Math.min(
                  Math.max((goal.balance / goal.target_amount) * 100, 0),
                  100,
                );
                const isComplete = progress >= 100;

                return (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/goal/[id]",
                        params: { id: goal.id },
                      } as any)
                    }
                    onLongPress={() => handleOptionsPress(goal)}
                    className="bg-card rounded-xl p-4 mb-4 border border-border active:opacity-70"
                  >
                    {/* Goal name + completion badge */}
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-lg font-bold text-foreground flex-1">
                        {goal.name}
                      </Text>
                      {isComplete && (
                        <View className="bg-success/20 rounded-full px-3 py-1 ml-2">
                          <Text className="text-xs font-bold text-success">
                            ✓ Done
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Saved vs Target */}
                    <View className="flex-row justify-between mb-3">
                      <View>
                        <Text className="text-xs text-muted-foreground font-medium mb-0.5">
                          Saved
                        </Text>
                        <Text className="text-lg font-bold text-success">
                          {goal.balance}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs text-muted-foreground font-medium mb-0.5">
                          Target
                        </Text>
                        <Text className="text-lg font-bold text-foreground">
                          {goal.target_amount}
                        </Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View className="h-2 bg-background rounded-full overflow-hidden border border-border mb-1">
                      <View
                        className={`h-full rounded-full ${isComplete ? "bg-success" : "bg-primary"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </View>

                    {/* Percentage text */}
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-xs text-muted-foreground">
                        {goal?.total_transactions} entr
                        {goal?.total_transactions !== 1 ? "ies" : "y"}
                      </Text>
                      <Text className={`text-xs font-bold ${isComplete ? "text-success" : "text-primary"}`}>
                        {progress.toFixed(1)}%
                      </Text>
                    </View>

                    <Text className="text-xs text-muted-foreground mt-2">
                      Long press to delete
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Button */}
      <View className="absolute bottom-8 right-4">
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="bg-primary p-4 rounded-full items-center justify-center flex-row gap-3 shadow-sm"
        >
          <Plus size={20} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-bold text-xl tracking-widest text-center">
            Add New Goal
          </Text>
        </TouchableOpacity>
      </View>

      <CreateGoalModal
        visible={showCreateModal}
        editGoal={editGoal}
        onClose={() => {
          setShowCreateModal(false);
          setEditGoal(null);
        }}
      />
    </>
  );
}