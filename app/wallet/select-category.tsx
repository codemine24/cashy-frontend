import { useGetCategories } from "@/api/category";
import { CategoryModal } from "@/components/category/category-modal";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, Plus, Settings } from "@/lib/icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SelectCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookId: string;
    type?: string;
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
    attachments?: string | string[];
    currentAttachments?: string;
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
        type: params.type || params.editType,
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
        attachments: params.attachments,
        currentAttachments: params.currentAttachments,
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
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                router.navigate({
                  pathname: "/wallet/add-transaction",
                  params: {
                    bookId: params.bookId,
                    type: params.type || params.editType,
                    currentAmount: params.currentAmount,
                    currentRemark: params.currentRemark,
                    currentDate: params.currentDate,
                    editId: params.editId,
                    editAmount: params.editAmount,
                    editRemark: params.editRemark,
                    editType: params.editType,
                    editDate: params.editDate,
                    editTime: params.editTime,
                    attachments: params.attachments,
                    currentAttachments: params.currentAttachments,
                  },
                })
              }
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      {useFocusEffect(
        useCallback(() => {
          const onBackPress = () => {
            router.navigate({
              pathname: "/wallet/add-transaction",
              params: {
                bookId: params.bookId,
                type: params.type || params.editType,
                currentAmount: params.currentAmount,
                currentRemark: params.currentRemark,
                currentDate: params.currentDate,
                editId: params.editId,
                editAmount: params.editAmount,
                editRemark: params.editRemark,
                editType: params.editType,
                editDate: params.editDate,
                editTime: params.editTime,
                attachments: params.attachments,
                currentAttachments: params.currentAttachments,
              },
            });
            return true;
          };

          const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            onBackPress,
          );

          return () => subscription.remove();
        }, [params, router]),
      )}
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
        <Button
          onPress={() => setModalVisible(true)}
          className="rounded-full py-4 absolute right-4"
          style={{ bottom: insets.bottom + 32 }}
        >
          <Plus className="text-primary-foreground size-6" />
          <Text className="text-primary-foreground text-lg text-center ml-2">
            Add Category
          </Text>
        </Button>
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
