"use client";

import { useState, useEffect } from "react";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Search
} from "lucide-react";
import { DateSelector } from "@/components/ui/date-selector";
import { createClient } from "@/lib/supabase/client";
import type { AdminTransaction } from "../_lib/types";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface EditAdminTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: AdminTransaction | null;
  onSuccess: () => void;
}

const STEPS = ["User Select", "Details", "Review"];

const TRANSACTION_TYPES = [
  { value: "income", label: "Income", desc: "Money received or earned", icon: TrendingUp, color: "text-emerald-500" },
  { value: "expense", label: "Expense", desc: "Money spent or paid out", icon: TrendingDown, color: "text-red-500" },
  { value: "cash_in", label: "Cash In", desc: "Cash deposit or transfer in", icon: ArrowDownLeft, color: "text-blue-500" },
  { value: "cash_out", label: "Cash Out", desc: "Cash withdrawal or transfer out", icon: ArrowUpRight, color: "text-orange-500" },
];

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

type FormData = {
  user_id: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  notes: string;
  status: string;
  category: string;
  account_id: string;
  expense_category_id: string;
  income_category_id: string;
};

type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

export function EditAdminTransactionModal({ open, onClose, transaction, onSuccess }: EditAdminTransactionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    user_id: "",
    type: "expense",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    notes: "",
    status: "completed",
    category: "",
    account_id: "",
    expense_category_id: "",
    income_category_id: "",
  });

  // Load transaction data when modal opens
  useEffect(() => {
    if (open && transaction) {
      setFormData({
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        date: transaction.date,
        description: transaction.description || "",
        notes: transaction.notes || "",
        status: transaction.status,
        category: transaction.category || "",
        account_id: transaction.account_id || "",
        expense_category_id: transaction.expense_category_id || "",
        income_category_id: transaction.income_category_id || "",
      });
      setCurrentStep(1);
      loadUsers();
      loadUserData(transaction.user_id);
    }
  }, [open, transaction]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .order("email");
    setUsers(data ?? []);
    setLoadingUsers(false);
  };

  // Load user-specific data when user is selected
  const loadUserData = async (userId: string) => {
    const supabase = createClient();
    
    // Load accounts
    const { data: accountsData } = await supabase
      .from("accounts")
      .select("id, account_name, account_number_masked")
      .eq("user_id", userId)
      .order("account_name");
    setAccounts(accountsData ?? []);

    // Load expense categories
    const { data: expenseCatsData } = await supabase
      .from("expense_categories")
      .select("id, category_name, icon, color")
      .eq("user_id", userId)
      .order("category_name");
    setExpenseCategories(expenseCatsData ?? []);

    // Load income categories
    const { data: incomeCatsData } = await supabase
      .from("income_categories")
      .select("id, category_name, icon, color")
      .eq("user_id", userId)
      .order("category_name");
    setIncomeCategories(incomeCatsData ?? []);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setUserSearchQuery("");
    setAccounts([]);
    setExpenseCategories([]);
    setIncomeCategories([]);
    onClose();
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.user_id) {
        toast.error("Please select a user");
        return;
      }
      // Load user data for step 2 if user changed
      if (formData.user_id !== transaction?.user_id) {
        await loadUserData(formData.user_id);
      }
    }
    if (currentStep === 2) {
      if (!formData.type || !formData.amount || !formData.date) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (parseFloat(formData.amount) <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!transaction) return;

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
        status: formData.status,
        account_id: formData.account_id || null,
        expense_category_id: null,
        income_category_id: null,
      };

      // Set category IDs based on type
      if (formData.type === "expense" && formData.expense_category_id) {
        payload.expense_category_id = formData.expense_category_id;
      } else if ((formData.type === "income" || formData.type === "cash_in") && formData.income_category_id) {
        payload.income_category_id = formData.income_category_id;
      }

      const { error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", transaction.id);

      if (error) throw error;

      toast.success("Transaction updated successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  const selectedUser = users.find(u => u.id === formData.user_id);
  const selectedType = TRANSACTION_TYPES.find(t => t.value === formData.type);
  const selectedAccount = accounts.find(a => a.id === formData.account_id);
  const selectedCategory = formData.type === "expense" 
    ? expenseCategories.find(c => c.id === formData.expense_category_id)
    : incomeCategories.find(c => c.id === formData.income_category_id);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Edit Transaction
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {currentStep} of 3
          </span>
        </div>
      </ModalHeader>
      
      <Stepper steps={STEPS} currentStep={currentStep} />
      
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {/* Step 1: User Select */}
        {currentStep === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1">Select User</h2>
              <p className="text-[11px] text-slate-500">
                Current user:{" "}
                <span className="font-semibold text-emerald-600">
                  {transaction.user_email || "Unknown"}
                </span>
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
              />
            </div>
            
            {loadingUsers ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto text-slate-400" size={24} />
                <p className="text-sm text-slate-500 mt-2">Loading users...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {users
                  .filter(user => {
                    if (!userSearchQuery.trim()) return true;
                    const query = userSearchQuery.toLowerCase();
                    return (
                      user.email.toLowerCase().includes(query) ||
                      (user.full_name && user.full_name.toLowerCase().includes(query))
                    );
                  })
                  .map((user, idx) => {
                  const selected = formData.user_id === user.id;
                  
                  // Create mock Supabase user for UserAvatar
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
                          : "border-slate-200 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
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
                          <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">
                            {user.full_name || "No Name"}
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{user.email}</p>
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
                {users.filter(user => {
                  if (!userSearchQuery.trim()) return true;
                  const query = userSearchQuery.toLowerCase();
                  return (
                    user.email.toLowerCase().includes(query) ||
                    (user.full_name && user.full_name.toLowerCase().includes(query))
                  );
                }).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No users found matching "{userSearchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Transaction Details */}
        {currentStep === 2 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 bg-white">
                  <PenSquare size={14} />
                </div>
                Transaction Details
              </h2>
            </div>
            <div className="space-y-5">
              {/* Transaction Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Transaction Type <span className="text-slate-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSACTION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const selected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={selected ? type.color : "text-slate-400"} />
                          <span className="text-[12px] font-semibold text-slate-900">{type.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Amount <span className="text-slate-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Date <span className="text-slate-400">*</span>
                  </label>
                  <DateSelector
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value })}
                    placeholder="Select date"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="Brief description"
                />
              </div>

              {/* Account and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Account
                  </label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} {acc.account_number_masked ? `(${acc.account_number_masked})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Category
                  </label>
                  {formData.type === "expense" ? (
                    <select
                      value={formData.expense_category_id}
                      onChange={(e) => setFormData({ ...formData, expense_category_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                    >
                      <option value="">Select category</option>
                      {expenseCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.category_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={formData.income_category_id}
                      onChange={(e) => setFormData({ ...formData, income_category_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                    >
                      <option value="">Select category</option>
                      {incomeCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.category_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06] resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
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
              {/* Transaction Type Display */}
              <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Updated Transaction Type</div>
                <div className="flex items-center justify-center gap-2 my-2">
                  {selectedType && (
                    <>
                      <selectedType.icon size={20} className={selectedType.color} />
                      <span className="text-[24px] font-bold text-slate-900">{selectedType.label}</span>
                    </>
                  )}
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white text-slate-500 uppercase tracking-wider inline-block mt-2 border border-slate-100">
                  {formData.status}
                </span>
              </div>

              {/* Review Details */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <ReviewRow label="User" value={selectedUser?.full_name || selectedUser?.email || "—"} />
                  <ReviewRow label="Amount" value={`₱${parseFloat(formData.amount || "0").toFixed(2)}`} />
                  <ReviewRow label="Date" value={formData.date} />
                  <ReviewRow label="Description" value={formData.description || "—"} />
                  <ReviewRow label="Account" value={selectedAccount?.account_name || "Not selected"} />
                  <ReviewRow label="Category" value={selectedCategory?.category_name || "Not selected"} />
                  <ReviewRow label="Notes" value={formData.notes || "—"} />
                </div>
              </div>

              {/* Success Notice */}
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">Changes Summary</h4>
                  <p className="text-[11px] leading-relaxed">
                    Review your changes before saving. The transaction will be updated immediately.
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
            {loading ? (<><Loader2 size={14} className="animate-spin" /> Saving...</>) : (<>Save Changes <Check size={14} /></>)}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
      <span className="text-[13px] font-semibold text-slate-700">{value}</span>
    </div>
  );
}
