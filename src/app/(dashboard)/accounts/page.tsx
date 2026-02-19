import {
  Plus,
  CreditCard,
  Building2,
  Wallet,
  TrendingUp,
  MoreHorizontal,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "BudgetMe - Accounts" };

const ACCOUNTS = [
  {
    name: "Main Checking",
    institution: "Chase Bank",
    type: "Checking",
    balance: 12450.0,
    lastSync: "Just now",
    icon: Building2,
    change: 2.3,
    accountNumber: "****4523",
  },
  {
    name: "Savings Account",
    institution: "Ally Bank",
    type: "Savings",
    balance: 8200.0,
    lastSync: "2h ago",
    icon: Wallet,
    change: 5.1,
    accountNumber: "****8901",
  },
  {
    name: "Credit Card",
    institution: "American Express",
    type: "Credit",
    balance: -1287.5,
    lastSync: "1h ago",
    icon: CreditCard,
    change: -12.3,
    accountNumber: "****3456",
  },
  {
    name: "Investment Portfolio",
    institution: "Vanguard",
    type: "Investment",
    balance: 45600.0,
    lastSync: "4h ago",
    icon: TrendingUp,
    change: 8.7,
    accountNumber: "****7890",
  },
];

export default function AccountsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Accounts</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your connected financial accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw size={14} /> Sync All
          </Button>
          <Button size="sm">
            <Plus size={14} /> Link Account
          </Button>
        </div>
      </div>

      {/* Total Net Worth */}
      <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">
            Total Net Worth
          </span>
          <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Eye size={16} />
          </button>
        </div>
        <div className="text-3xl font-bold mb-1">₱64,962.50</div>
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
          <ArrowUpRight size={14} />
          +4.2% this month
        </div>
      </Card>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const isNegative = account.balance < 0;

          return (
            <Card key={account.name} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <Icon size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{account.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {account.institution} &bull; {account.accountNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={account.type === "Credit" ? "warning" : "neutral"}>
                    {account.type}
                  </Badge>
                  <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className={`text-xl font-bold ${isNegative ? "text-red-600" : "text-slate-900"}`}>
                  {isNegative ? "-" : ""}₱{Math.abs(account.balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[11px]">
                <span className="text-slate-400">
                  Last synced: {account.lastSync}
                </span>
                <span className={`flex items-center gap-1 font-medium ${account.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {account.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(account.change)}%
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
