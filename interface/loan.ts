export enum LoanType {
  GIVEN = "GIVEN",
  TAKEN = "TAKEN",
}

export enum LoanStatus {
  ONGOING = "ONGOING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export interface CreateLoanPayload {
    person_name: string;
    amount: number;
    type: "GIVEN" | "TAKEN";
    remark?: string;
    contact_number?: string;
}

export interface UpdateLoanPayload {
    person_name?: string;
    amount?: number;
    type?: "GIVEN" | "TAKEN";
    remark?: string;
    contact_number?: string;
    status?: "ONGOING" | "PAID" | "OVERDUE";
}

export interface CreateLoanPaymentPayload {
    loan_id: string;
    amount: number;
    remark?: string;
}

export interface UpdateLoanPaymentPayload {
    payment_id: string;
    amount: number;
    remark?: string;
}

export interface LoanPayment {
    id: string
    loan_id: string
    amount: number
    remark?: string
    created_at: string
}

export interface Loan {
  id: string
  user_id: string
  person_name: string
  amount: number
  paid_amount: number
  type: LoanType
  status: LoanStatus
  remark?: string;
  contact_number?: string;
  created_at: string;
  updated_at: string
  payments?: LoanPayment[]
}