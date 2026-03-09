import {
  useCreateCategory,
  useDeleteCategory,
  useGetCategories,
  useUpdateCategory,
} from "@/api/category";
import { AppModal } from "@/components/app-modal";
import { ManageCategoriesSkeleton } from "@/components/skeletons/manage-categories-skeleton";
import { Edit3, MoreVertical, Plus, Trash2, X } from "@/lib/icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Popover from "react-native-popover-view";
import Toast from "react-native-toast-message";

export default function ManageCategoriesScreen() {
  // Modals & Forms State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState("");

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // APIs
  const { data: categoriesResponse, isLoading } = useGetCategories();
  const categories = categoriesResponse?.data || [];
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Open the modal for Adding
  const openAddModal = () => {
    setIsEditing(false);
    setEditingCategoryId(null);
    setCategoryNameInput("");
    setModalVisible(true);
  };

  // Open the modal for Editing
  const openEditModal = (id: string, currentName: string) => {
    setActiveMenuId(null);
    setIsEditing(true);
    setEditingCategoryId(id);
    setCategoryNameInput(currentName);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryNameInput.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Category name cannot be empty",
      });
      return;
    }

    try {
      if (isEditing && editingCategoryId) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          category: { title: categoryNameInput.trim() },
        });
      } else {
        await createCategoryMutation.mutateAsync({
          title: categoryNameInput.trim(),
          color: "#00929A",
          icon: "",
        });
      }
      setModalVisible(false);
      setCategoryNameInput("");

      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Category ${isEditing ? "updated" : "created"} successfully`,
        });
      }, 500);

    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    setActiveMenuId(null);
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategoryMutation.mutateAsync(id);
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Category deleted successfully",
              });

            } catch (e: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: e?.message || "Failed to delete category",
              });
            }
          },
        },
      ]
    );
  };

  const isSaving =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: "Manage Categories", headerBackTitle: "Back" }}
      />
      <View className="flex-1 bg-background">
        {/* Top Outline Add Button */}
        <View className="px-5 py-4 bg-background z-10">
          <TouchableOpacity
            onPress={openAddModal}
            className="w-full flex-row items-center justify-center py-4 rounded-xl border border-primary border-dashed bg-primary/5"
            activeOpacity={0.7}
          >
            <Plus size={20} className="text-primary mr-2" />
            <Text className="text-primary font-bold text-base tracking-wide">
              Add New Category
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ManageCategoriesSkeleton />
        ) : categories.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-xl font-bold text-foreground mb-2">
              No categories
            </Text>
            <Text className="text-muted-foreground text-center mb-6">
              You don&apos;t have any custom categories yet.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {categories.map((cat: any) => (
              <View
                key={cat.id}
                className="flex-row items-center justify-between p-4 mb-3 border border-border bg-card shadow-sm rounded-xl"
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-3xl mr-4">{cat.icon || "📝"}</Text>
                  <Text
                    className="text-base font-semibold text-foreground flex-1"
                    numberOfLines={1}
                  >
                    {cat.title}
                  </Text>
                </View>

                {/* Popover Menu inside Category Row */}
                <Popover
                  isVisible={activeMenuId === cat.id}
                  onRequestClose={() => setActiveMenuId(null)}
                  from={
                    <TouchableOpacity
                      onPress={() => setActiveMenuId(cat.id)}
                      className="p-2 -mr-2 items-center justify-center"
                    >
                      <MoreVertical size={20} className="text-muted-foreground" />
                    </TouchableOpacity>
                  }
                  backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                  popoverStyle={{
                    borderRadius: 14,
                    width: 170,
                    backgroundColor: "transparent",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  <View className="w-full bg-card rounded-xl border border-border overflow-hidden">
                    <TouchableOpacity
                      onPress={() => openEditModal(cat.id, cat.title)}
                      className="flex-row items-center px-4 py-3.5 border-b border-border"
                    >
                      <Edit3 size={18} className="text-foreground" />
                      <Text className="text-foreground font-semibold text-sm ml-2">
                        Rename
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(cat.id)}
                      className="flex-row items-center px-4 py-3.5"
                    >
                      <Trash2 size={18} className="text-destructive" />
                      <Text className="text-destructive font-semibold text-sm ml-2">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Popover>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Reusable Category Form Modal */}
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
                <View className="h-1 w-12 bg-border rounded-full" />
              </View>

              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-foreground">
                  {isEditing ? "Rename Category" : "New Category"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-muted p-2 rounded-full"
                >
                  <X size={20} className="text-muted-foreground" />
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-semibold text-muted-foreground mb-2">
                Category Name
              </Text>
              <TextInput
                value={categoryNameInput}
                onChangeText={setCategoryNameInput}
                placeholder="e.g. Travel, Utilities, Groceries"
                placeholderTextColor="#9CA3AF"
                className="w-full border border-border rounded-xl px-4 py-4 bg-muted/30 text-foreground text-base mb-6"
                autoFocus
              />

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  disabled={isSaving}
                  className={`flex-1 bg-muted rounded-xl py-4 items-center justify-center ${isSaving ? "bg-muted/50" : "bg-muted"}`}
                >
                  <Text className="text-foreground font-bold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveCategory}
                  disabled={isSaving}
                  className={`flex-1 rounded-xl py-4 items-center justify-center ${isSaving ? "bg-primary/50" : "bg-primary"}`}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base tracking-wide">
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