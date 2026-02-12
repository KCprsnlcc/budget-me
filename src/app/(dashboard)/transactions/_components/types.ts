export type TransactionType = {
  id: number;
  name: string;
  category: string;
  date: string;
  amount: number;
  status: string;
  account?: string;
};

export type TxnKind = "expense" | "income" | "contribution";

export type TxnFormState = {
  type: TxnKind | "";
  amount: string;
  date: string;
  category: string;
  budget: string;
  goal: string;
  account: string;
  description: string;
};

export const INITIAL_FORM_STATE: TxnFormState = {
  type: "",
  amount: "",
  date: "",
  category: "",
  budget: "",
  goal: "",
  account: "",
  description: "",
};
