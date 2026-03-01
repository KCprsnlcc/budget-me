"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { memo, useState, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  Wallet,
  ShoppingBag,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  PiggyBank,
  RotateCcw,
  Table as TableIcon,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  FileText,
  Home,
  Car,
  Utensils,
  ShoppingCart,
  Zap,
  Heart,
  Film,
  Package,
  BookOpen,
  Shield,
  PhilippinePeso,
  Laptop,
  TrendingUp as TrendingUpIcon,
  Building,
  Briefcase,
  Rocket,
  Gift,
  Banknote,
  CreditCard,
  Wallet as WalletIcon,
  Building2,
  Landmark,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
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
import { useTransactions } from "./_lib/use-transactions";
import type { TransactionType } from "./_components/types";
import { FilterTableSkeleton, TransactionCardSkeleton } from "@/components/ui/skeleton-filter-loaders";
import {
  exportToCSV,
  exportTransactionsToPDF,
  formatExportDate,
  formatCurrencyPHP,
  getTimestampString,
  type TransactionExportData,
} from "@/lib/export-utils";

type SummaryType = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon?: React.ComponentType<any>;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(n: number): string {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCompact(n: number): string {
  if (n >= 1000) return "₱" + (n / 1000).toFixed(1) + "k";
  return "₱" + n.toFixed(0);
}

function accountLabel(tx: TransactionType): string {
  if (!tx.account_name) return "—";
  if (tx.account_number_masked) return `${tx.account_name} ${tx.account_number_masked}`;
  return tx.account_name;
}

function isIncomeType(tx: TransactionType): boolean {
  return tx.type === "income" || tx.type === "cash_in";
}

// Helper function to convert emojis to Lucide icons
function getLucideIcon(emoji: string): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Expense Categories
    "🏠": Home,
    "🚗": Car,
    "🍽️": Utensils,
    "🛒": ShoppingCart,
    "💡": Zap,
    "⚕️": Heart,
    "🎬": Film,
    "🛍️": Package,
    "📚": BookOpen,
    "🛡️": Shield,
    
    // Income Categories
    "💰": PhilippinePeso,
    "💻": Laptop,
    "📈": TrendingUpIcon,
    "🏢": Building,
    "💼": Briefcase,
    "🚀": Rocket,
    "🎁": Gift,
    "💵": Banknote,
    
    // Default/fallback
    "📋": FileText,
  };
  
  return iconMap[emoji] || FileText;
}

// Helper function to get account icon
function getAccountIcon(accountName: string): React.ComponentType<any> {
  const name = accountName.toLowerCase();
  if (name.includes("bank") || name.includes("checking") || name.includes("savings")) return Building2;
  if (name.includes("credit") || name.includes("card")) return CreditCard;
  if (name.includes("cash") || name.includes("wallet")) return WalletIcon;
  if (name.includes("investment") || name.includes("brokerage")) return TrendingUpIcon;
  if (name.includes("loan") || name.includes("mortgage")) return Landmark;
  if (name.includes("utility") || name.includes("phone") || name.includes("internet")) return Zap;
  if (name.includes("car") || name.includes("auto")) return Car;
  if (name.includes("home") || name.includes("house")) return Home;
  return FileText;
}

// Memoized components for better performance
const SummaryCard = memo(({ item }: { item: SummaryType }) => {
  const Icon = item.icon;
  return (
    <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="text-slate-500 p-2 rounded-lg">
          {Icon && <Icon size={22} strokeWidth={1.5} />}
        </div>
        {item.change && (
          <div className={`flex items-center gap-1 text-[10px] font-medium ${
            item.trend === "up" ? "text-emerald-700 border-emerald-100" : 
            "text-red-700 border-red-100"
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

const TransactionCard = memo(({
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
  const isIncome = isIncomeType(tx);
  const catName = tx.category_name ?? tx.type;
  
  return (
    <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-lg p-2 rounded-lg">
            {tx.category_icon ? <tx.category_icon size={20} /> : <FileText size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{tx.description ?? "Untitled"}</h4>
            <p className="text-xs text-slate-500">{accountLabel(tx)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={isIncome ? "info" : "success"} className="text-xs">
            {catName}
          </Badge>
          <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold ${
            isIncome ? "text-emerald-600" : "text-slate-900"
          }`}>
            {isIncome ? "+" : "-"}₱{tx.amount.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
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
      </div>
    </Card>
  );
});

TransactionCard.displayName = "TransactionCard";

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
  const isIncome = isIncomeType(tx);
  return (
    <TableRow className="group hover:bg-slate-50/80 transition-colors">
      <TableCell className="px-6 py-4 text-slate-400">{formatDate(tx.date)}</TableCell>
      <TableCell className="px-6 py-4 font-medium text-slate-900">{tx.description ?? "—"}</TableCell>
      <TableCell className="px-6 py-4">
        <Badge variant={isIncome ? "info" : "success"}>
          {tx.category_name ?? tx.type}
        </Badge>
      </TableCell>
      <TableCell className="px-6 py-4 text-slate-500">{accountLabel(tx)}</TableCell>
      <TableCell className="px-6 py-4 text-right font-medium text-slate-900">
        {isIncome ? "+" : "-"}₱{tx.amount.toFixed(2)}
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex items-center justify-center gap-1">
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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [hoveredBar, setHoveredBar] = useState<{month: string, type: 'income' | 'expense', value: number} | null>(null);

  const {
    transactions,
    summary,
    categoryBreakdown,
    monthlyTrend,
    accounts,
    expenseCategories,
    incomeCategories,
    goals,
    month, setMonth,
    year, setYear,
    typeFilter, setTypeFilter,
    categoryFilter, setCategoryFilter,
    search,
    setSearch,
    resetFilters,
    resetFiltersToAll,
    loading,
    tableLoading,
    error,
    refetch,
    // Pagination
    currentPage,
    pageSize,
    setPageSize,
    handlePageSizeChange,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
  } = useTransactions();

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

  // Build summary cards from real data
  const summaryItems: SummaryType[] = useMemo(() => {
    if (!summary) return [];
    const changeFmt = (n: number | null) =>
      n !== null ? `${n >= 0 ? "+" : ""}${n.toFixed(1)}%` : "";
    return [
      { label: "Monthly Income", value: formatCurrency(summary.monthlyIncome), change: changeFmt(summary.incomeChange), trend: (summary.incomeChange ?? 0) >= 0 ? "up" as const : "down" as const, icon: Wallet },
      { label: "Monthly Expenses", value: formatCurrency(summary.monthlyExpenses), change: changeFmt(summary.expenseChange), trend: (summary.expenseChange ?? 0) >= 0 ? "up" as const : "down" as const, icon: ShoppingBag },
      { label: "Net Balance", value: formatCurrency(summary.netBalance), change: "", trend: summary.netBalance >= 0 ? "up" as const : "down" as const, icon: TrendingUp },
      { label: "Savings Rate", value: `${summary.savingsRate.toFixed(1)}%`, change: "", trend: summary.savingsRate >= 0 ? "up" as const : "down" as const, icon: PiggyBank },
    ];
  }, [summary]);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    if (transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const exportData: TransactionExportData[] = transactions.map((tx) => ({
      id: tx.id,
      date: formatExportDate(tx.date),
      description: tx.description || "Untitled",
      type: tx.type,
      category: tx.category_name || tx.type,
      account: tx.account_name || "—",
      amount: isIncomeType(tx) ? tx.amount : -tx.amount,
      notes: tx.notes,
    }));

    const filename = `transactions_${getTimestampString()}.csv`;
    exportToCSV(exportData, filename);
  }, [transactions]);

  const handleExportPDF = useCallback(() => {
    if (transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const exportData: TransactionExportData[] = transactions.map((tx) => ({
      id: tx.id,
      date: formatExportDate(tx.date),
      description: tx.description || "Untitled",
      type: tx.type,
      category: tx.category_name || tx.type,
      account: tx.account_name || "—",
      amount: isIncomeType(tx) ? tx.amount : -tx.amount,
      notes: tx.notes,
    }));

    const summary = {
      totalIncome: summaryItems[0]?.value ? parseFloat(summaryItems[0].value.replace(/[₱,]/g, "")) : 0,
      totalExpenses: summaryItems[1]?.value ? parseFloat(summaryItems[1].value.replace(/[₱,]/g, "")) : 0,
      netBalance: summaryItems[2]?.value ? parseFloat(summaryItems[2].value.replace(/[₱,]/g, "")) : 0,
    };

    exportTransactionsToPDF(exportData, summary);
  }, [transactions, summaryItems]);

  // Normalize chart data to percentages for bar heights
  const chartData = useMemo(() => {
    if (!monthlyTrend.length) return [];
    const max = Math.max(...monthlyTrend.map((d) => Math.max(d.income, d.expense)), 1);
    return monthlyTrend.map((d) => ({
      month: d.month,
      income: (d.income / max) * 100,
      expense: (d.expense / max) * 100,
      incomeValue: d.income,
      expenseValue: d.expense,
    }));
  }, [monthlyTrend]);

  // Build conic-gradient for category donut
  const categoryTotal = useMemo(
    () => categoryBreakdown.reduce((sum, c) => sum + c.amount, 0),
    [categoryBreakdown]
  );
  const categoryGradient = useMemo(() => {
    if (!categoryBreakdown.length) return "conic-gradient(#e2e8f0 0% 100%)";
    let acc = 0;
    const stops = categoryBreakdown.map((c) => {
      const start = acc;
      acc += (c.amount / categoryTotal) * 100;
      return `${c.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [categoryBreakdown, categoryTotal]);

  // Combine expense + income categories for the filter dropdown
  const allCategories = useMemo(
    () => [
      ...expenseCategories.map((c) => ({ ...c, kind: "expense" as const })),
      ...incomeCategories.map((c) => ({ ...c, kind: "income" as const })),
    ],
    [expenseCategories, incomeCategories]
  );

  const currentYear = new Date().getFullYear();

  // Loading state - only show full page skeleton on initial load, not filter changes
  if (loading && !tableLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton width={200} height={32} className="mb-2" />
              <Skeleton width={300} height={16} />
            </div>
            <div className="flex gap-3">
              <Skeleton width={100} height={36} />
              <Skeleton width={120} height={36} />
              <Skeleton width={140} height={36} />
            </div>
          </div>

          {/* Summary Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton width={40} height={40} borderRadius={8} />
                  <Skeleton width={80} height={20} borderRadius={10} />
                </div>
                <Skeleton width={100} height={16} className="mb-2" />
                <Skeleton width={120} height={24} />
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Skeleton width={150} height={16} className="mb-2" />
                  <Skeleton width={120} height={12} />
                </div>
                <div className="flex gap-3">
                  <Skeleton width={60} height={12} />
                  <Skeleton width={60} height={12} />
                </div>
              </div>
              <Skeleton height={240} />
            </Card>
            <Card className="p-6">
              <Skeleton width={100} height={16} className="mb-2" />
              <Skeleton width={140} height={12} className="mb-6" />
              <Skeleton width={128} height={128} borderRadius="50%" className="mx-auto mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton width={80} height={12} />
                    <Skeleton width={40} height={12} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Filters Skeleton */}
          <Card className="p-4">
            <div className="flex flex-col xl:flex-row items-center gap-3">
              <Skeleton width={60} height={16} />
              <Skeleton width={200} height={36} />
              <Skeleton width={600} height={36} className="flex-1" />
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
            </div>
          </Card>

          {/* Transaction Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <div>
                      <Skeleton width={120} height={16} className="mb-1" />
                      <Skeleton width={80} height={10} />
                    </div>
                  </div>
                  <Skeleton width={60} height={20} borderRadius={10} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton width={40} height={12} />
                    <Skeleton width={100} height={12} />
                  </div>
                  <Skeleton height={8} borderRadius={4} />
                  <div className="flex justify-between">
                    <Skeleton width={80} height={10} />
                    <Skeleton width={30} height={10} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
                  <Skeleton width={32} height={32} borderRadius={4} />
                  <Skeleton width={32} height={32} borderRadius={4} />
                  <Skeleton width={32} height={32} borderRadius={4} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Transactions</h2>
          <p className="text-sm text-slate-500 mt-1 font-light">View and manage all your income and expense transactions.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setViewMode('table')}
            >
              <TableIcon size={14} className="mr-1" />
              Table
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={14} className="mr-1" />
              Grid
            </Button>
          </div>
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
              <MoreHorizontal size={12} />
            </Button>
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 hidden group-hover:block z-50">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50" onClick={handleExportPDF}>
                <span className="text-rose-500">PDF</span> Export as PDF
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50" onClick={handleExportCSV}>
                <span className="text-emerald-500">CSV</span> Export as CSV
              </Button>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="lg:col-span-2 p-6 hover:shadow-md transition-all group cursor-pointer">
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

          {chartData.length > 0 ? (
              <>
                <div className="relative h-60 flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-50">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                    <div className="w-full h-px bg-slate-100/50" />
                  </div>
                  {chartData.map((d) => (
                    <div key={d.month} className="flex gap-1 h-full items-end flex-1 justify-center z-10 group cursor-pointer relative">
                      <div
                        className="w-3 sm:w-5 bg-slate-300 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1"
                        style={{ height: `${d.income}%` }}
                        onMouseEnter={() => setHoveredBar({ month: d.month, type: 'income', value: d.incomeValue })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                      <div
                        className="w-3 sm:w-5 bg-emerald-500 rounded-t-[2px] transition-all hover:opacity-100 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1"
                        style={{ height: `${d.expense}%` }}
                        onMouseEnter={() => setHoveredBar({ month: d.month, type: 'expense', value: d.expenseValue })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                      
                      {/* Tooltip */}
                      {hoveredBar && hoveredBar.month === d.month && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white border border-slate-200 text-slate-900 text-xs rounded shadow-sm whitespace-nowrap z-50">
                          <div className="font-medium text-slate-700">{hoveredBar.month}</div>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${hoveredBar.type === 'income' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                            <span className="capitalize">{hoveredBar.type}: {formatCurrency(hoveredBar.value)}</span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-medium text-slate-400 px-4 uppercase tracking-wider">
                  {chartData.map((d, i) => (
                    <span key={d.month} className={i === chartData.length - 1 ? "text-slate-600" : ""}>
                      {d.month}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Transaction Data</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Add transactions over multiple months to see your income vs expenses trend.
                </p>
                <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
                  Add Transaction
                </Button>
              </div>
            )}
        </Card>

        {/* Expense Categories */}
        <Card className="p-6 flex flex-col hover:shadow-md transition-all group cursor-pointer">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Monthly expense breakdown.</p>
          </div>

          {categoryBreakdown.length > 0 ? (
              <>
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full flex-shrink-0 relative"
                       style={{ background: categoryGradient }}>
                    <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-xs text-slate-400 font-medium">Total</span>
                      <span className="text-sm font-bold text-slate-900">{formatCompact(categoryTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {categoryBreakdown.slice(0, 5).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-600">{cat.name}</span>
                      </div>
                      <span className="font-medium text-slate-900">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingCart size={24} />
                </div>
                <h4 className="text-sm font-medium text-slate-800 mb-1">No Category Data</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Add expense transactions to see your spending breakdown by category.
                </p>
                <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
                  Add Transaction
                </Button>
              </div>
            )}
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2 w-full xl:w-auto">
            <FilterDropdown
              value={month === "all" ? "" : month.toString()}
              onChange={(value) => setMonth(value === "" ? "all" : Number(value))}
              options={MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
              placeholder="All Months"
              className="w-full text-slate-900"
              allowEmpty={true}
              emptyLabel="All Months"
              hideSearch={true}
            />
            <FilterDropdown
              value={year === "all" ? "" : year.toString()}
              onChange={(value) => setYear(value === "" ? "all" : Number(value))}
              options={Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => ({ value: y.toString(), label: y.toString() }))}
              placeholder="All Years"
              className="w-full text-slate-900"
              allowEmpty={true}
              emptyLabel="All Years"
              hideSearch={true}
            />
            <FilterDropdown
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              options={[
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
                { value: "contribution", label: "Contribution" },
                { value: "transfer", label: "Transfer" },
                { value: "cash_in", label: "Cash In" },
              ]}
              placeholder="All Types"
              className="w-full"
              allowEmpty={true}
              emptyLabel="All Types"
              hideSearch={true}
            />
                      </div>

          <div className="grid grid-cols-2 md:grid-cols-2 xl:flex items-center gap-2 w-full xl:w-auto">
            <FilterDropdown
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={allCategories.map((c) => ({
                value: c.id,
                label: c.category_name,
                icon: c.icon ? getLucideIcon(c.icon) : undefined,
              }))}
              placeholder="All Categories"
              className="w-full"
              allowEmpty={true}
              emptyLabel="All Categories"
              hideSearch={false}
            />
          </div>

          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to Current Month" onClick={resetFilters}>
              <RotateCcw size={14} /> Current
            </Button>
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to All Time" onClick={resetFiltersToAll}>
              <RotateCcw size={14} /> All Time
            </Button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && !loading && (
        <Card className="p-8 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RotateCcw size={14} /> Retry
          </Button>
        </Card>
      )}

      {/* Transactions Display */}
      {transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No transactions found</h3>
          <p className="text-xs text-slate-400 mb-4">
            {search ? "Try adjusting your search or filters." : "Add your first transaction to get started."}
          </p>
          {!search && (
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setAddModalOpen(true)}>
              <Plus size={14} /> Add Transaction
            </Button>
          )}
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
          {tableLoading ? (
            <FilterTableSkeleton rows={pageSize} columns={6} />
          ) : (
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
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={32} className="text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">No transactions match your filters</p>
                        <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      ) : tableLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <TransactionCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Transaction Cards Grid (Desktop) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transactions.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <Inbox size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No transactions match your filters</p>
                  <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                    Clear Filters
                  </Button>
                </Card>
              </div>
            ) : (
              transactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* Transaction Cards Grid (Mobile) */}
          <div className="md:hidden space-y-4">
            {transactions.length === 0 ? (
              <Card className="p-12 text-center">
                <Inbox size={32} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No transactions match your filters</p>
                <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              transactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !tableLoading && !error && transactions.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
          </div>
          <div className="flex items-center gap-4">
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousPage}
                  disabled={!hasPreviousPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize === Number.MAX_SAFE_INTEGER ? "all" : pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="text-sm border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddTransactionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refetch}
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
        onSuccess={refetch}
      />
      <DeleteTransactionModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        transaction={selectedTx}
        onSuccess={refetch}
      />
    </div>
  );
}
