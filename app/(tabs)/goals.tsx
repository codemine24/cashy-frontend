import { useDeleteGoal, useGoals } from "@/api/goal";
import { CreateGoalModal } from "@/components/goal/create-goal-modal";
import { GoalCard } from "@/components/goal/goal-card";
import { ScreenContainer } from "@/components/screen-container";
import { GoalsSkeleton } from "@/components/skeletons/goals-skeleton";
import { useRouter } from "expo-router";
import { Plus } from "@/lib/icons";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editGoal, setEditGoal] = useState<{ id: string; name: string; target_amount: number } | null>(null);
  const { data: goalsData, isLoading } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const router = useRouter();
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
              renderItem={({ item: goal }) => (
                <GoalCard
                  goal={goal}
                  onEdit={(g) => {
                    setEditGoal({
                      id: g.id,
                      name: g.name,
                      target_amount: g.target_amount,
                    });
                    setShowCreateModal(true);
                  }}
                  onAddMember={(g) => {
                    router.push({
                      pathname: "/goal/members",
                      params: { goalId: g.id, goalName: g.name },
                    } as any);
                  }}
                  onDelete={handleDeleteGoal}
                />
              )}
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