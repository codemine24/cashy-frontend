import { Wallet } from "@/interface/wallet";

export const isOwner = (
  loggedUserId: string | undefined,
  createdById: string | undefined,
) => {
  if (!loggedUserId || !createdById) return false;
  return loggedUserId === createdById;
};

export const isWalletViewer = (
  loggedUserId: string | undefined,
  wallet: Wallet,
) => {
  if (!loggedUserId || !wallet) return false;
  const targetUser = wallet.others_member.find(
    (member) => member.id === loggedUserId,
  );

  return targetUser?.role === "VIEWER";
};
