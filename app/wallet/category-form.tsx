import { useCreateCategory, useUpdateCategory } from "@/api/category";
import { CategoryForm } from "@/components/category/category-form";
import { ScreenContainer } from "@/components/screen-container";
import { ChevronLeft } from "@/lib/icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

export default function CategoryFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryId?: string;
    name?: string;
    icon?: string;
    color?: string;
  }>();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const isEdit = !!params.categoryId;
  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const handleSubmit = async (payload: {
    title: string;
    icon: string;
    color: string;
  }) => {
    try {
      if (isEdit && params.categoryId) {
        await updateCategoryMutation.mutateAsync({
          id: params.categoryId,
          category: payload,
        });
      } else {
        await createCategoryMutation.mutateAsync(payload);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Category ${isEdit ? "updated" : "created"} successfully`,
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    }
  };

  return (
    <ScreenContainer edges={["left", "right"]} className="bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEdit ? "Edit Category" : "New Category",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 4 }}>
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />

      <CategoryForm
        mode={isEdit ? "edit" : "create"}
        initialName={params.name ?? ""}
        initialIcon={params.icon ?? "📝"}
        initialColor={params.color ?? ""}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </ScreenContainer>
  );
}
