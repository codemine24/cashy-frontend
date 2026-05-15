import {
  useLeaveWallet,
  useRemoveMember,
  useWallet,
} from "@/api/wallet";
import { MemberCard } from "@/components/memeber/member-card";
import { ScreenContainer } from "@/components/screen-container";
import { MembersSkeleton } from "@/components/skeletons/members-skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/auth-context";
import { LeaveIcon } from "@/icons/leave-icon";
import { PlusIcon } from "@/icons/plus-icon";
import { Member } from "@/interface/wallet";
import { ChevronLeft } from "@/lib/icons";
import { isOwner } from "@/utils/is-owner";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function MembersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ walletId: string; bookName?: string }>();
  const router = useRouter();
  const walletId = params.walletId;

  const { data: bookData, isLoading: bookLoading } = useWallet(walletId);
  const { authState } = useAuth();
  const currentUserId = authState.user?.id;
  const isOwnerUser = isOwner(currentUserId, bookData?.data?.created_by);

  const membersList = (bookData?.data?.others_member || []) as Member[];

  const currentUserMember = membersList.find(
    (m: any) => m.id === currentUserId,
  );
  const isAdminUser = currentUserMember?.role === "ADMIN";

  const canManage = isOwnerUser || isAdminUser;

  const members = canManage
    ? membersList
    : membersList.filter(
        (m: any) => m.role === "OWNER" || m.id === currentUserId,
      );
  const removeMemberMutation = useRemoveMember();
  const leaveWalletMutation = useLeaveWallet();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleOpenAddModal = () => {
    router.push({
      pathname: "/wallet/member-form",
      params: { walletId },
    } as any);
  };

  const handleEditMember = (member: Member) => {
    router.push({
      pathname: "/wallet/member-form",
      params: {
        walletId,
        memberId: member.id,
        email: member.email || member.user?.email || member.name || "",
        role: member.role,
      },
    } as any);
  };

  const handleRemoveMember = (member: Member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!memberToDelete) return;
    try {
      const response = await removeMemberMutation.mutateAsync({
        wallet_id: walletId,
        user_id: memberToDelete.id,
      });
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Member removed successfully",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to remove member",
      });
    }
  };

  const handleLeaveBookConfirm = async () => {
    try {
      const response = await leaveWalletMutation.mutateAsync(walletId);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Successfully left the wallet",
        });
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to leave from this wallet",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate(`/wallet/${walletId}`);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router, walletId]),
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t("members.title"),
          headerBackTitle: "Back",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate(`/wallet/${walletId}`)}
              style={{ marginRight: 4 }}
            >
              <ChevronLeft size={26} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScreenContainer
        edges={["left", "right"]}
        className="bg-background relative"
      >
        {bookLoading ? (
          <MembersSkeleton />
        ) : (
          <FlatList
            contentContainerStyle={{
              padding: 16,
              paddingTop: 0,
              paddingBottom: 100,
            }}
            data={members}
            keyExtractor={(item, index) => item?.id?.toString() || `${index}`}
            renderItem={({ item }) => (
              <MemberCard
                member={item}
                onEdit={handleEditMember}
                onRemove={handleRemoveMember}
                canManage={canManage}
              />
            )}
            ListFooterComponent={
              !isOwnerUser ? (
                <View className="mt-4 px-1">
                  <Button
                    variant="outline"
                    className="border-destructive py-3"
                    onPress={() => setShowLeaveModal(true)}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-destructive font-semibold">
                        Leave This Wallet
                      </Text>
                      <LeaveIcon
                        style={{ color: "#ef4444", width: 20, height: 20 }}
                      />
                    </View>
                  </Button>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center p-8 mt-10">
                <Text className="text-muted-foreground text-center">
                  {t("members.noMembersAdded")}
                </Text>
              </View>
            }
          />
        )}
      </ScreenContainer>

      {/* Floating Action Button */}
      {canManage && (
        <Button
          onPress={handleOpenAddModal}
          className="rounded-full py-4 absolute right-4"
          style={{ bottom: insets.bottom + 32 }}
        >
          <PlusIcon className="text-primary-foreground size-6" />
          <Text
            className="text-primary-foreground text-lg text-center ml-2"
            numberOfLines={1}
          >
            {t("members.addMember")}
          </Text>
        </Button>
      )}

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleRemoveMemberConfirm}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToDelete?.email || memberToDelete?.user?.email || "this member"}?`}
        confirmText="Remove"
        cancelText="Cancel"
        isLoading={removeMemberMutation.isPending}
      />
      <ConfirmationModal
        visible={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveBookConfirm}
        title="Leave Wallet"
        message="Are you sure you want to leave this wallet? You will no longer have access to its transactions."
        confirmText="Leave"
        cancelText="Cancel"
        isLoading={leaveWalletMutation.isPending}
      />
    </>
  );
}
