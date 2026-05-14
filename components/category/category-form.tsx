import { Button } from "@/components/ui/button";
import { InputError } from "@/components/ui/input-error";
import { Check, X } from "@/lib/icons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialName?: string;
  initialIcon?: string;
  initialColor?: string;
  isSubmitting?: boolean;
  onSubmit: (payload: { title: string; icon: string; color: string }) => Promise<void> | void;
};

export const COMMON_COLORS = [
  "#00929A",
  "#F43F5E",
  "#EC4899",
  "#D946EF",
  "#A855F7",
  "#8B5CF6",
  "#6366F1",
  "#3B82F6",
  "#0EA5E9",
  "#06B6D4",
  "#14B8A6",
  "#10B981",
  "#22C55E",
  "#84CC16",
  "#EAB308",
  "#F59E0B",
  "#F97316",
  "#EF4444",
];

export const COMMON_ICONS = [
  "🍔",
  "🍕",
  "🍜",
  "🍲",
  "🍿",
  "🍪",
  "🍩",
  "🍫",
  "☕",
  "🍺",
  "✈️",
  "🏨",
  "🌍",
  "🗺️",
  "🚗",
  "🚘",
  "🚕",
  "🚌",
  "🚲",
  "⛽",
  "👗",
  "👠",
  "👜",
  "👔",
  "🛍️",
  "🛒",
  "🍎",
  "🥦",
  "💄",
  "💎",
  "💖",
  "🎁",
  "❤️",
  "🧕",
  "🩱",
  "👑",
  "🏠",
  "🏢",
  "🔑",
  "🛌",
  "💡",
  "💧",
  "🧾",
  "📄",
  "📃",
  "💵",
  "💸",
  "💰",
  "💳",
  "🏧",
  "🏦",
  "💼",
  "📈",
  "📉",
  "💹",
  "📱",
  "💻",
  "📷",
  "🔋",
  "⚙️",
  "🧱",
  "💊",
  "🏥",
  "🏃",
  "🧘",
  "🎬",
  "🎮",
  "🎤",
  "📚",
  "🎓",
  "🎨",
  "🎹",
  "🎸",
];

export function CategoryForm({
  mode,
  initialName = "",
  initialIcon = "📝",
  initialColor = "",
  isSubmitting = false,
  onSubmit,
}: CategoryFormProps) {
  const inputRef = useRef<TextInput>(null);
  const [title, setTitle] = useState(initialName);
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "📝");
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(initialName);
    setSelectedIcon(initialIcon || "📝");
    setSelectedColor(initialColor);
  }, [initialColor, initialIcon, initialName]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Category name is required");
      return;
    }

    if (trimmedTitle.length > 50) {
      setError("Category name must be at most 50 characters");
      return;
    }

    setError("");
    await onSubmit({
      title: trimmedTitle,
      icon: selectedIcon,
      color: selectedColor,
    });
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 112,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          <View
            className={`w-16 h-16 rounded-2xl items-center justify-center border border-border ${
              selectedColor ? "" : "bg-primary/10"
            }`}
            style={selectedColor ? { backgroundColor: selectedColor } : undefined}
          >
            <Text className="text-3xl">{selectedIcon}</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground mt-4">
            {mode === "edit" ? "Edit Category" : "New Category"}
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-2 px-4">
            Choose an icon and color that makes this category easy to spot.
          </Text>
        </View>

        <Text className="text-sm font-semibold text-foreground mb-2">
          Category name
        </Text>
        <TextInput
          ref={inputRef}
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (error) setError("");
          }}
          placeholder="e.g. Travel, Utilities, Groceries"
          placeholderTextColor="#94a3b8"
          editable={!isSubmitting}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          className={`rounded-xl px-4 py-4 border bg-card text-foreground text-base ${
            error ? "border-destructive" : "border-border"
          }`}
        />
        <InputError error={error} />

        <Text className="text-sm font-semibold text-foreground mt-6 mb-3">
          Icon
        </Text>
        <View className="bg-card rounded-xl border border-border">
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ padding: 12 }}
          >
            <View className="flex-row gap-2">
              {COMMON_ICONS.map((icon, index) => {
                const isSelected = selectedIcon === icon;
                return (
                  <TouchableOpacity
                    key={`${icon}-${index}`}
                    onPress={() => setSelectedIcon(icon)}
                    disabled={isSubmitting}
                    className={`w-12 h-12 items-center justify-center rounded-xl border ${
                      isSelected
                        ? "bg-primary/15 border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text className="text-2xl">{icon}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <Text className="text-sm font-semibold text-foreground mt-6 mb-3">
          Color
        </Text>
        <View className="bg-card rounded-xl border border-border">
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ padding: 12 }}
          >
            <View className="flex-row gap-3 items-center">
              <TouchableOpacity
                onPress={() => setSelectedColor("")}
                disabled={isSubmitting}
                className={`w-11 h-11 items-center justify-center rounded-full ${
                  selectedColor === ""
                    ? "border-2 border-primary"
                    : "border border-border"
                }`}
              >
                <X size={18} className="text-muted-foreground" />
              </TouchableOpacity>

              {COMMON_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    disabled={isSubmitting}
                    className={`w-11 h-11 items-center justify-center rounded-full ${
                      isSelected
                        ? "border-2 border-primary"
                        : "border border-border"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected ? <Check size={18} color="#ffffff" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-6 border-t border-border">
        <Button disabled={isSubmitting} onPress={handleSubmit}>
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save Category"
              : "Create Category"}
        </Button>
      </View>
    </View>
  );
}
