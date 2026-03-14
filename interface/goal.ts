import { Transaction } from "./wallet";

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  balance: number;
  total_transactions: number;
  created_at: string;
  updated_at: string;
  transactions: Transaction[];
}