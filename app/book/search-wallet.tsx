import { useBooks, useDeleteBook } from "@/api/book";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, X, Search } from "@/lib/icons";
import { WalletCard } from "@/components/wallet/wallet-card";
import { CreateWalletModal } from "@/components/wallet/create-wallet-modal";
import { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDebounce } from "@/hooks/use-debounce";
import { Book } from "@/interface/book";
import Toast from "react-native-toast-message";

export default function SearchWalletScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<TextInput>(null);
  const deleteBookMutation = useDeleteBook();

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteBook = (book: Book) => {
    Alert.alert(
      "Delete Wallet",
      `Are you sure you want to delete "${book.name}"? This action cannot be undone and will remove all associated transactions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res: any = await deleteBookMutation.mutateAsync(book.id);
              if (res?.success) {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Wallet deleted successfully",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: res?.message || "Failed to delete wallet",
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
        },
      ]
    );
  };
  const handleRename = (book: Book) => {
    setEditingBook({ id: book.id, name: book.name });
    setShowCreateModal(true);
  };

  const handleAddMember = (book: Book) => {
    router.push({
      pathname: "/book/members",
      params: { bookId: book.id, bookName: book.name },
    } as any);
  };

  // API-based search using the debounced query
  const { data: booksData, isLoading } = useBooks({
    search: debouncedQuery.trim() || undefined,
    sort: "updated_at",
    sort_order: "desc",
  });

  const books = booksData?.data ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerTitle: () => (
            <View className="flex-row items-center flex-1 mr-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-3 p-1"
              >
                <ArrowLeft size={22} className="text-foreground" />
              </TouchableOpacity>
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-1">
                <Search size={18} className="text-black" />
                <TextInput
                  ref={inputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search wallets..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-base text-gray-900"
                  autoFocus={true}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    className="ml-2 p-1"
                  >
                    <X size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ),
          headerTitleAlign: "left",
          headerShadowVisible: false,
        }}
      />
      <View className="flex-1 px-4 bg-background">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#00929A" />
          </View>
        ) : books.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Search size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-base mt-4">
              {debouncedQuery.trim()
                ? `No wallets found for "${debouncedQuery}"`
                : "Search your wallets"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item: book }) => (
              <WalletCard
                book={book}
                onRename={handleRename}
                onAddMember={handleAddMember}
                onDelete={handleDeleteBook}
              />
            )}
          />
        )}
      </View>

      {/* Create / Edit Book Modal */}
      <CreateWalletModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingBook(null);
        }}
        editBook={editingBook}
      />
    </>
  );
}