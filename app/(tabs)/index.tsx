import { useBooks, useDeleteBook } from "@/api/wallet";
import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import { ScreenContainer } from "@/components/screen-container";
import { WalletsSkeleton } from "@/components/skeletons/wallets-skeleton";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "expo-router";
import { Wallet } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [tempSortBy, setTempSortBy] = useState<SortOption>("updated_at");
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">("asc");

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
    Alert.alert(
      "Delete Wallet",
      `Are you sure you want to delete "${book.name}"? This action can not be undone and will remove all associated transactions.`,
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
          refreshControl={<RefreshControl {...refreshControlProps} />}
        >
          {/* Search Input */}
          <View className="relative mb-4">
            <View className="flex-row items-center bg-muted rounded-xl px-3 border border-border">
              <SearchIcon className="text-muted-foreground size-5" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t("wallets.searchWallets")}
                placeholderClassName="text-muted-foreground"
                className="flex-1 ml-2 text-base text-foreground"
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
          </View>

          {/* Header */}
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1">
              <Wallet className="text-primary size-5" />
              <Text className="text-sm font-semibold text-muted-foreground mr-2">
                {t("wallets.yourWallets")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={openSortModal}
              className="p-2 rounded-xl"
            >
              <FilterIcon className="text-primary size-6" />
            </TouchableOpacity>
          </View>

          {/* Books List */}
          {finalShowSkeleton ? (
            <WalletsSkeleton />
          ) : booksData?.data?.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                {t("wallets.noWallets")}
              </Text>
              <Text className="text-sm text-foreground text-center mb-4">
                {t("wallets.createWallet")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-white font-semibold">
                  {t("wallets.createWallet")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={booksData?.data}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 80 }}
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
          >
            Apply
          </Button>
        </View>
      </BottomSheetModal>
    </>
  );
}
