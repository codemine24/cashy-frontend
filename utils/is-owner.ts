import { Book } from "@/interface/wallet";

export const isOwner = (loggedUserId: string | undefined, createdById: string | undefined) => {
  if (!loggedUserId || !createdById) return false;
  return loggedUserId === createdById;
}


export const isWalletViewer = (loggedUserId: string | undefined, book: Book) => {
  if (!loggedUserId || !book) return false;
  const targetUser = book.others_member.find((member) => member.id === loggedUserId);

  return targetUser?.role === "VIEWER";
}