import { useCreateCategory, useGetCategories } from "@/api/category";
import { AppModal } from "@/components/app-modal";
import { Check, Plus, Settings, X } from "@/lib/icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function SelectCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    currentSelectedId?: string;
  }>();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: categoriesResponse, isLoading } = useGetCategories();
  const categories = categoriesResponse?.data || [];

  const createCategoryMutation = useCreateCategory();

  const handleSelect = (categoryId: string, categoryName: string) => {
    // Navigate back to add-transaction and pass the selected category info as params
    router.navigate({
      pathname: "/book/add-transaction",
      params: {
        ...params,
        selectedCategoryId: categoryId,
        selectedCategoryName: categoryName,
      },
    } as any);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Category name cannot be empty",
      });
      return;
    }

    try {
      const payload = {
        title: newCategoryName.trim(),
        color: "#00929A",
        icon: "",
      };

      const response = await createCategoryMutation.mutateAsync(payload);

      if (response?.data?.success || (response as any)?.success || response?.data?.id) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Category created successfully",
        });

        const createdCategory = response?.data?.data || response?.data;
        const newId = createdCategory?.id || "";
        const newName = createdCategory?.title || newCategoryName.trim();

        setModalVisible(false);
        setNewCategoryName("");

        // Immediately select the new category and go back
        if (newId) {
          handleSelect(newId.toString(), newName);
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.data?.message || (response as any)?.message || "Failed to create category",
        });
      }
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e?.message || "Something went wrong",
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Choose Category",
          headerBackTitle: "Back",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push({ pathname: "/book/manage-categories", params: { bookId: params.bookId } })}>
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
          <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 100 }}>
            {categories.map((cat: any) => {
              const isSelected = params.currentSelectedId === cat.id?.toString();

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleSelect(cat.id.toString(), cat.title)}
                  className={`flex-row items-center justify-between p-4 mb-3 border rounded-xl ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-4">{cat.icon || "📝"}</Text>
                    <Text className={`text-base font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {cat.title}
                    </Text>
                  </View>

                  <View
                    className={`h-6 w-6 rounded-full border-2 items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-border"}`}
                  >
                    {isSelected && <Check size={14} className="text-foreground" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-10 right-6 px-4 py-3 rounded-full bg-primary flex-row gap-3 items-center justify-center shadow-lg shadow-primary/30"
          style={{ elevation: 5 }}
        >
          <Plus size={24} className="text-foreground" />
          <Text className="text-primary-foreground font-bold text-xl tracking-widest text-center">Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Category Modal */}
      <AppModal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end bg-black/40">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <View className="bg-background rounded-t-3xl pt-2 px-6 pb-10 shadow-lg">
              <View className="items-center mb-6 mt-1">
                <View className="h-1 w-12 bg-foreground rounded-full" />
              </View>

              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-foreground">
                  New Category
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-muted p-2 rounded-full"
                >
                  <X size={20} className="text-foreground" />
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-semibold text-foreground mb-2">
                Category Name
              </Text>
              <TextInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="e.g. Travel, Utilities, Groceries"
                placeholderTextColor="#9CA3AF"
                className="w-full border border-border rounded-xl px-4 py-4 bg-muted/30 text-foreground text-base mb-6"
                autoFocus
              />

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 bg-muted rounded-xl py-4 items-center justify-center"
                >
                  <Text className="text-foreground font-bold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                  className={`flex-1 rounded-xl py-4 items-center justify-center ${createCategoryMutation.isPending ? "bg-primary/70" : "bg-primary"}`}
                >
                  {createCategoryMutation.isPending ? (
                    <ActivityIndicator className="text-foreground" size="small" />
                  ) : (
                    <Text className="text-foreground font-bold text-base tracking-wide">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </AppModal>
    </>
  );
}