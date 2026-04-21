import { useDeleteCategory, useGetCategories } from "@/api/category";
import { CategoryModal } from "@/components/category/category-modal";
import { ManageCategoriesSkeleton } from "@/components/skeletons/manage-categories-skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ChevronLeft, Edit3, MoreVertical, Trash2 } from "@/lib/icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Popover from "react-native-popover-view";
import Toast from "react-native-toast-message";

export default function ManageCategoriesScreen() {
  const router = useRouter();

  // Modals & Forms State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // APIs
  const { data: categoriesResponse, isLoading } = useGetCategories();
  const categories = categoriesResponse?.data || [];
  const deleteCategoryMutation = useDeleteCategory();

  // Open the modal for Editing
  const openEditModal = (id: string, currentName: string) => {
    setActiveMenuId(null);
    setIsEditing(true);
    setEditingCategoryId(id);
    setEditingCategoryName(currentName);
    setModalVisible(true);
  };

  const handleDeleteCategory = (id: string) => {
    setActiveMenuId(null);
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete);
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
  };

  const handleClose = () => {
    setEditingCategoryName("");
    setIsEditing(false);
    setEditingCategoryId(null);
    setModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.back();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router]),
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Manage Categories",
          headerBackTitle: "Back",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-background">
        {/* Top Outline Add Button */}
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
            className="flex-1 px-5 mt-5"
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
                      <MoreVertical
                        size={20}
                        className="text-muted-foreground"
                      />
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
      <CategoryModal
        visible={modalVisible}
        onClose={handleClose}
        isEditing={isEditing}
        initialName={editingCategoryName}
        categoryId={editingCategoryId || undefined}
      />

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategoryConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteCategoryMutation.isPending}
      />
    </>
  );
}
