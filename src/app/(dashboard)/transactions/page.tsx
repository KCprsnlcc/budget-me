import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
  Music,
  Briefcase,
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

export const metadata = { title: "BudgetMe - Transactions" };

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Shopping: ShoppingBag,
  "Food & Dining": Utensils,
  Transportation: Car,
  Housing: Home,
  Utilities: Zap,
  Entertainment: Music,
  Income: Briefcase,
};

const TRANSACTIONS = [
  { id: 1, name: "Amazon Purchase", category: "Shopping", date: "Feb 10, 2026", amount: -89.99, status: "completed" },
  { id: 2, name: "Salary Deposit", category: "Income", date: "Feb 9, 2026", amount: 4225.0, status: "completed" },
  { id: 3, name: "Grocery Store", category: "Food & Dining", date: "Feb 9, 2026", amount: -67.5, status: "completed" },
  { id: 4, name: "Electric Bill", category: "Utilities", date: "Feb 8, 2026", amount: -142.0, status: "pending" },
  { id: 5, name: "Gas Station", category: "Transportation", date: "Feb 8, 2026", amount: -55.2, status: "completed" },
  { id: 6, name: "Netflix", category: "Entertainment", date: "Feb 7, 2026", amount: -15.99, status: "completed" },
  { id: 7, name: "Freelance Payment", category: "Income", date: "Feb 7, 2026", amount: 850.0, status: "completed" },
  { id: 8, name: "Rent Payment", category: "Housing", date: "Feb 5, 2026", amount: -1800.0, status: "completed" },
  { id: 9, name: "Spotify Premium", category: "Entertainment", date: "Feb 4, 2026", amount: -9.99, status: "completed" },
  { id: 10, name: "Restaurant", category: "Food & Dining", date: "Feb 3, 2026", amount: -45.0, status: "completed" },
];

const SUMMARY = [
  { label: "Total Income", value: "$5,075.00", change: "+12.3%", trend: "up" },
  { label: "Total Expenses", value: "$2,225.67", change: "-8.1%", trend: "down" },
  { label: "Net Flow", value: "+$2,849.33", change: "+24.5%", trend: "up" },
  { label: "Transactions", value: "47", change: "+3", trend: "up" },
];

export default function TransactionsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
            Transactions
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            View and manage all your financial transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download size={14} /> Export
          </Button>
          <Button size="sm">
            <Plus size={14} /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              {item.label}
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{item.value}</div>
            <div className={`text-[10px] font-medium mt-1 ${item.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {item.change} vs last month
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter size={14} /> Filters
            </Button>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500">
              <option>All Categories</option>
              <option>Income</option>
              <option>Shopping</option>
              <option>Food & Dining</option>
              <option>Transportation</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500">
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {TRANSACTIONS.map((tx) => {
              const CategoryIcon = CATEGORY_ICONS[tx.category] || ShoppingBag;
              const isIncome = tx.amount > 0;
              return (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isIncome ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}`}>
                        {isIncome ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <span className="font-medium text-slate-800">{tx.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CategoryIcon size={12} className="text-slate-400" />
                      {tx.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">{tx.date}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "completed" ? "success" : "warning"}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${isIncome ? "text-emerald-600" : "text-slate-800"}`}>
                      {isIncome ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded hover:bg-slate-50">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
