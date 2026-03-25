import { useBooks, useDeleteBook } from "@/api/wallet";
import { ScreenContainer } from "@/components/screen-container";
import { WalletsSkeleton } from "@/components/skeletons/wallets-skeleton";
import { Button } from "@/components/ui/button";
import { H3, Muted } from "@/components/ui/typography";
import { CreateWalletModal } from "@/components/wallet/create-wallet-modal";
import { WalletCard } from "@/components/wallet/wallet-card";
import { CrossIcon } from "@/icons/cross-icon";
import { FilterIcon } from "@/icons/filter-icon";
import { PlusIcon } from "@/icons/plus-icon";
import { Book } from "@/interface/wallet";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

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
  const [searchQuery, setSearchQuery] = useState("");

  const [tempSortBy, setTempSortBy] = useState<SortOption>("updated_at");
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">("desc");

  const openSortModal = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setShowSortModal(true);
  };

  const {
    data: booksData,
    isLoading,
    refetch,
  } = useBooks({ search: searchQuery, sort: sortBy, sort_order: sortOrder });

  const deleteBookMutation = useDeleteBook();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
      ],
    );
  };

  const handleRename = (book: Book) => {
    setEditingBook({ id: book.id, name: book.name });
    setShowCreateModal(true);
  };

  const handleAddMember = (book: Book) => {
    router.push({
      pathname: "/wallet/members",
      params: { bookId: book.id, bookName: book.name },
    } as any);
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
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search wallets..."
              placeholderTextColor="#A1A1AA"
              className="bg-surface rounded-xl px-4 py-3 border border-red-500 text-foreground"
            />
          </View>

          {/* Header */}
          <View className="mb-2 flex-row items-center">
            <Text className="text-sm font-semibold text-muted-foreground">
              YOUR WALLETS
            </Text>
            <TouchableOpacity
              onPress={openSortModal}
              className="ml-2 p-2.5 rounded-xl"
            >
              <FilterIcon className="text-primary size-6" />
            </TouchableOpacity>
          </View>

          {/* Books List */}
          {isLoading ? (
            <WalletsSkeleton />
          ) : booksData?.data?.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No wallets yet
              </Text>
              <Text className="text-sm text-foreground text-center mb-4">
                Create your first wallet to start tracking expenses
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-white font-semibold">Create Wallet</Text>
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
              )}
            />
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
          Add wallet
        </Text>
      </Button>

      {/* Create / Edit Wallet Modal */}
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
          <View
            className="bg-background rounded-t-3xl px-6 pt-3"
            style={{ paddingBottom: 30 }}
          >
            {/* Handle */}
            <View className="items-center mb-5">
              <View className="w-10 h-1 rounded-full bg-foreground" />
            </View>

            {/* Title */}
            <View className="flex-row items-center justify-between mb-2  border-b border-border pb-4">
              <H3>Sort wallet by</H3>
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
        </View>
      </Modal>
    </>
  );
}
