import { useDeleteTransaction, useTransaction } from "@/api/transaction";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Copy,
  Download,
  Edit3,
  MessageSquare,
  Share2,
  Tag,
  Trash2,
  X,
} from "@/lib/icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppModal } from "@/components/app-modal";
import { TransactionDetailSkeleton } from "@/components/skeletons/transaction-detail-skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { makeImageUrl } from "@/utils/helper";
import { File as ExpoFile, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";

// ── helper: format a UTC timestamp string into local date + time ─────────────
// new Date(utcString) automatically converts the UTC value from Supabase
// into the device's local timezone — works correctly for all timezones worldwide.
function formatDateTime(utcString?: string): { date: string; time: string } {
  if (!utcString) return { date: "—", time: "—" };

  const d = new Date(utcString);

  return {
    date: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: d
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .toLowerCase(),
  };
}

// ── helper: avatar (real image or initials fallback) ─────────────────────────
function Avatar({
  name,
  avatarFile,
  size = 36,
}: {
  name?: string;
  avatarFile?: string;
  size?: number;
}) {
  const uri = avatarFile ? makeImageUrl(avatarFile, "user") : undefined;

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-muted items-center justify-center overflow-hidden"
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text
          style={{ fontSize: size * 0.36 }}
          className="font-bold text-muted-foreground"
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

// ── helpers: divider + info row ──────────────────────────────────────────────
function Divider() {
  return <View className="h-[1px] bg-border mx-5" />;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center px-5 py-3.5 gap-3.5">
      <View className="w-5 items-center">{icon}</View>
      <Text className="flex-1 text-sm text-muted-foreground">{label}</Text>
      <Text
        className="text-sm font-semibold text-foreground max-w-[55%] text-right"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

// ── main screen ──────────────────────────────────────────────────────────────
export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    transactionId: string;
  }>();

  const { authState } = useAuth();
  const { isDark } = useTheme();
  const {
    data: txData,
    isLoading,
    refetch,
  } = useTransaction(params.transactionId!);
  const deleteTransaction = useDeleteTransaction();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const transaction = txData?.data;
  const canDelete =
    !!authState.user?.id && authState.user.id === transaction?.entry_by_id;
  const isIn = transaction?.type === "IN";
  const headerBgClass = isIn ? "bg-success" : "bg-destructive";
  const accentTextClass = isIn ? "text-success" : "text-destructive";
  const typeLabel = isIn ? "Cash In" : "Cash Out";
  const headerJsColor = isIn ? "#16a34a" : "#dc2626";

  // Single source of truth for date/time formatting.
  // formatDateTime converts the UTC timestamp from Supabase to the user's local timezone.
  const { date: createdDate, time: createdTime } = formatDateTime(
    transaction?.created_at,
  );
  const { date: updatedDate, time: updatedTime } = formatDateTime(
    transaction?.updated_at,
  );

  const handleEdit = () => {
    router.push({
      pathname: "/wallet/add-transaction",
      params: {
        bookId: params.bookId,
        type: transaction?.type,
        editId: params.transactionId,
        editAmount: transaction?.amount?.toString(),
        editRemark: transaction?.remark || "",
        editType: transaction?.type,
        editDate: transaction?.created_at,
        editTime: transaction?.created_at,
        editCategoryId: transaction?.category_id || "",
        editCategoryName: transaction?.category?.title || "",
        attachments: transaction?.attachment || [],
      },
    });
  };

  const handleDuplicate = () => {
    router.push({
      pathname: "/wallet/add-transaction",
      params: {
        bookId: params.bookId,
        type: transaction?.type,
        editAmount: transaction?.amount?.toString(),
        editRemark: transaction?.remark || "",
        editType: transaction?.type,
        editDate: transaction?.created_at,
        editTime: transaction?.created_at,
        editCategoryId: transaction?.category_id || "",
        editCategoryName: transaction?.category?.title || "",
      },
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res: any = await deleteTransaction.mutateAsync(
        params.transactionId,
      );

      if (res?.success) {
        Toast.show({
          type: "success",
          text1: "Transaction deleted successfully",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: res?.message || "Failed to delete transaction",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to delete transaction",
      });
    }
  };

  const handleShare = async () => {
    if (!selectedImage) return;

    try {
      const downloadRes = await ExpoFile.downloadFileAsync(
        selectedImage,
        Paths.cache,
        { idempotent: true },
      );

      if (!downloadRes) throw new Error("Download failed");

      const available = await Sharing.isAvailableAsync();

      if (available) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Toast.show({
          type: "error",
          text1: "Sharing not available",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to share attachment",
      });
    }
  };

  const handleDownload = async () => {
    if (!selectedImage) return;

    try {
      setIsDownloading(true);

      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Permission required",
          text2: "Allow media access to download files",
        });
        return;
      }

      const downloadRes = await ExpoFile.downloadFileAsync(
        selectedImage,
        Paths.cache,
        { idempotent: true },
      );

      if (!downloadRes) throw new Error("Download failed");

      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);

      await MediaLibrary.createAlbumAsync("WalletApp", asset, false);

      Toast.show({
        type: "success",
        text1: "Download successful",
        text2: "Saved to gallery",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Download failed",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate(`/wallet/${params.bookId}`);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router, params.bookId]),
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Transaction Details",
          headerStyle: {
            backgroundColor: isLoading
              ? isDark
                ? "#111827"
                : "#ffffff"
              : headerJsColor,
          },
          headerTintColor: isLoading
            ? isDark
              ? "#ffffff"
              : "#000000"
            : "#fff",
          headerTitleStyle: {
            color: isLoading ? (isDark ? "#ffffff" : "#000000") : "#fff",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate(`/wallet/${params.bookId}`)}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-2">
              {!isLoading && (
                <>
                  <TouchableOpacity
                    onPress={handleEdit}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Edit3 size={20} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDuplicate}
                    className="p-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Copy size={20} color="#ffffff" />
                  </TouchableOpacity>
                </>
              )}
              {canDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="p-2"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2
                    size={20}
                    color={
                      isLoading ? (isDark ? "#ffffff" : "#000000") : "#ffffff"
                    }
                  />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />

      <View className={`flex-1 ${isLoading ? "bg-background" : headerBgClass}`}>
        {isLoading ? (
          <TransactionDetailSkeleton />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
                colors={["#ffffff"]}
              />
            }
          >
            {/* ── Colored Header: Amount ── */}
            <View className="items-center pt-7 pb-9 px-6">
              <Text
                className="text-white/95 text-xs font-semibold tracking-widest uppercase mb-2"
                numberOfLines={1}
              >
                {typeLabel}
              </Text>
              <Text className="text-white text-5xl font-extrabold tracking-tight">
                {transaction?.amount}
              </Text>
            </View>

            {/* ── Receipt Sheet ── */}
            <View className="flex-1 bg-card rounded-t-[28px] pt-2 pb-10">
              {/* Drag handle decoration */}
              <View className="w-9 h-1 rounded-full bg-border self-center mb-5" />

              {/* Section: Details */}
              <Text className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase px-5 mb-1">
                Details
              </Text>

              <InfoRow
                icon={<Tag size={16} className="text-muted-foreground" />}
                label="Category"
                value={transaction?.category?.title || "Uncategorized"}
              />
              <Divider />
              <InfoRow
                icon={
                  <MessageSquare size={16} className="text-muted-foreground" />
                }
                label="Remark"
                value={transaction?.remark || "No remark"}
              />
              <Divider />
              <InfoRow
                icon={<Calendar size={16} className="text-muted-foreground" />}
                label="Created At"
                value={`${createdDate} ${createdTime}`}
              />
              <Divider />
              <InfoRow
                icon={<Calendar size={16} className="text-muted-foreground" />}
                label="Last Update"
                value={`${updatedDate} ${updatedTime}`}
              />
              <Divider />
              <InfoRow
                icon={<BookOpen size={16} className="text-muted-foreground" />}
                label="Wallet"
                value={transaction?.book?.name || "—"}
              />

              {/* Section: Activity */}
              <Text className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase px-5 mt-7 mb-1">
                Activity
              </Text>

              {/* Added by */}
              <View className="flex-row items-center px-5 py-3.5 gap-3.5">
                <Avatar
                  name={transaction?.entry_by?.name}
                  avatarFile={transaction?.entry_by?.avatar}
                />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-foreground">
                    {transaction?.entry_by?.name || "—"}
                  </Text>
                  {transaction?.entry_by?.email ? (
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {transaction.entry_by.email}
                    </Text>
                  ) : null}
                </View>
                <View className="items-end">
                  <Text
                    className={`text-[11px] font-semibold mb-0.5 ${accentTextClass}`}
                  >
                    Added
                  </Text>
                  <Text className="text-[11px] text-muted-foreground">
                    {createdDate}
                  </Text>
                </View>
              </View>

              {transaction?.updated_by && (
                <>
                  <Divider />
                  <View className="flex-row items-center px-5 py-3.5 gap-3.5">
                    <Avatar
                      name={transaction.updated_by.name}
                      avatarFile={transaction.updated_by.avatar}
                    />
                    <View className="flex-1">
                      <Text className="text-[13px] font-semibold text-foreground">
                        {transaction.updated_by.name || "—"}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {transaction.updated_by.email}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[11px] font-semibold text-amber-500 mb-0.5">
                        Updated
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        {updatedDate}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {transaction?.attachment?.length > 0 && (
                <>
                  <Divider />
                  <View className="flex-row items-center px-5 py-3.5 gap-3.5">
                    <View className="w-5 items-center">
                      <BookOpen size={18} color="#6b7280" />
                    </View>
                    <Text className="flex-1 text-sm text-muted-foreground">
                      Attachment
                    </Text>
                    <View className="items-end">
                      <Text className="text-[11px] text-muted-foreground">
                        {transaction.attachment.length} file(s)
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center px-5 gap-3.5">
                    {transaction.attachment.map((item: any, index: number) => {
                      const imageUrl = makeImageUrl(item, "general");
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setSelectedImage(imageUrl);
                            setShowModal(true);
                          }}
                        >
                          <Image
                            source={{ uri: imageUrl }}
                            className="size-16 rounded-lg bg-muted"
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      <AppModal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          {/* Close Area */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowModal(false)}
            className="absolute inset-0"
          />

          {/* Header */}
          <View className="absolute top-0 left-0 right-0 p-6 flex-row justify-between items-center z-10">
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
            >
              <X size={24} color="#ffffff" />
            </TouchableOpacity>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
              >
                <Share2 size={22} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDownload}
                disabled={isDownloading}
                className={`size-10 bg-white/10 rounded-full items-center justify-center ${isDownloading ? "opacity-50" : ""}`}
              >
                <Download size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image */}
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: "90%", height: "70%" }}
              resizeMode="contain"
            />
          )}

          {/* Footer/Info */}
          <View className="absolute bottom-10 left-0 right-0 items-center">
            <Text className="text-white/60 text-xs tracking-widest uppercase">
              Attachment Preview
            </Text>
          </View>
        </View>
      </AppModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        isLoading={deleteTransaction.isPending}
      />
    </>
  );
}
