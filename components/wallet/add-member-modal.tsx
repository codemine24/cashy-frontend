import { Member } from "@/interface/wallet";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ApplyButton from "../ui/modal/apply-button";
import BottomSheetModalWrapper from "../ui/modal/bottom-sheet-modal-wrapper";

type Props = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  editingMember: Member | null;
  handleSubmitModal: () => void;
  isPending: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  role: "EDITOR" | "VIEWER" | "ADMIN";
  setRole: (role: "EDITOR" | "VIEWER" | "ADMIN") => void;
};

export default function AddMemberModal({
  modalVisible,
  setModalVisible,
  editingMember,
  handleSubmitModal,
  isPending,
  searchValue,
  setSearchValue,
  role,
  setRole,
}: Props) {
  return (
    <BottomSheetModalWrapper
      visible={modalVisible}
      title={editingMember ? "Edit Member Role" : "Add Member"}
      onClose={() => setModalVisible(false)}
      footer={
        <ApplyButton
          onApply={handleSubmitModal}
          applyDisabled={isPending}
          title={
            isPending
              ? editingMember
                ? "SAVING..."
                : "ADDING..."
              : editingMember
                ? "SAVE"
                : "ADD"
          }
        />
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="h-[220px]"
      >
        <View className="flex-col gap-2">
          <Text className="text-sm font-semibold text-foreground">Email</Text>
          <View className="relative flex-row items-center mb-2">
            <TextInput
              value={searchValue}
              onChangeText={(text) => {
                setSearchValue(text);
              }}
              placeholder="Enter email address..."
              placeholderTextColor="#A1A1AA"
              editable={!editingMember}
              className={`flex-1 border border-border rounded-xl px-4 py-3.5 bg-card text-foreground ${editingMember ? "bg-muted text-muted-foreground" : ""}`}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>
          <Text className="text-sm font-semibold text-foreground">Role</Text>
          <View className="flex-row items-center gap-2 mb-1">
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
                  role === "VIEWER" ? "text-primary" : "text-muted-foreground"
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
                  role === "EDITOR" ? "text-primary" : "text-muted-foreground"
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
                  role === "ADMIN" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Admin
              </Text>
            </TouchableOpacity>
          </View>
          <View className="rounded-xl bg-muted border border-border p-4">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              {role === "VIEWER"
                ? "Viewer can"
                : role === "EDITOR"
                  ? "Editor can"
                  : "Admin can"}
            </Text>
            <View className="flex-col gap-1">
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
                <View key={i} className="flex-row items-center">
                  <Text className="text-sm mr-2">{item.icon}</Text>
                  <Text className="text-sm text-foreground">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </BottomSheetModalWrapper>
  );
}
