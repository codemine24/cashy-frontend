import { useGetCategories } from "@/api/category";
import { CategoryModal } from "@/components/category/category-modal";
import { Check, Plus, Settings } from "@/lib/icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SelectCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    currentSelectedId?: string;
    currentAmount?: string;
    editId?: string;
    editAmount?: string;
    editRemark?: string;
    editType?: string;
    editCategoryId?: string;
    editCategoryName?: string;
    editDate?: string;
    editTime?: string;
    currentRemark?: string;
    currentDate?: string;
  }>();

  const [modalVisible, setModalVisible] = useState(false);

  const { data: categoriesResponse, isLoading } = useGetCategories();
  const categories = categoriesResponse?.data || [];

  const handleSelect = (categoryId: string, categoryName: string) => {
    // Navigate back to add-transaction and pass the selected category info as params
    // Preserve all existing edit parameters if we're in edit mode
    router.navigate({
      pathname: "/wallet/add-transaction",
      params: {
        bookId: params.bookId,
        currentSelectedId: params.currentSelectedId,
        currentAmount: params.currentAmount,
        currentRemark: params.currentRemark,
        currentDate: params.currentDate,
        // Preserve edit parameters if they exist
        editId: params.editId,
        editAmount: params.editAmount,
        editRemark: params.editRemark,
        editType: params.editType,
        editDate: params.editDate,
        editTime: params.editTime,
        // Update the category selection
        selectedCategoryId: categoryId,
        selectedCategoryName: categoryName,
      },
    } as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Choose Category",
          headerBackTitle: "Back",
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/wallet/manage-categories",
                  params: { bookId: params.bookId },
                })
              }
            >
              <Settings size={22} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-background">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" className="text-primary" />
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-xl font-bold text-foreground mb-2">
              No categories
            </Text>
            <Text className="text-muted-foreground text-center mb-6">
              You don&apos;t have any expense categories yet.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-4 py-2"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {categories.map((cat: any) => {
              const isSelected =
                params.currentSelectedId === cat.id?.toString();

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleSelect(cat.id, cat.title)}
                  className={`flex-row items-center justify-between p-4 mb-3 border rounded-xl ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-4">{cat.icon || "📝"}</Text>
                    <Text
                      className={`text-base font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}
                    >
                      {cat.title}
                    </Text>
                  </View>

                  <View
                    className={`h-6 w-6 rounded-full border-2 items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-border"}`}
                  >
                    {isSelected && (
                      <Check size={14} className="text-foreground" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="rounded-full py-4 px-4 absolute bottom-8 right-4 bg-primary flex-row items-center justify-center shadow-lg"
        >
          <Plus className="text-primary-foreground size-6" />
          <Text className="text-primary-foreground text-lg text-center ml-2">
            Add Category
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add New Category Modal */}
      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        isEditing={false}
      />
    </>
  );
}
