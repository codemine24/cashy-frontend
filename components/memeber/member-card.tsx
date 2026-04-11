import { useAuth } from "@/context/auth-context";
import { Member } from "@/interface/wallet";
import {
  Edit3,
  MoreVertical,
  Trash2,
  User as UserIcon,
} from "@/lib/icons";
import { isOwner } from "@/utils/is-owner";
import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Popover from "react-native-popover-view";

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onRemove: (member: Member) => void;
  canManage?: boolean;
}

export const MemberCard = ({ member, onEdit, onRemove, canManage = true }: MemberCardProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const { authState } = useAuth();
  const owner = isOwner(authState?.user?.email, member.email)

  // Extract display values depending on structure
  const name = member.name || member.user?.name || "No name";
  const email = member.email || member.user?.email || "";
  const role = member.role;

  const handleAction = (action: (member: Member) => void) => {
    setIsMenuVisible(false);
    setTimeout(() => {
      action(member);
    }, 100);
  };

  return (
    <View className="bg-card rounded-2xl p-3 mt-3 border border-border flex-row items-center justify-between">
      {/* Left */}
      <View className="flex-row items-center flex-1">
        <View className="w-[52px] h-[52px] rounded-xl bg-primary/10 items-center justify-center mr-4">
          <UserIcon size={26} className="text-primary" />
        </View>
        <View className="flex-1 mr-4">
          <Text
            className="text-foreground font-bold text-[15px]"
            numberOfLines={1}
          >
            {name}
          </Text>
          {!!email && (
            <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={1}>
              {email}
            </Text>
          )}
        </View>
      </View>

      {/* Right */}
      <View className="flex-row items-center">
        <View
          className={`px-2 py-1 rounded-lg bg-blue-500/10`}
        >
          <Text
            className={`text-[11px] font-bold text-muted-foreground lowercase`}
          >
            {role}
          </Text>
        </View>

        <Popover
          isVisible={isMenuVisible}
          onRequestClose={() => setIsMenuVisible(false)}
          from={
            <TouchableOpacity
              onPress={() => setIsMenuVisible(true)}
              className={`${owner || !canManage ? "invisible" : "flex"} py-2 pl-2 rounded-full`}
              disabled={owner || !canManage}
            >
              <MoreVertical size={20} className="text-muted-foreground" />
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
        >
          <View className="flex flex-col gap-4">
            <TouchableOpacity
              onPress={() => handleAction(onEdit)}
              className="flex-row items-center disabled:opacity-40"
            >
              <Edit3 size={20} className="text-black" />
              <Text className="ml-4 text-[16px] text-black">Edit Role</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAction(onRemove)}
              className="flex-row items-center mt-1"
            >
              <Trash2 size={20} className="text-destructive" />
              <Text className="ml-4 text-[16px] text-destructive">Remove</Text>
            </TouchableOpacity>
          </View>
        </Popover>
      </View>
    </View>
  );
};