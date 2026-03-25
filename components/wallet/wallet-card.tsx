import { useAuth } from "@/context/auth-context";
import { Book } from "@/interface/wallet";
import { BookIcon, Edit3, MoreVertical, Trash2, UserPlus } from "@/lib/icons";
import { formatUpdateDate } from "@/utils";
import { isOwner } from "@/utils/is-owner";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Popover from "react-native-popover-view";

interface WalletCardProps {
  book: Book;
  onRename?: (book: Book) => void;
  onAddMember?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export const WalletCard = ({
  book,
  onRename,
  onAddMember,
  onDelete,
}: WalletCardProps) => {
  const router = useRouter();
  const { authState } = useAuth();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const isCurrentUserOwner = isOwner(authState.user?.id, book.created_by);

  const handleAction = (action?: (book: Book) => void) => {
    setIsMenuVisible(false);
    if (action) {
      // Small timeout to allow popover to close before opening other modals
      setTimeout(() => {
        action(book);
      }, 100);
    }
  };

  // If no action props are passed, hide the 3-dot menu entirely (e.g., in Search screen)
  const showMenu = !!(onRename || onAddMember || onDelete);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/wallet/${book.id}` as any)}
      className="bg-card rounded-2xl p-3 mt-3 border border-border active:opacity-70 flex-row items-center justify-between"
    >
      {/* Left: Icon and Name/Date */}
      <View className="flex-row items-center flex-1">
        <View className="size-13 items-center justify-center rounded-2xl mr-4 bg-primary/10">
          <BookIcon size={26} className="text-primary" />
        </View>
        <View className="flex-1 mr-4">
          <Text className="text-foreground font-bold text-lg" numberOfLines={1}>
            {book.name}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            {formatUpdateDate(book.updated_at)}
          </Text>
        </View>
      </View>

      {/* Right: Amount and Options Menu */}
      <View className="flex-row items-center">
        <Text
          className={`font-semibold mr-1 ${
            book.balance > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(book.balance || 0)}
        </Text>

        {showMenu && (
          <Popover
            isVisible={isMenuVisible}
            onRequestClose={() => setIsMenuVisible(false)}
            from={
              <TouchableOpacity
                onPress={() => setIsMenuVisible(true)}
                className="py-2 pl-2 rounded-full"
              >
                <MoreVertical size={20} className="text-foreground" />
              </TouchableOpacity>
            }
            popoverStyle={{
              borderRadius: 8,
              backgroundColor: "#ffffff",
              paddingVertical: 12,
              paddingHorizontal: 16,
              width: 220,
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 8,
              borderColor: "#e5e7eb",
            }}
            backgroundStyle={{
              backgroundColor: "transparent",
            }}
          >
            <View className="bg-surface flex flex-col gap-4">
              {onRename && (
                <TouchableOpacity
                  onPress={() => handleAction(onRename)}
                  className="flex-row items-center"
                  disabled={!isCurrentUserOwner}
                  style={{ opacity: isCurrentUserOwner ? 1 : 0.4 }}
                >
                  <Edit3 size={20} className="text-black" />
                  <Text className="ml-4 text-[16px] text-black">Rename</Text>
                </TouchableOpacity>
              )}

              {onAddMember && (
                <TouchableOpacity
                  onPress={() => handleAction(onAddMember)}
                  className="flex-row items-center"
                  disabled={!isCurrentUserOwner}
                  style={{ opacity: isCurrentUserOwner ? 1 : 0.4 }}
                >
                  <UserPlus size={20} className="text-black" />
                  <Text className="ml-4 text-[16px] text-black">
                    Add Members
                  </Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  onPress={() => handleAction(onDelete)}
                  className="flex-row items-center mt-1"
                  disabled={!isCurrentUserOwner}
                  style={{ opacity: isCurrentUserOwner ? 1 : 0.4 }}
                >
                  <Trash2 size={20} className="text-red-500" />
                  <Text className="ml-4 text-[16px] text-red-500">
                    Delete Wallet
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Popover>
        )}
      </View>
    </TouchableOpacity>
  );
};
