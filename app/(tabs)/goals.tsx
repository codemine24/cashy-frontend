import { useDeleteGoal, useGoals } from "@/api/goal";
import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import { CreateGoalModal } from "@/components/goal/create-goal-modal";
import { GoalCard } from "@/components/goal/goal-card";
import { ScreenContainer } from "@/components/screen-container";
import { GoalsSkeleton } from "@/components/skeletons/goals-skeleton";
import { Button } from "@/components/ui/button";
import { H3, Muted } from "@/components/ui/typography";
import { useDebounce } from "@/hooks/use-debounce";
import { CrossIcon } from "@/icons/cross-icon";
import { FilterIcon } from "@/icons/filter-icon";
import { PlusIcon } from "@/icons/plus-icon";
import { SearchIcon } from "@/icons/search-icon";
import { Goal } from "@/interface/goal";
import { formatCurrency } from "@/utils/index";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function GoalsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editGoal, setEditGoal] = useState<{
    id: string;
    name: string;
    target_amount: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [refreshing, setRefreshing] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  type SortOption = "name" | "created_at" | "updated_at";

  const SORT_OPTIONS: {
    key: SortOption;
    label: string;
    order: "asc" | "desc";
  }[] = [
    { key: "name", label: "Name (A-Z)", order: "desc" },
    { key: "created_at", label: "Last Created", order: "desc" },
    { key: "updated_at", label: "Last Updated", order: "desc" },
  ];

  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [tempSortBy, setTempSortBy] = useState<SortOption>("updated_at");
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">("desc");

  const openSortModal = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setShowSortModal(true);
  };

  const { data: goalsData, isLoading, refetch } = useGoals();
  const deleteGoalMutation = useDeleteGoal();

  const meta = goalsData?.meta as any;
  const summary = meta?.summary;
  const totalCount = meta?.total || 0;

  // Client-side filtering for search
  const filteredGoals =
    goalsData?.data?.filter((goal: Goal) =>
      goal.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    ) || [];

  // Client-side sorting
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "name") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const router = useRouter();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Search Input */}
          <View className="relative mb-4">
            <View className="flex-row items-center bg-muted rounded-xl px-3 border border-border">
              <SearchIcon className="text-muted-foreground size-5" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search goals..."
                placeholderClassName="text-muted-foreground"
                className="flex-1 ml-2 text-base text-foreground"
                placeholderTextColor="#94a3b8"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  className="ml-2 p-1"
                >
                  <CrossIcon className="text-muted-foreground size-4" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Header */}
          <View className="mb-2 flex-row items-center">
            <Text className="text-sm font-semibold text-muted-foreground">
              YOUR GOALS
            </Text>
            <TouchableOpacity
              onPress={openSortModal}
              className="ml-2 p-2.5 rounded-xl"
            >
              <FilterIcon className="text-primary size-6" />
            </TouchableOpacity>
          </View>

          {/* Goals List */}
          {isLoading ? (
            <GoalsSkeleton />
          ) : filteredGoals.length === 0 && debouncedSearchQuery ? (
            <View className="bg-card rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">
                No goals found
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-4">
                Try adjusting your search terms
              </Text>
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-white font-semibold">Clear Search</Text>
              </TouchableOpacity>
            </View>
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
            <>
              {/* Summary Section */}
              {summary && totalCount > 0 && (
                <View className="flex-row justify-between bg-card rounded-2xl p-4 mb-6 border border-border">
                  <View className="flex-1 border-r border-border pr-2">
                    <Text className="text-sm text-muted-foreground mb-1">
                      Total Left
                    </Text>
                    <Text
                      className="text-2xl font-bold text-foreground"
                      numberOfLines={1}
                    >
                      {formatCurrency(summary.total_remaining || 0)}
                    </Text>
                  </View>
                  <View className="flex-1 pl-4 justify-center">
                    <Text className="text-xs text-muted-foreground mb-1">
                      Total Goals: {totalCount}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-success mr-2" />
                      <Text className="text-sm font-medium text-foreground">
                        {summary.total_fulfilled || 0} Fulfilled
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <FlatList
                scrollEnabled={false}
                data={sortedGoals}
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
            </>
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Button */}
      <Button
        onPress={() => setShowCreateModal(true)}
        className="rounded-full py-4 absolute bottom-4 right-4"
      >
        <PlusIcon className="text-primary-foreground size-6" />
        <Text className="text-primary-foreground text-lg text-center ml-2">
          Add goal
        </Text>
      </Button>

      <CreateGoalModal
        visible={showCreateModal}
        editGoal={editGoal}
        onClose={() => {
          setShowCreateModal(false);
          setEditGoal(null);
        }}
      />

      {/* Sort Modal */}
      <BottomSheetModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
      >
        <View className="px-6 pt-3" style={{ paddingBottom: 30 }}>
          {/* Handle */}
          <View className="items-center mb-5">
            <View className="w-10 h-1 rounded-full bg-foreground" />
          </View>

          {/* Title */}
          <View className="flex-row items-center justify-between mb-2  border-b border-border pb-4">
            <H3>Sort goals by</H3>
            <TouchableOpacity
              onPress={() => setShowSortModal(false)}
              className="p-1"
            >
              <CrossIcon className="size-4" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="mb-5">
            {SORT_OPTIONS.map((option, index) => {
              const isActive = tempSortBy === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setTempSortBy(option.key);
                    setTempSortOrder(option.order);
                  }}
                  className={`flex-row items-center py-3`}
                >
                  {/* Radio Circle */}
                  <View
                    className={`size-4 items-center justify-center border border-foreground rounded-full mr-3 ${isActive ? "border-primary" : "border-border"}`}
                  >
                    {isActive && (
                      <View className="size-2 rounded-full bg-primary" />
                    )}
                  </View>
                  <Muted>{option.label}</Muted>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            onPress={() => {
              setSortBy(tempSortBy);
              setSortOrder(tempSortOrder);
              setShowSortModal(false);
            }}
          >
            Apply
          </Button>
        </View>
      </BottomSheetModal>
    </>
  );
}
