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
    Search,
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
    Flag,
    PhilippinePeso,
    Laptop,
    TrendingUp,
    Building,
    Briefcase,
    Rocket,
    Gift,
    Banknote,
    FileText,
} from "lucide-react";
import { DateSelector } from "@/components/ui/date-selector";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { createClient } from "@/lib/supabase/client";
import { updateAdminBudget } from "../_lib/admin-budget-service";
import type { AdminBudget } from "../_lib/types";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface EditAdminBudgetModalProps {
    open: boolean;
    onClose: () => void;
    budget: AdminBudget | null;
    onSuccess: () => void;
}

const STEPS = ["User Select", "Details", "Review"];

const PERIOD_OPTIONS = [
    { value: "day", label: "Daily", desc: "Budget resets every day." },
    { value: "week", label: "Weekly", desc: "Budget resets every week." },
    { value: "month", label: "Monthly", desc: "Budget resets every month." },
    { value: "quarter", label: "Quarterly", desc: "Budget resets every quarter." },
    { value: "year", label: "Yearly", desc: "Budget resets every year." },
    { value: "custom", label: "Custom", desc: "Custom date range." },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
];

function getLucideIcon(emoji: string): React.ComponentType<any> {
    const iconMap: Record<string, React.ComponentType<any>> = {
        "🏠": Home, "🚗": Car, "🍽️": Utensils, "🛒": ShoppingCart, "💡": Zap,
        "⚕️": Heart, "🎬": Film, "🛍️": Package, "📚": BookOpen, "🛡️": Shield,
        "🎯": Flag, "💰": PhilippinePeso, "💻": Laptop, "📈": TrendingUp,
        "🏢": Building, "💼": Briefcase, "🚀": Rocket, "🎁": Gift, "💵": Banknote,
        "📋": FileText,
    };
    return iconMap[emoji] || FileText;
}

type FormData = {
    user_id: string;
    budget_name: string;
    amount: string;
    period: string;
    start_date: string;
    end_date: string;
    category_id: string;
    description: string;
    status: string;
};

type User = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
};

type CategoryOption = {
    id: string;
    category_name: string;
    icon: string | null;
    color: string | null;
};

export function EditAdminBudgetModal({ open, onClose, budget, onSuccess }: EditAdminBudgetModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [expenseCategories, setExpenseCategories] = useState<CategoryOption[]>([]);
    const userListRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<FormData>({
        user_id: "",
        budget_name: "",
        amount: "",
        period: "month",
        start_date: "",
        end_date: "",
        category_id: "",
        description: "",
        status: "active",
    });

    // Pre-fill form when modal opens
    useEffect(() => {
        if (open && budget) {
            setFormData({
                user_id: budget.user_id,
                budget_name: budget.budget_name,
                amount: budget.amount.toString(),
                period: budget.period,
                start_date: budget.start_date,
                end_date: budget.end_date,
                category_id: budget.category_id || "",
                description: budget.description || "",
                status: budget.status,
            });
            setCurrentStep(1);
            if (users.length === 0) {
                loadUsers(true);
            }
            loadUserData(budget.user_id);
        }
    }, [open, budget]);

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

    const loadUserData = async (userId: string) => {
        const supabase = createClient();

        const { data: expenseCatsData } = await supabase
            .from("expense_categories")
            .select("id, category_name, icon, color")
            .eq("user_id", userId)
            .eq("is_active", true)
            .order("category_name");
        setExpenseCategories(expenseCatsData ?? []);
    };

    // Search debounce
    useEffect(() => {
        if (open && currentStep === 1) {
            const timeoutId = setTimeout(() => {
                loadUsers(true);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [userSearchQuery, open, currentStep]);

    // Infinite scroll
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

    const handleClose = () => {
        setCurrentStep(1);
        setUserSearchQuery("");
        setExpenseCategories([]);
        onClose();
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            if (!formData.user_id) {
                toast.error("Please select a user");
                return;
            }
            if (formData.user_id !== budget?.user_id) {
                await loadUserData(formData.user_id);
            }
        }
        if (currentStep === 2) {
            if (!formData.budget_name.trim()) {
                toast.error("Budget name is required");
                return;
            }
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                toast.error("Amount must be greater than 0");
                return;
            }
            if (!formData.start_date || !formData.end_date) {
                toast.error("Start and end dates are required");
                return;
            }
            if (!formData.category_id) {
                toast.error("Category is required");
                return;
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!budget) return;

        try {
            setLoading(true);
            const { error } = await updateAdminBudget(budget.id, {
                budget_name: formData.budget_name,
                amount: formData.amount,
                period: formData.period,
                start_date: formData.start_date,
                end_date: formData.end_date,
                category_id: formData.category_id,
                description: formData.description,
                status: formData.status,
            });

            if (error) {
                toast.error(error);
                return;
            }

            toast.success("Budget updated successfully");
            handleClose();
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update budget");
        } finally {
            setLoading(false);
        }
    };

    const updateField = useCallback(
        <K extends keyof FormData>(key: K, value: FormData[K]) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    if (!budget) return null;

    const selectedUser = users.find(u => u.id === formData.user_id);
    const selectedPeriod = PERIOD_OPTIONS.find(p => p.value === formData.period);
    const selectedCategory = expenseCategories.find(c => c.id === formData.category_id);
    const selectedStatus = STATUS_OPTIONS.find(s => s.value === formData.status);

    return (
        <Modal open={open} onClose={handleClose} className="max-w-2xl">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Edit Budget
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
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Select User</h2>
                            <p className="text-[11px] text-gray-500">
                                Current user:{" "}
                                <span className="font-semibold text-emerald-600">
                                    {budget.user_email || "Unknown"}
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
                                        user_metadata: { full_name: user.full_name, avatar_url: user.avatar_url },
                                        app_metadata: {},
                                        created_at: "",
                                        aud: "authenticated"
                                    } as SupabaseUser;

                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, user_id: user.id })}
                                            className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${selected
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
                                                    className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
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

                {/* Step 2: Budget Details */}
                {currentStep === 2 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <PenSquare size={14} />
                                </div>
                                Budget Details
                            </h2>
                        </div>
                        <div className="space-y-5">
                            {/* Budget Name */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Budget Name <span className="text-gray-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.budget_name}
                                    onChange={(e) => updateField("budget_name", e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    placeholder="e.g., Groceries, Rent, Entertainment..."
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Budget Amount <span className="text-gray-400">*</span>
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

                            {/* Period + Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Period <span className="text-gray-400">*</span>
                                    </label>
                                    <SearchableDropdown
                                        value={formData.period}
                                        onChange={(value) => updateField("period", value)}
                                        options={PERIOD_OPTIONS.map((p) => ({
                                            value: p.value,
                                            label: p.label,
                                        }))}
                                        placeholder="Select period..."
                                        className="w-full"
                                        allowEmpty={false}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Status <span className="text-gray-400">*</span>
                                    </label>
                                    <SearchableDropdown
                                        value={formData.status}
                                        onChange={(value) => updateField("status", value)}
                                        options={STATUS_OPTIONS.map((s) => ({
                                            value: s.value,
                                            label: s.label,
                                        }))}
                                        placeholder="Select status..."
                                        className="w-full"
                                        allowEmpty={false}
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Start Date <span className="text-gray-400">*</span>
                                    </label>
                                    <DateSelector
                                        value={formData.start_date}
                                        onChange={(value) => updateField("start_date", value)}
                                        placeholder="Start date"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        End Date <span className="text-gray-400">*</span>
                                    </label>
                                    <DateSelector
                                        value={formData.end_date}
                                        onChange={(value) => updateField("end_date", value)}
                                        placeholder="End date"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Category <span className="text-gray-400">*</span>
                                </label>
                                <SearchableDropdown
                                    value={formData.category_id}
                                    onChange={(value) => updateField("category_id", value)}
                                    options={expenseCategories.map((c) => ({
                                        value: c.id,
                                        label: c.category_name,
                                        icon: c.icon ? getLucideIcon(c.icon) : undefined,
                                    }))}
                                    placeholder="Select category..."
                                    className="w-full"
                                    allowEmpty={false}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Description <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    placeholder="What is this budget for?"
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
                            {/* Period Display */}
                            <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Budget Period</div>
                                <div className="flex items-center justify-center gap-2 my-2">
                                    <span className="text-[24px] font-bold text-slate-900">
                                        {selectedPeriod?.label || formData.period}
                                    </span>
                                </div>
                            </div>

                            {/* Review Details */}
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-gray-100">
                                    <ReviewRow label="User" value={selectedUser?.full_name || selectedUser?.email || "—"} />
                                    <ReviewRow label="Budget Name" value={formData.budget_name || "—"} />
                                    <ReviewRow label="Amount" value={`₱${parseFloat(formData.amount || "0").toFixed(2)}`} />
                                    <ReviewRow label="Status" value={selectedStatus?.label || formData.status} />
                                    <ReviewRow label="Start Date" value={formData.start_date ? new Date(formData.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
                                    <ReviewRow label="End Date" value={formData.end_date ? new Date(formData.end_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
                                    <ReviewRow label="Category" value={selectedCategory?.category_name || "—"} />
                                    <ReviewRow label="Description" value={formData.description || "No description provided."} italic={!formData.description} />
                                </div>
                            </div>

                            {/* Warning Notice */}
                            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 items-start">
                                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                                <div>
                                    <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">Action is final</h4>
                                    <p className="text-[11px] leading-relaxed">
                                        The budget will be updated immediately. Please ensure all details are correct.
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
                        {loading ? (<><Loader2 size={14} className="animate-spin" /> Updating...</>) : (<>Update Budget <Check size={14} /></>)}
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
