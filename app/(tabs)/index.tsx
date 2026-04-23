import { useBooks, useDeleteBook } from "@/api/wallet";
import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import { ScreenContainer } from "@/components/screen-container";
import { WalletsSkeleton } from "@/components/skeletons/wallets-skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { H3, Muted } from "@/components/ui/typography";
import { CreateWalletModal } from "@/components/wallet/create-wallet-modal";
import { WalletCard } from "@/components/wallet/wallet-card";
import { useDebounce } from "@/hooks/use-debounce";
import { usePullToRefreshSkeletonWithSearch } from "@/hooks/use-pull-to-refresh-skeleton";
import { CrossIcon } from "@/icons/cross-icon";
import { FilterIcon } from "@/icons/filter-icon";
import { PlusIcon } from "@/icons/plus-icon";
import { SearchIcon } from "@/icons/search-icon";
import { Book } from "@/interface/wallet";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type SortOption = "name" | "created_at" | "updated_at";

const SORT_OPTIONS = (
  t: (key: string) => string,
): {
  key: SortOption;
  label: string;
  order: "asc" | "desc";
}[] => [
  { key: "updated_at", label: t("wallets.lastUpdated"), order: "desc" },
  { key: "name", label: t("wallets.nameAZ"), order: "asc" },
  { key: "created_at", label: t("wallets.lastCreated"), order: "desc" },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

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
  } = useBooks({
    search: debouncedSearchQuery.trim() || undefined,
    sort: sortBy,
    sort_order: sortOrder,
  });

  const deleteBookMutation = useDeleteBook();

  const { showSkeleton, refreshControlProps } =
    usePullToRefreshSkeletonWithSearch(async () => {
      await refetch();
    }, debouncedSearchQuery.trim());

  // Show skeleton when initially loading or refreshing
  const finalShowSkeleton = isLoading || showSkeleton;

  const handleDeleteBook = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      const res: any = await deleteBookMutation.mutateAsync(bookToDelete.id);
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
    } finally {
      setBookToDelete(null);
    }
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

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setShowExitModal(true);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  return (
    <>
      <ScreenContainer
        edges={["left", "right"]}
        className="p-4 pb-0 bg-background"
      >
        <FlatList
          data={finalShowSkeleton ? [] : booksData?.data}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl {...refreshControlProps} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <View className="mb-4">
              <View className="relative flex-row items-center gap-2">
                <View className="flex-row items-center bg-muted rounded-xl px-3 border border-border flex-1">
                  <SearchIcon className="text-muted-foreground size-4" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t("wallets.searchWallets")}
                    placeholderClassName="text-muted-foreground"
                    className="flex-1 text-base text-foreground"
                    placeholderTextColor="#94a3b8"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery("")}
                      className="ml-2 p-1"
                    >
                      <CrossIcon className="text-muted-foreground size-4" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  onPress={openSortModal}
                  className="size-12 bg-muted rounded-xl border border-border items-center justify-center"
                >
                  <FilterIcon className="text-primary size-5" />
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            finalShowSkeleton ? (
              <WalletsSkeleton />
            ) : booksData?.data?.length === 0 ? (
              <View className="flex-1 justify-center items-center py-8 mt-12">
                <SearchIcon className="text-muted-foreground size-12" />
                <Text
                  numberOfLines={1}
                  className="text-muted-foreground mt-2 text-base"
                >
                  {searchQuery.trim()
                    ? `No wallet found for "${searchQuery}"`
                    : t("wallets.noWallets")}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm text-muted-foreground text-center mb-4"
                >
                  {t("wallets.createFirstWallet")}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item: book, index }) => (
            <WalletCard
              book={book}
              index={index}
              onRename={handleRename}
              onAddMember={handleAddMember}
              onDelete={handleDeleteBook}
            />
          )}
        />
      </ScreenContainer>

      {/* Floating Action Button */}

      <Button
        onPress={() => setShowCreateModal(true)}
        className="rounded-full py-4 absolute bottom-4 right-4"
      >
        <PlusIcon className="text-primary-foreground size-6" />
        <Text
          className="text-primary-foreground text-lg text-center ml-2"
          numberOfLines={1}
        >
          {t("wallets.addWallet")}
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
      <BottomSheetModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
      >
        <View className="px-6 pt-3" style={{ paddingBottom: 30 }}>
          {/* Handle */}
          <View className="items-center mb-5">
            <View className="w-10 h-1 rounded-full bg-foreground" />
          </View>

          {/* Title */}
          <View className="flex-row items-center justify-between mb-2  border-b border-border pb-4">
            <H3>{t("wallets.sortWalletBy")}</H3>
            <TouchableOpacity
              onPress={() => setShowSortModal(false)}
              className="p-1"
            >
              <CrossIcon className="size-4 text-foreground" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="mb-5">
            {SORT_OPTIONS(t).map((option, index) => {
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
            style={{ marginBottom: Math.min(insets.bottom, 20) }}
          >
            Apply
          </Button>
        </View>
      </BottomSheetModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteBook}
        title="Delete Wallet"
        itemName={bookToDelete?.name}
        message="This action cannot be undone and will remove all associated transactions."
        isLoading={deleteBookMutation.isPending}
      />

      {/* Exit Confirmation Modal */}
      <ConfirmationModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => BackHandler.exitApp()}
        title="Exit App"
        message="Are you sure you want to exit the app?"
        confirmText="Exit"
      />
    </>
  );
}
