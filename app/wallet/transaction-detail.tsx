import { useDeleteTransaction, useTransaction } from "@/api/transaction";
import {
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Edit3,
  MessageSquare,
  Tag,
  Trash2,
} from "@/lib/icons";
import { formatCurrency } from "@/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { TransactionDetailSkeleton } from "@/components/skeletons/transaction-detail-skeleton";
import { useAuth } from "@/context/auth-context";
import Toast from "react-native-toast-message";

// ── helper: avatar (real image or initials fallback) ─────────────────────────
const SUPABASE_AVATAR_BASE =
  "https://uxrythodzgdirjlbmkxx.supabase.co/storage/v1/object/public/user/";

function Avatar({
  name,
  avatarFile,
  size = 36,
}: {
  name?: string;
  avatarFile?: string;
  size?: number;
}) {
  const uri = avatarFile ? `${SUPABASE_AVATAR_BASE}${avatarFile}` : undefined;
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
  const { data: txData, isLoading, refetch } = useTransaction(params.transactionId!);
  const deleteTransaction = useDeleteTransaction();

  const [refreshing, setRefreshing] = useState(false);

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
  // JS colors for the navigation header
  const headerJsColor = isIn ? "#16a34a" : "#dc2626";

  const formattedDate = transaction?.created_at
    ? new Date(transaction.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "—";

  const formattedTime = transaction?.created_at
    ? new Date(transaction.created_at)
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .toLowerCase()
    : "—";

  const updatedDate = transaction?.updated_at
    ? new Date(transaction.updated_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "—";

  const updatedTime = transaction?.updated_at
    ? new Date(transaction.updated_at)
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .toLowerCase()
    : "—";

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
      },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: "Back",
          title: "Transaction Detail",
          headerStyle: { backgroundColor: headerJsColor },
          headerTintColor: "#fff",
          headerTitleStyle: { color: "#fff", fontWeight: "700" },
          headerRight: () => (
            <View className="flex-row items-center gap-1">
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
              {canDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="p-2"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={20} color="#fca5a5" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />

      <View className={`flex-1 ${headerBgClass}`}>
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
              <Text className="text-white/75 text-xs font-semibold tracking-widest uppercase mb-2">
                {typeLabel}
              </Text>
              <Text className="text-white text-5xl font-extrabold tracking-tight">
                {isIn ? "+" : "-"}
                {formatCurrency(parseFloat(transaction?.amount || "0"))}
              </Text>
              <Text className="text-white/65 text-sm mt-2">
                {formattedDate} · {formattedTime}
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
                icon={<MessageSquare size={16} className="text-muted-foreground" />}
                label="Remark"
                value={transaction?.remark || "No remark"}
              />
              <Divider />
              <InfoRow
                icon={<Calendar size={16} className="text-muted-foreground" />}
                label="Date"
                value={formattedDate}
              />
              <Divider />
              <InfoRow
                icon={<Clock size={16} className="text-muted-foreground" />}
                label="Time"
                value={formattedTime}
              />
              <Divider />
              <InfoRow
                icon={<BookOpen size={16} className="text-muted-foreground" />}
                label="Book"
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
                  <Text className={`text-[11px] font-semibold mb-0.5 ${accentTextClass}`}>
                    Added
                  </Text>
                  <Text className="text-[11px] text-muted-foreground">
                    {formattedDate}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground">
                    {formattedTime}
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
                      <Text className="text-[11px] text-muted-foreground">
                        {updatedTime}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}