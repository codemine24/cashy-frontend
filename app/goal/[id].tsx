import { useGoal } from "@/api/goal";
import { useDeleteGoalTransaction } from "@/api/goal-transaction";
import { ScreenContainer } from "@/components/screen-container";
import { GoalDetailSkeleton } from "@/components/skeletons/goal-detail-skeleton";
import { Edit3, Trash2, X } from "@/lib/icons";
import { formatCurrency } from "@/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const { data: goal, isLoading } = useGoal(id!);
  const deleteEntryMutation = useDeleteGoalTransaction();
  const router = useRouter();

  if (isLoading) {
    return <GoalDetailSkeleton />;
  }

  if (!goal) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-foreground">Goal not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const progress = Math.min(
    Math.max((goal.data.balance / goal.data.target_amount) * 100, 0),
    100,
  );
  const isComplete = progress >= 100;

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert("Delete Entry", "Remove this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const res: any = await deleteEntryMutation.mutateAsync([entryId]);
            if (res?.success) {
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Entry deleted successfully",
              });
              setSelectedEntry(null);
            } else {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: res?.message || "Failed to delete entry",
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

  const handleEditEntry = () => {
    if (!selectedEntry) return;
    router.push({
      pathname: "/goal/add-entry",
      params: {
        goalId: id,
        type: selectedEntry.type,
        editId: selectedEntry.id,
        editAmount: selectedEntry.amount?.toString(),
        editRemark: selectedEntry.remark || "",
        editType: selectedEntry.type,
      },
    });
    setSelectedEntry(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: selectedEntry ? "1 Selected" : goal.data.name,
          headerBackTitle: "Goals",
          headerLeft: selectedEntry ? () => (
            <TouchableOpacity
              onPress={() => setSelectedEntry(null)}
              style={{ marginLeft: 8, padding: 6 }}
            >
              <X size={22} className="text-foreground" />
            </TouchableOpacity>
          ) : undefined,
          headerRight: selectedEntry ? () => (
            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                onPress={handleEditEntry}
                className="p-2"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Edit3 size={20} className="text-foreground" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteEntry(selectedEntry.id)}
                className="p-2"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={20} className="text-destructive" />
              </TouchableOpacity>
            </View>
          ) : undefined,
        }}
      />

      <ScreenContainer className="p-4 bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ── Summary Card ── */}
          <View className="bg-card rounded-xl p-6 mb-6 border border-border">
            {/* Progress ring replaced by big number + label */}
            <Text className="text-muted-foreground text-center mb-1">Saved so far</Text>
            <Text
              className={`text-4xl font-bold text-center mb-1 ${isComplete ? "text-success" : "text-primary"}`}
            >
              {formatCurrency(goal.data.balance)}
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-5">
              of {formatCurrency(goal.data.target_amount)} target
            </Text>

            {/* Progress bar */}
            <View className="h-3 bg-background rounded-full overflow-hidden border border-border mb-2">
              <View
                className={`h-full rounded-full ${isComplete ? "bg-success" : "bg-primary"}`}
                style={{ width: `${progress}%` }}
              />
            </View>

            {/* % and remaining */}
            <View className="flex-row justify-between">
              <Text
                className={`text-sm font-bold ${isComplete ? "text-success" : "text-primary"}`}
              >
                {progress.toFixed(1)}%
              </Text>
              {!isComplete && (
                <Text className="text-sm text-muted-foreground">
                  {formatCurrency(
                    Math.max(goal.data.target_amount - goal.data.balance, 0),
                  )}{" "}
                  remaining
                </Text>
              )}
              {isComplete && (
                <Text className="text-sm font-bold text-success">
                  🎉 Goal reached!
                </Text>
              )}
            </View>

            {/* Mini stats row */}
            <View className="flex-row gap-3 mt-5">
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted-foreground font-medium mb-1">
                  Total Added
                </Text>
                <Text className="text-base font-bold text-success">
                  {formatCurrency(goal.data.in)}
                </Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted-foreground font-medium mb-1">
                  Withdrawn
                </Text>
                <Text className="text-base font-bold text-destructive">
                  {formatCurrency(goal.data.out)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Entries list ── */}
          <Text className="text-xl font-bold text-foreground mb-4">
            History
          </Text>

          {goal.data.transactions.length === 0 ? (
            <View className="bg-card rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No entries yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Tap + to add money to this goal
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={goal.data.transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onLongPress={() => setSelectedEntry(item)}
                  onPress={() => {
                    if (selectedEntry) {
                      setSelectedEntry(item.id === selectedEntry.id ? null : item);
                    }
                  }}
                  className={`rounded-xl p-4 mb-3 border flex-row items-center justify-between active:opacity-70 ${selectedEntry?.id === item.id ? "border-primary bg-primary/10" : "bg-card border-border"}`}
                >
                  <View className="flex-1 mr-4">
                    <Text
                      className="text-base font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {item.remark ||
                        (item.type === "IN" ? "Added funds" : "Withdrawal")}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text
                    className={`text-lg font-bold ${item.type === "IN" ? "text-success" : "text-destructive"}`}
                  >
                    {item.type === "IN" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Buttons */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row px-4 pb-8 pt-3 bg-background gap-3 border-t border-border shadow-2xl"
      >
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/goal/add-entry",
              params: { goalId: id, type: "IN" },
            });
          }}
          className="flex-1 rounded-2xl bg-success py-3.5 items-center justify-center"
        >
          <Text className="text-white font-bold text-sm tracking-widest">
            + ADD
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/goal/add-entry",
              params: { goalId: id, type: "OUT" },
            });
          }}
          className="flex-1 rounded-2xl bg-destructive py-3.5 items-center justify-center"
        >
          <Text className="text-white font-bold text-sm tracking-widest">
            - WITHDRAW
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
