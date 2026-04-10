export interface Transaction {
  id: string;
  book_id: string;
  category_id: string | null;
  category?: string;
  entry_by_id: string;
  update_by_id: string | null;
  amount: string | number;
  type: "IN" | "OUT";
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  name: string;
  balance: number;
  in: number;
  out: number;
  role: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  others_member: { id: string, name: string, email: string, avatar: string; role: "OWNER" | "EDITOR" | "VIEWER" }[];
  transactions?: Transaction[];

}

export interface Member {
  id: string;
  role: "EDITOR" | "VIEWER" | "ADMIN";
  name?: string;
  email?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}