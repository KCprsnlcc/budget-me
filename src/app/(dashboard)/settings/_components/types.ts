export type AccountType = "checking" | "savings" | "credit" | "investment" | "cash";

export type AccountColor = "#10B981" | "#3B82F6" | "#F59E0B" | "#EF4444" | "#8B5CF6" | "#64748B";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  isDefault: boolean;
  institution?: string;
  description?: string;
}

export interface AddAccountFormData {
  workflow: "new" | "existing" | "";
  type: AccountType | "";
  name: string;
  balance: string;
  institution: string;
  description: string;
  color: AccountColor;
  isDefault: boolean;
  skipCashIn: boolean;
  cashInDate: string;
  cashInSource: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  email: string;
}

export type SettingsTab = "profile" | "accounts" | "preferences";
