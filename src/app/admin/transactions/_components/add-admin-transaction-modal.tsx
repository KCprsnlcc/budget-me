"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { toast } from "sonner";
import { 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ClipboardCheck, 
  PenSquare, 
  AlertTriangle,
  TrendingUp,
  Search,
  MinusCircle,
  PlusCircle,
  Flag,
  PiggyBank,
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
  Building,
  Briefcase,
  Rocket,
  Gift,
  Banknote,
  FileText,
  CreditCard,
  Wallet,
  Building2,
  Landmark,
} from "lucide-react";
import { DateSelector } from "@/components/ui/date-selector";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AddAdminTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = ["User Select", "Details", "Review"];

const TRANSACTION_TYPES = [
  { value: "expense", label: "Expense", desc: "Money spent on goods, services, or bills.", icon: MinusCircle },
  { value: "income", label: "Income", desc: "Money received from salary, investments, or other sources.", icon: PlusCircle },
  { value: "contribution", label: "Contribution", desc: "Money allocated to savings goals or investments.", icon: Flag },
];

function getLucideIcon(emoji: string): React.ComponentType<any> {
  const iconMap: Record<string, React.ComponentType<any>> = {
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
    "🎯": Flag,
    "💰": PhilippinePeso,
    "💻": Laptop,
    "📈": TrendingUp,
    "🏢": Building,
    "💼": Briefcase,
    "🚀": Rocket,
    "🎁": Gift,
    "💵": Banknote,
    "📋": FileText,
  };
  return iconMap[emoji] || FileText;
}

function getAccountIcon(accountName: string): React.ComponentType<any> {
  const name = accountName.toLowerCase();
  if (name.includes("bank") || name.includes("checking") || name.includes("savings")) return Building2;
  if (name.includes("credit") || name.includes("card")) return CreditCard;
  if (name.includes("cash") || name.includes("wallet")) return Wallet;
  if (name.includes("investment") || name.includes("brokerage")) return TrendingUp;
  if (name.includes("loan") || name.includes("mortgage")) return Landmark;
  if (name.includes("utility") || name.includes("phone") || name.includes("internet")) return Zap;
  if (name.includes("car") || name.includes("auto")) return Car;
  if (name.includes("home") || name.includes("house")) return Home;
  return FileText;
}

function getBudgetIcon(categoryIcon: string | null | undefined): React.ComponentType<any> {
  if (!categoryIcon) return FileText;
  return getLucideIcon(categoryIcon);
}

type FormData = {
  user_id: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  notes: string;
  account_id: string;
  expense_category_id: string;
  income_category_id: string;
  budget_id: string;
  goal_id: string;
};

type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

type AccountOption = {
  id: string;
  account_name: string;
  account_number_masked: string | null;
  balance: number;
};

type CategoryOption = {
  id: string;
  category_name: string;
  icon: string | null;
  color: string | null;
};

type BudgetOption = {
  id: string;
  budget_name: string;
  category_icon?: string | null;
};

type GoalOption = {
  id: string;
  goal_name: string;
};

export function AddAdminTransactionModal({ open, onClose, onSuccess }: AddAdminTransactionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryOption[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryOption[]>([]);
  const [budgets, setBudgets] = useState<BudgetOption[]>([]);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const userListRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    user_id: "",
    type: "expense",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    notes: "",
    account_id: "",
    expense_category_id: "",
    income_category_id: "",
    budget_id: "",
    goal_id: "",
  });

  useEffect(() => {
    if (open && users.length === 0) {
      loadUsers(true);
    }
  }, [open]);

  const loadUsers = useCallback(async (reset: boolean = false) => {
    if (reset) {
      setLoadingUsers(true);
      setPage(1);
      setUsers([]);
      setHasMore(true);
    } else {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);
    }

    const supabase = createClient();
    const pageSize = 10;
    const currentPage = reset ? 1 : page;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .order("email")
      .range(from, to);

    if (userSearchQuery.trim()) {
      const searchTerm = userSearchQuery.toLowerCase();
      query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      if (reset) {
        setUsers(data);
        setPage(2);
      } else {

        setUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUsers = data.filter(u => !existingIds.has(u.id));
          return [...prev, ...newUsers];
        });
        setPage(prev => prev + 1);
      }

      setHasMore(data.length === pageSize);
    }

    setLoadingUsers(false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, userSearchQuery]);

  useEffect(() => {
    if (open && currentStep === 1) {
      const timeoutId = setTimeout(() => {
        loadUsers(true);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [userSearchQuery, open, currentStep]);

  useEffect(() => {
    const handleScroll = () => {
      if (!userListRef.current || loadingMore || !hasMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = userListRef.current;

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        loadUsers(false);
      }
    };

    const listElement = userListRef.current;
    if (listElement && open && currentStep === 1) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [loadingMore, hasMore, open, currentStep, loadUsers]);

  const loadUserData = async (userId: string) => {
    const supabase = createClient();

    const { data: accountsData } = await supabase
      .from("accounts")
      .select("id, account_name, account_number_masked, balance")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("account_name");
    setAccounts(accountsData ?? []);

    const { data: expenseCatsData } = await supabase
      .from("expense_categories")
      .select("id, category_name, icon, color")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("category_name");
    setExpenseCategories(expenseCatsData ?? []);

    const { data: incomeCatsData } = await supabase
      .from("income_categories")
      .select("id, category_name, icon, color")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("category_name");
    setIncomeCategories(incomeCatsData ?? []);

    const { data: budgetsData } = await supabase
      .from("budgets")
      .select(`
        id, 
        budget_name,
        expense_categories!budgets_category_id_fkey (
          icon
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("budget_name");
    setBudgets((budgetsData ?? []).map((budget: any) => ({
      id: budget.id,
      budget_name: budget.budget_name,
      category_icon: budget.expense_categories?.icon || null,
    })));

    const { data: goalsData } = await supabase
      .from("goals")
      .select("id, goal_name")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("goal_name");
    setGoals(goalsData ?? []);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setUserSearchQuery("");
    setFormData({
      user_id: "",
      type: "expense",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      notes: "",
      account_id: "",
      expense_category_id: "",
      income_category_id: "",
      budget_id: "",
      goal_id: "",
    });
    setAccounts([]);
    setExpenseCategories([]);
    setIncomeCategories([]);
    setBudgets([]);
    setGoals([]);
    onClose();
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.user_id) {
        toast.error("Please select a user");
        return;
      }

      await loadUserData(formData.user_id);
    }
    if (currentStep === 2) {
      if (!formData.type || !formData.amount || !formData.date || !formData.account_id) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (parseFloat(formData.amount) <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      if (formData.type === "income" && !formData.income_category_id) {
        toast.error("Please select an income category");
        return;
      }
      if ((formData.type === "expense" || formData.type === "contribution") && !formData.expense_category_id) {
        toast.error("Please select an expense category");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const payload: any = {
        user_id: formData.user_id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description || null,
        notes: formData.notes || null,
        status: "completed",
        account_id: formData.account_id || null,
        budget_id: formData.budget_id || null,
        goal_id: formData.goal_id || null,
        income_category_id: null,
        expense_category_id: null,
      };

      if (formData.type === "income" && formData.income_category_id) {
        payload.income_category_id = formData.income_category_id;
      } else if ((formData.type === "expense" || formData.type === "contribution") && formData.expense_category_id) {
        payload.expense_category_id = formData.expense_category_id;
      }

      const { error } = await supabase.from("transactions").insert(payload);

      if (error) throw error;

      toast.success("Transaction created successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === formData.user_id);
  const selectedType = TRANSACTION_TYPES.find(t => t.value === formData.type);
  const selectedAccount = accounts.find(a => a.id === formData.account_id);
  
  const categories = formData.type === "income" ? incomeCategories : expenseCategories;
  const categoryValue = formData.type === "income" ? formData.income_category_id : formData.expense_category_id;
  const selectedCategory = categories.find(c => c.id === categoryValue);
  const selectedGoal = goals.find(g => g.id === formData.goal_id);
  const selectedBudget = budgets.find(b => b.id === formData.budget_id);

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleGoalSelectWithCategory = useCallback((value: string) => {
    updateField("goal_id", value);
    
    if (formData.type === "contribution" && value) {
      let contributionCategory = expenseCategories.find(cat => 
        cat.category_name.toLowerCase() === "goal contribution" ||
        cat.category_name.toLowerCase() === "contribution"
      );
      
      if (!contributionCategory) {
        contributionCategory = expenseCategories.find(cat => 
          cat.category_name.toLowerCase() === "investments"
        );
      }
      
      if (!contributionCategory) {
        contributionCategory = expenseCategories.find(cat => 
          cat.category_name.toLowerCase().includes("goal") ||
          cat.category_name.toLowerCase().includes("saving") ||
          cat.category_name.toLowerCase().includes("investment")
        );
      }
      
      if (contributionCategory) {
        updateField("expense_category_id", contributionCategory.id);
        updateField("budget_id", "");
      }
    }
  }, [formData.type, expenseCategories, updateField]);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Add New Transaction
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {currentStep} of 3
          </span>
        </div>
      </ModalHeader>
      
      <Stepper steps={STEPS} currentStep={currentStep} />
      
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {}
        {currentStep === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-1">Select User</h2>
              <p className="text-[11px] text-gray-500">Choose the user for this transaction.</p>
            </div>
            
            {}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
              />
            </div>
            
            {loadingUsers ? (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div ref={userListRef} className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {users.map((user, idx) => {
                  const selected = formData.user_id === user.id;

                  const supabaseUser: SupabaseUser = {
                    id: user.id,
                    email: user.email,
                    user_metadata: {
                      full_name: user.full_name,
                      avatar_url: user.avatar_url
                    },
                    app_metadata: {},
                    created_at: "",
                    aud: "authenticated"
                  } as SupabaseUser;
                  
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, user_id: user.id })}
                      className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${
                        selected
                          ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                      }`}
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <UserAvatar 
                          user={supabaseUser} 
                          size="lg"
                          className="ring-2 ring-white shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">
                            {user.full_name || "No Name"}
                          </h3>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{user.email}</p>
                        </div>
                        <div
                          className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${
                            selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                          }`}
                        >
                          <Check size={10} />
                        </div>
                      </div>
                    </button>
                  );
                })}
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">
                      {userSearchQuery ? `No users found matching "${userSearchQuery}"` : "No users found"}
                    </p>
                  </div>
                )}
                
                {}
                {loadingMore && (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <UserCardSkeleton key={`loading-${i}`} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {}
        {currentStep === 2 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                  <PenSquare size={14} />
                </div>
                Transaction Details
              </h2>
            </div>
            <div className="space-y-5">
              {}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Transaction Type <span className="text-gray-400">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {TRANSACTION_TYPES.map((type, idx) => {
                    const Icon = type.icon;
                    const selected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateField("type", type.value)}
                        className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${
                          selected
                            ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                        }`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${
                              selected
                                ? "text-gray-700 border-gray-200"
                                : "text-gray-400 border-gray-100"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{type.label}</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{type.desc}</p>
                          </div>
                          {}
                          <div
                            className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${
                              selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                            }`}
                          >
                            <Check size={10} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Amount <span className="text-gray-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Date <span className="text-gray-400">*</span>
                </label>
                <DateSelector
                  value={formData.date}
                  onChange={(value) => updateField("date", value)}
                  placeholder="Select date"
                  className="w-full"
                />
              </div>

              {}
              <div className={`grid gap-4 ${formData.type === "expense" ? "grid-cols-2" : "grid-cols-1"}`}>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                    Category {formData.type === "income" || formData.type === "expense" ? <span className="text-gray-400">*</span> : null}
                  </label>
                  <SearchableDropdown
                    value={categoryValue}
                    onChange={(value) => updateField(formData.type === "income" ? "income_category_id" : "expense_category_id", value)}
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.category_name,
                      icon: c.icon ? getLucideIcon(c.icon) : undefined,
                    }))}
                    placeholder={formData.type === "contribution" ? "Auto-selected from goal" : "Select category..."}
                    className="w-full"
                    allowEmpty={false}
                    disabled={formData.type === "contribution"}
                  />
                  {formData.type === "contribution" && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Category is automatically selected based on the goal chosen
                    </p>
                  )}
                </div>
                {formData.type === "expense" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                      Budget
                    </label>
                    <SearchableDropdown
                      value={formData.budget_id}
                      onChange={(value) => updateField("budget_id", value)}
                      options={budgets.map((b) => ({
                        value: b.id,
                        label: b.budget_name,
                        icon: getBudgetIcon(b.category_icon),
                      }))}
                      placeholder="No budget"
                      className="w-full"
                      emptyLabel="No budget"
                    />
                  </div>
                )}
              </div>

              {}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Goal Contribution
                </label>
                <SearchableDropdown
                  value={formData.goal_id}
                  onChange={handleGoalSelectWithCategory}
                  options={goals.map((g) => ({
                    value: g.id,
                    label: g.goal_name,
                    icon: PiggyBank,
                  }))}
                  placeholder="No Goal"
                  className="w-full"
                  emptyLabel="No Goal"
                />
              </div>

              {}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Account <span className="text-gray-400">*</span>
                </label>
                <SearchableDropdown
                  value={formData.account_id}
                  onChange={(value) => updateField("account_id", value)}
                  options={accounts.map((a) => ({
                    value: a.id,
                    label: a.account_name,
                    icon: getAccountIcon(a.account_name),
                    subtitle: `Balance: ₱${a.balance.toFixed(2)}`,
                  }))}
                  placeholder="Select account..."
                  className="w-full"
                  allowEmpty={false}
                />
              </div>

              {}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Description <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="What was this transaction for?"
                />
              </div>

              {}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Notes <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06] resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>
        )}

        {}
        {currentStep === 3 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 bg-white">
                  <ClipboardCheck size={14} />
                </div>
                Review &amp; Confirm
              </h2>
            </div>
            <div className="space-y-4">
              {}
              <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Transaction Type</div>
                <div className="flex items-center justify-center gap-2 my-2">
                  {selectedType && (
                    <>
                      <selectedType.icon size={20} className="text-emerald-600" />
                      <span className="text-[24px] font-bold text-slate-900">{selectedType.label}</span>
                    </>
                  )}
                </div>
              </div>

              {}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-gray-100">
                  <ReviewRow label="User" value={selectedUser?.full_name || selectedUser?.email || "—"} />
                  <ReviewRow label="Amount" value={`₱${parseFloat(formData.amount || "0").toFixed(2)}`} />
                  <ReviewRow label="Date" value={formData.date ? new Date(formData.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
                  <ReviewRow label="Category" value={selectedCategory?.category_name || "—"} />
                  <ReviewRow label="Account" value={selectedAccount?.account_name || "Not selected"} />
                  {selectedAccount && (
                    <ReviewRow 
                      label="Current Balance" 
                      value={`₱${selectedAccount.balance.toFixed(2)}`} 
                    />
                  )}
                  {selectedAccount && (
                    <ReviewRow 
                      label="New Balance" 
                      value={`₱${(selectedAccount.balance + (formData.type === "income" ? parseFloat(formData.amount || "0") : -parseFloat(formData.amount || "0"))).toFixed(2)}`} 
                    />
                  )}
                  {selectedGoal && <ReviewRow label="Goal" value={selectedGoal.goal_name} />}
                  {selectedBudget && formData.type === "expense" && <ReviewRow label="Budget" value={selectedBudget.budget_name} />}
                  <ReviewRow label="Description" value={formData.description || "No description provided."} italic={!formData.description} />
                  <ReviewRow label="Notes" value={formData.notes || "—"} />
                </div>
              </div>

              {}
              {formData.type === "expense" && selectedBudget && (
                <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 items-start">
                  <TrendingUp size={16} className="flex-shrink-0 mt-px text-blue-500" />
                  <div>
                    <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Budget Impact</h4>
                    <p className="text-[11px] leading-relaxed">
                      This expense will add ₱{parseFloat(formData.amount || "0").toFixed(2)} to your <strong>{selectedBudget.budget_name}</strong> budget progress.
                    </p>
                  </div>
                </div>
              )}

              {}
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">Action is final</h4>
                  <p className="text-[11px] leading-relaxed">
                    The transaction will be created immediately and added to the user's account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button variant="secondary" size="sm" onClick={handleBack} disabled={loading}>
            <ArrowLeft size={14} /> Back
          </Button>
        ) : (
          <div />
        )}
        {currentStep < STEPS.length ? (
          <Button size="sm" onClick={handleNext} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
            Continue <ArrowRight size={14} />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
            {loading ? (<><Loader2 size={14} className="animate-spin" /> Creating...</>) : (<>Create Transaction <Check size={14} /></>)}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

function ReviewRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
      <span className={`text-[13px] font-semibold text-gray-700 ${italic ? "italic text-[11px] text-gray-500 max-w-[180px] text-right" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function UserCardSkeleton() {
  return (
    <div className="relative p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-40" />
        </div>
        <div className="w-[18px] h-[18px] rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
