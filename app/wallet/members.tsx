import { useGetAllUsers } from "@/api/user";
import {
  useBook,
  useLeaveBook,
  useRemoveMember,
  useShareBook,
} from "@/api/wallet";
import { BottomSheetModal } from "@/components/bottom-sheet-modal";
import { MemberCard } from "@/components/memeber/member-card";
import { ScreenContainer } from "@/components/screen-container";
import { MembersSkeleton } from "@/components/skeletons/members-skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/auth-context";
import { useDebounce } from "@/hooks/use-debounce";
import { PlusIcon } from "@/icons/plus-icon";
import { Member } from "@/interface/wallet";
import { isOwner } from "@/utils/is-owner";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function MembersScreen() {
  const { t } = useTranslation();
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
  const debouncedSearch = useDebounce(searchValue, 500);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [role, setRole] = useState<"EDITOR" | "VIEWER" | "ADMIN">("VIEWER");

  // Mock API Mutations (replace with real if defined)
  const addMemberMutation = useShareBook();

  // Search results
  const { data: usersResponse, isFetching: searchingUsers } = useGetAllUsers({
    search: debouncedSearch,
    limit: 3,
  });

  const usersList = usersResponse?.data?.data || [];

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setSearchValue("");
    setSelectedUser(null);
    setRole("VIEWER");
    setModalVisible(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setSearchValue(member.email || member.user?.email || member.name || "");
    setSelectedUser(member.user || null);
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
    if (!editingMember && !selectedUser) {
      Alert.alert("Error", "Please select a user to add.");
      return;
    }

    const payload = {
      book_id: bookId,
      email: editingMember ? editingMember.email : selectedUser.email,
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

  return (
    <>
      <Stack.Screen
        options={{ title: t("members.title"), headerBackTitle: "Back" }}
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
                    <Text className="text-destructive font-semibold">
                      Leave From {bookData?.data?.name}
                    </Text>
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
          className="rounded-full py-4 absolute bottom-8 right-4"
        >
          <PlusIcon className="text-primary-foreground size-6" />
          <Text className="text-primary-foreground text-lg text-center ml-2">
            {t("members.addMember")}
          </Text>
        </Button>
      )}

      {/* Add / Edit Member Modal */}
      <BottomSheetModal
        visible={modalVisible}
        statusBarTranslucent={true}
        onClose={() => setModalVisible(false)}
      >
        <View className="px-6 pt-3 pb-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6 border-b border-border pb-3">
            <Text className="text-xl font-bold text-foreground">
              {editingMember ? "Edit Member Role" : "Add Member"}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            // contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Email Field */}
            <View className="mb-3 relative" style={{ zIndex: 100 }}>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Email / User
              </Text>
              <View className="relative flex-row items-center">
                <TextInput
                  value={searchValue}
                  onChangeText={(text) => {
                    setSearchValue(text);
                    setSelectedUser(null);
                  }}
                  placeholder="Search user by email or name..."
                  placeholderTextColor="#A1A1AA"
                  editable={!editingMember}
                  className={`flex-1 border border-border rounded-xl px-4 py-3.5 bg-card text-foreground ${editingMember ? "bg-muted text-muted-foreground" : ""}`}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                {!editingMember && searchingUsers && searchValue.length > 0 && (
                  <View
                    className="absolute w-full left-0 right-0 bg-card border border-border rounded-xl shadow-lg p-4 items-center"
                    style={{ top: 50, zIndex: 100 }}
                  >
                    <View className="w-full flex items-center justify-center">
                      <ActivityIndicator size="small" color="#fca5a5" />
                    </View>
                  </View>
                )}
              </View>

              {/* Search Results Dropdown */}
              {!editingMember &&
                searchValue.length > 0 &&
                !selectedUser &&
                !searchingUsers &&
                (usersList.length > 0 ? (
                  <View
                    className="absolute left-0 right-0 bg-card border border-border rounded-xl shadow-lg w-full max-h-[180px] overflow-hidden"
                    style={{
                      top: 70,
                      zIndex: 100,
                    }}
                  >
                    <ScrollView keyboardShouldPersistTaps="handled">
                      {usersList.map((usr: any) => (
                        <TouchableOpacity
                          key={usr.id}
                          onPress={() => {
                            setSelectedUser(usr);
                            setSearchValue(usr.email || usr.name || "");
                          }}
                          className="px-4 py-3 border-b border-border last:border-b-0 flex-row items-center"
                        >
                          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                            <Text className="text-primary font-bold text-sm">
                              {(usr.name || usr.email || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </Text>
                          </View>
                          <View>
                            <Text className="font-semibold text-foreground">
                              {usr.name || "No name"}
                            </Text>
                            <Text className="text-sm text-muted-foreground">
                              {usr.email}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  debouncedSearch === searchValue &&
                  searchValue.length > 1 && (
                    <View
                      className="absolute w-full left-0 right-0 bg-card border border-border rounded-xl shadow-lg p-4 items-center"
                      style={{ top: 70, zIndex: 100 }}
                    >
                      <Text className="text-sm text-muted-foreground">
                        No users found matching &quot;{searchValue}&quot;
                      </Text>
                    </View>
                  )
                ))}
            </View>

            {/* Role Selector */}
            <View className="mb-3" style={{ zIndex: 1 }}>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Role
              </Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setRole("VIEWER")}
                  className={`flex-1 py-3.5 items-center rounded-xl border ${
                    role === "VIEWER"
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold text-base ${
                      role === "VIEWER"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    Viewer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("EDITOR")}
                  className={`flex-1 py-3.5 items-center rounded-xl border ${
                    role === "EDITOR"
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold text-base ${
                      role === "EDITOR"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    Editor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("ADMIN")}
                  className={`flex-1 py-3.5 items-center rounded-xl border ${
                    role === "ADMIN"
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold text-base ${
                      role === "ADMIN"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Permissions Info */}
            <View className="mb-3 rounded-xl bg-muted border border-border p-4">
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                {role === "VIEWER"
                  ? "Viewer can"
                  : role === "EDITOR"
                    ? "Editor can"
                    : "Admin can"}
              </Text>
              {(role === "VIEWER"
                ? [
                    { icon: "✅", label: "View all transactions" },
                    { icon: "✅", label: "View balance & summary" },
                    { icon: "❌", label: "Add or edit transactions" },
                    { icon: "❌", label: "Manage members" },
                  ]
                : role === "EDITOR"
                  ? [
                      { icon: "✅", label: "View all transactions" },
                      { icon: "✅", label: "Add & edit transactions" },
                      { icon: "✅", label: "Delete own transactions" },
                      { icon: "❌", label: "Manage members" },
                    ]
                  : [
                      { icon: "✅", label: "View all transactions" },
                      { icon: "✅", label: "Add & edit transactions" },
                      { icon: "✅", label: "Delete any transactions" },
                      { icon: "✅", label: "Manage & invite members" },
                    ]
              ).map((item, i) => (
                <View key={i} className="flex-row items-center mb-1.5">
                  <Text className="text-sm mr-2">{item.icon}</Text>
                  <Text className="text-sm text-foreground">{item.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSubmitModal}
              disabled={addMemberMutation.isPending}
              className={`w-full rounded-lg py-3 items-center justify-center flex-row ${
                addMemberMutation.isPending ? "bg-primary/50" : "bg-primary"
              }`}
            >
              {addMemberMutation.isPending && (
                <ActivityIndicator
                  color="white"
                  className="mr-2"
                  size="small"
                />
              )}
              <Text className="text-white font-semibold text-base">
                {editingMember ? "Save" : "Add"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BottomSheetModal>

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
