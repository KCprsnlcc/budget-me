import type { AccountType, AccountColor, Account } from "./types";
import {
  Wallet,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Wallet2,
  type LucideIcon,
} from "lucide-react";

export const ACCOUNT_TYPES: { type: AccountType; label: string; icon: LucideIcon; description: string }[] = [
  { type: "checking", label: "Checking", icon: Wallet, description: "Daily transactions, salary." },
  { type: "savings", label: "Savings", icon: ShieldCheck, description: "Emergency funds, goals." },
  { type: "credit", label: "Credit Card", icon: CreditCard, description: "Credit building, rewards." },
  { type: "investment", label: "Investment", icon: TrendingUp, description: "Portfolio, growth." },
  { type: "cash", label: "Cash", icon: Wallet2, description: "Physical wallet." },
];

export const ACCOUNT_COLORS: { color: AccountColor; name: string; twColor: string }[] = [
  { color: "#3B82F6", name: "Blue", twColor: "blue" },
  { color: "#10B981", name: "Green", twColor: "emerald" },
  { color: "#F59E0B", name: "Amber", twColor: "amber" },
  { color: "#EF4444", name: "Red", twColor: "red" },
  { color: "#8B5CF6", name: "Purple", twColor: "purple" },
  { color: "#64748B", name: "Slate", twColor: "slate" },
];

export const CASH_IN_SOURCES = [
  { value: "deposit", label: "Over the Counter Deposit" },
  { value: "transfer", label: "Bank Transfer" },
  { value: "salary", label: "Salary" },
  { value: "other", label: "Other" },
];

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "Just starting out" },
  { value: "intermediate", label: "Intermediate", description: "Standard usage" },
  { value: "advanced", label: "Advanced", description: "Power user" },
];

export const LANGUAGES = [
  { value: "en", label: "English (US)" },
  { value: "fil", label: "Filipino" },
  { value: "es", label: "Español" },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "1",
    name: "Main Checking",
    type: "checking",
    balance: 2500.00,
    color: "emerald",
    isDefault: true,
    institution: "BPI",
  },
  {
    id: "2",
    name: "Emergency Savings",
    type: "savings",
    balance: 5000.00,
    color: "blue",
    isDefault: false,
    institution: "Metrobank",
  },
];

export function getAccountIcon(type: AccountType): string {
  const iconMap: Record<AccountType, string> = {
    checking: "Wallet",
    savings: "SafeSquare",
    credit: "CreditCard",
    investment: "TrendingUp",
    cash: "Wallet2",
  };
  return iconMap[type] || "Wallet";
}

export function getColorName(hexColor: AccountColor): string {
  const colorNames: Record<AccountColor, string> = {
    "#10B981": "Green",
    "#3B82F6": "Blue",
    "#F59E0B": "Amber",
    "#EF4444": "Red",
    "#8B5CF6": "Purple",
    "#64748B": "Slate",
  };
  return colorNames[hexColor] || "Custom";
}

export function hexToColorName(hex: string): string {
  const hexMap: Record<string, string> = {
    "#10B981": "emerald",
    "#3B82F6": "blue",
    "#F59E0B": "amber",
    "#EF4444": "red",
    "#8B5CF6": "purple",
    "#64748B": "slate",
  };
  return hexMap[hex] || "emerald";
}
