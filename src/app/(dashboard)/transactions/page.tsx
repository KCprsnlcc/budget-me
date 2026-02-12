"use client";

import { memo, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
  Music,
  Briefcase,
  Wallet,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Target,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AddTransactionModal } from "./_components/add-transaction-modal";
import { ViewTransactionModal } from "./_components/view-transaction-modal";
import { EditTransactionModal } from "./_components/edit-transaction-modal";
import { DeleteTransactionModal } from "./_components/delete-transaction-modal";
import type { TransactionType } from "./_components/types";

type SummaryType = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon?: React.ComponentType<any>;
  iconBg?: string;
  iconColor?: string;
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Shopping: ShoppingBag,
  "Food & Dining": Utensils,
  Transportation: Car,
  Housing: Home,
  Utilities: Zap,
  Entertainment: Music,
  Income: Briefcase,
};

const ENHANCED_TRANSACTIONS: TransactionType[] = [
  { id: 1, name: "Whole Foods Market", category: "Groceries", date: "Oct 24, 2:30 PM", amount: -86.42, status: "completed", account: "Chase •••• 4242" },
  { id: 2, name: "Tech Corp Salary", category: "Income", date: "Oct 24, 9:00 AM", amount: 2450.00, status: "completed", account: "Checking •••• 8890" },
  { id: 3, name: "Uber Trip", category: "Transport", date: "Oct 23, 7:15 PM", amount: -14.50, status: "completed", account: "Chase •••• 4242" },
  { id: 4, name: "Netflix", category: "Entertainment", date: "Oct 22, 12:00 AM", amount: -15.99, status: "completed", account: "Chase •••• 4242" },
  { id: 5, name: "Electric Bill", category: "Utilities", date: "Oct 21, 5:00 PM", amount: -142.00, status: "pending", account: "Chase •••• 4242" },
  { id: 6, name: "Grocery Store", category: "Food & Dining", date: "Oct 20, 3:30 PM", amount: -67.50, status: "completed", account: "Chase •••• 4242" },
  { id: 7, name: "Freelance Payment", category: "Income", date: "Oct 19, 2:00 PM", amount: 850.00, status: "completed", account: "Checking •••• 8890" },
  { id: 8, name: "Gas Station", category: "Transportation", date: "Oct 18, 8:00 AM", amount: -55.20, status: "completed", account: "Chase •••• 4242" },
  { id: 9, name: "Restaurant", category: "Food & Dining", date: "Oct 17, 7:30 PM", amount: -45.00, status: "completed", account: "Chase •••• 4242" },
  { id: 10, name: "Amazon Purchase", category: "Shopping", date: "Oct 16, 11:00 AM", amount: -89.99, status: "completed", account: "Chase •••• 4242" },
];

const SUMMARY: SummaryType[] = [
  {
    label: "Monthly Income",
    value: "$8,240.00",
    change: "+12%",
    trend: "up",
    icon: Wallet,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Monthly Expenses",
    value: "$3,405.50",
    change: "+5.4%",
    trend: "up",
    icon: ShoppingBag,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Net Balance",
    value: "$4,834.50",
    change: "",
    trend: "up",
    icon: TrendingUp,
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
  },
  {
    label: "Savings Rate",
    value: "58.6%",
    change: "",
    trend: "up",
    icon: Target,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

const CHART_DATA = [
  { month: "May", income: 45, expense: 35 },
  { month: "Jun", income: 55, expense: 40 },
  { month: "Jul", income: 48, expense: 42 },
  { month: "Aug", income: 65, expense: 45 },
  { month: "Sep", income: 72, expense: 38 },
  { month: "Oct", income: 82, expense: 34 },
] as const;

// Memoized components for better performance
const SummaryCard = memo(({ item }: { item: SummaryType }) => {
  const Icon = item.icon;
  return (
    <Card className="p-5 hover:border-emerald-200 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="text-slate-500 bg-slate-50 p-2 rounded-lg">
          {Icon && <Icon size={22} strokeWidth={1.5} />}
        </div>
        {item.change && (
          <div className={`flex items-center gap-1 text-[10px] font-medium ${
            item.trend === "up" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : 
            "text-red-700 bg-red-50 border-red-100"
          } px-2 py-1 rounded-full border`}>
            {item.trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {item.change}
          </div>
        )}
      </div>
      <div className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">{item.label}</div>
      <div className="text-xl font-semibold text-slate-900 tracking-tight">{item.value}</div>
    </Card>
  );
});

SummaryCard.displayName = "SummaryCard";

const TransactionRow = memo(({
  tx,
  onView,
  onEdit,
  onDelete,
}: {
  tx: TransactionType;
  onView: (tx: TransactionType) => void;
  onEdit: (tx: TransactionType) => void;
  onDelete: (tx: TransactionType) => void;
}) => {
  const isIncome = tx.amount > 0;
  return (
    <TableRow className="group hover:bg-slate-50/80 transition-colors">
      <TableCell className="px-6 py-4 text-slate-400">{tx.date}</TableCell>
      <TableCell className="px-6 py-4 font-medium text-slate-900">{tx.name}</TableCell>
      <TableCell className="px-6 py-4">
        <Badge variant={tx.category === "Income" ? "info" : "success"}>
          {tx.category}
        </Badge>
      </TableCell>
      <TableCell className="px-6 py-4 text-slate-500">{tx.account}</TableCell>
      <TableCell className="px-6 py-4 text-right font-medium text-slate-900">
        {isIncome ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => onView(tx)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(tx)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(tx)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

TransactionRow.displayName = "TransactionRow";

export default function TransactionsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionType | null>(null);

  const handleView = useCallback((tx: TransactionType) => {
    setSelectedTx(tx);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((tx: TransactionType) => {
    setSelectedTx(tx);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((tx: TransactionType) => {
    setSelectedTx(tx);
    setDeleteModalOpen(true);
  }, []);

  const handleViewToEdit = useCallback((tx: TransactionType) => {
    setViewModalOpen(false);
    setTimeout(() => {
      setSelectedTx(tx);
      setEditModalOpen(true);
    }, 150);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Transactions</h2>
          <p className="text-sm text-slate-500 mt-1 font-light">View and manage all your income and expense transactions.</p>
        </div>
        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setAddModalOpen(true)}>
          <Plus size={16} /> Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Income vs Expenses</h3>
              <p className="text-xs text-slate-500 mt-1 font-light">6-month comparison.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-[10px] font-medium text-slate-500">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-slate-500">Expense</span>
              </div>
            </div>
          </div>

          <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
              <div className="w-full h-px bg-slate-100/50" />
            </div>
            {CHART_DATA.map((d) => (
              <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer">
                <div
                  className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100"
                  style={{ height: `${d.income}%` }}
                />
                <div
                  className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100"
                  style={{ height: `${d.expense}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
            {CHART_DATA.map((d) => (
              <span key={d.month} className={d.month === 'Oct' ? 'text-slate-600' : ''}>
                {d.month}
              </span>
            ))}
          </div>
        </Card>

        {/* Expense Categories */}
        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={16} className="text-slate-400" />
            </Button>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-32 h-32 mx-auto rounded-full flex-shrink-0 relative"
                 style={{ background: 'conic-gradient(#10b981 0% 35%, #f59e0b 35% 65%, #64748b 65% 85%, #cbd5e1 85% 100%)' }}>
              <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs text-slate-400 font-medium">Total</span>
                <span className="text-sm font-bold text-slate-900">$3.4k</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Food</span>
              </div>
              <span className="font-medium text-slate-900">$1,191</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-600">Housing</span>
              </div>
              <span className="font-medium text-slate-900">$1,021</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-slate-600">Transport</span>
              </div>
              <span className="font-medium text-slate-900">$681</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-slate-600">Other</span>
              </div>
              <span className="font-medium text-slate-900">$511</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col xl:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 w-full xl:w-auto">
            <Filter size={16} />
            <span className="font-medium">Filters</span>
          </div>
          <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

          <div className="relative w-full xl:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2 w-full xl:w-auto">
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>October</option>
              <option>September</option>
              <option>August</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>2023</option>
              <option>2022</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Accounts</option>
              <option>Chase Sapphire</option>
              <option>Checking</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 xl:flex items-center gap-2 w-full xl:w-auto">
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Categories</option>
              <option>Groceries</option>
              <option>Transport</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Goals</option>
              <option>Emergency Fund</option>
              <option>New Car</option>
            </select>
          </div>

          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset Filters">
              <RotateCcw size={14} />
            </Button>
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center">
              <Download size={14} /> Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 cursor-pointer hover:text-slate-700 transition-colors">
                <div className="flex items-center gap-1">
                  Date <MoreHorizontal size={12} className="rotate-90" />
                </div>
              </TableHead>
              <TableHead className="px-6 py-3">Description</TableHead>
              <TableHead className="px-6 py-3 cursor-pointer hover:text-slate-700 transition-colors">
                <div className="flex items-center gap-1">
                  Category <MoreHorizontal size={12} className="rotate-90" />
                </div>
              </TableHead>
              <TableHead className="px-6 py-3">Account</TableHead>
              <TableHead className="px-6 py-3 text-right cursor-pointer hover:text-slate-700 transition-colors">
                <div className="flex items-center gap-1 justify-end">
                  Amount <MoreHorizontal size={12} className="rotate-90" />
                </div>
              </TableHead>
              <TableHead className="px-6 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ENHANCED_TRANSACTIONS.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modals */}
      <AddTransactionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      <ViewTransactionModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        transaction={selectedTx}
        onEdit={handleViewToEdit}
      />
      <EditTransactionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        transaction={selectedTx}
      />
      <DeleteTransactionModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
}
