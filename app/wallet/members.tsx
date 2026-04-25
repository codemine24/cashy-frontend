import {
  useBook,
  useLeaveBook,
  useRemoveMember,
  useShareBook,
} from "@/api/wallet";
import { MemberCard } from "@/components/memeber/member-card";
import { ScreenContainer } from "@/components/screen-container";
import { MembersSkeleton } from "@/components/skeletons/members-skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import AddMemberModal from "@/components/wallet/add-member-modal";
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
  Alert,
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
  const params = useLocalSearchParams<{ bookId: string; bookName?: string }>();
  const router = useRouter();
  const bookId = params.bookId;

  const { data: bookData, isLoading: bookLoading } = useBook(bookId);
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
  const leaveBookMutation = useLeaveBook();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Form states
  const [searchValue, setSearchValue] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER" | "ADMIN">("VIEWER");

  // Mock API Mutations (replace with real if defined)
  const addMemberMutation = useShareBook();

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setSearchValue("");
    setRole("VIEWER");
    setModalVisible(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setSearchValue(member.email || member.user?.email || member.name || "");
    setRole(member.role);
    setModalVisible(true);
  };

  const handleRemoveMember = (member: Member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!memberToDelete) return;
    try {
      const response = await removeMemberMutation.mutateAsync({
        book_id: bookId,
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
      const response = await leaveBookMutation.mutateAsync(bookId);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Successfully left the book",
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

  const handleSubmitModal = async () => {
    const email = editingMember
      ? editingMember.email || editingMember.user?.email
      : searchValue;

    if (!email) {
      Alert.alert("Error", "Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const payload = {
      book_id: bookId,
      email: email.trim(),
      role,
    };

    try {
      const response = await addMemberMutation.mutateAsync(payload);

      if (response.success) {
        setModalVisible(false);
        setTimeout(() => {
          Toast.show({
            type: "success",
            text1: editingMember
              ? "Member updated successfully"
              : "Member added successfully",
          });
        }, 100);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Failed to add member",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate(`/wallet/${bookId}`);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [router, bookId]),
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t("members.title"),
          animation: "none",
          headerBackTitle: "Back",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.navigate(`/wallet/${bookId}`)}
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

      {/* Add / Edit Member Modal */}
      <AddMemberModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        editingMember={editingMember}
        handleSubmitModal={handleSubmitModal}
        isPending={addMemberMutation.isPending}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        role={role}
        setRole={setRole}
      />

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
        title="Leave Book"
        message="Are you sure you want to leave this book? You will no longer have access to its transactions."
        confirmText="Leave"
        cancelText="Cancel"
        isLoading={leaveBookMutation.isPending}
      />
    </>
  );
}
