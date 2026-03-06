import { useBooks } from "@/api/book";
import { CreateWalletModal } from "@/components/wallet/create-wallet-modal";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WalletCard } from "@/components/wallet/wallet-card";
import { Plus, ArrowUpDown, Search } from "@/lib/icons";
// import { useGetAllUsers } from "@/api/user";
import { Book } from "@/interface/book";

type SortOption = "name" | "created_at" | "updated_at";

const SORT_OPTIONS: { key: SortOption; label: string; order: "asc" | "desc" }[] = [
  { key: "name", label: "Name (A-Z)", order: "asc" },
  { key: "created_at", label: "Last Created", order: "desc" },
  { key: "updated_at", label: "Last Updated", order: "desc" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [tempSortBy, setTempSortBy] = useState<SortOption>("updated_at");
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">("desc");

  const openSortModal = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setShowSortModal(true);
  };

  const { data: booksData, isLoading } = useBooks({ search: "", sort: sortBy, sort_order: sortOrder });

  const handleDeleteBook = (book: Book) => {
    // Add real delete logic here later
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

  return (
    <>
      <ScreenContainer edges={["left", "right"]} className="p-4 bg-background">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">
                Wallets
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Create separate wallets to organize your expenses
              </Text>
            </View>

            {/* Sort & Search Buttons */}
            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                onPress={openSortModal}
                className="p-2.5 rounded-xl bg-foreground"
              >
                <ArrowUpDown size={20} className="text-muted" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/search-wallet" as any)}
                className="p-2.5 rounded-xl bg-foreground"
              >
                <Search size={20} className="text-muted" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Books List */}
          {isLoading ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-foreground">Loading...</Text>
            </View>
          ) : booksData?.data?.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No wallets yet
              </Text>
              <Text className="text-sm text-muted text-center mb-4">
                Create your first wallet to start tracking expenses
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-foreground font-semibold">Create Wallet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={booksData?.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item: book }) => (
                <WalletCard
                  book={book}
                  onRename={handleRename}
                  onAddMember={handleAddMember}
                  onDelete={handleDeleteBook}
                />
              )
              }
            />
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Button */}
      <View className="absolute bottom-8 right-4">
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="bg-primary p-4 rounded-full items-center justify-center flex-row gap-3 shadow-sm"
        >
          <Plus size={20} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-bold text-xl tracking-widest text-center">
            Add New Wallet
          </Text>
        </TouchableOpacity>
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

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <View className="flex-1 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View className="bg-background rounded-t-3xl px-6 pt-3" style={{ paddingBottom: 30 }}>
            {/* Handle */}
            <View className="items-center mb-5">
              <View className="w-10 h-1 rounded-full bg-foreground" />
            </View>

            {/* Title */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-foreground">Sort By</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                className="p-1"
              >
                <Text className="text-sm text-foreground">Close</Text>
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
                      className={`size-5 items-center justify-center border border-foreground rounded-full mr-3 ${isActive ? "border-primary" : "border-border"}`}
                    >
                      {isActive && (
                        <View className="size-3 rounded-full bg-primary" />
                      )}
                    </View>
                    <Text
                      className="text-xl font-semibold text-foreground"
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => {
                setSortBy(tempSortBy);
                setSortOrder(tempSortOrder);
                setShowSortModal(false);
              }}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-base font-bold tracking-wider">
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}