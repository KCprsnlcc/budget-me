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
    Search,
    Users,
    Eye,
    Shield,
    Home,
    GraduationCap,
    Plane,
    Car,
    TrendingUp,
    Flag,
    Info,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { DateSelector } from "@/components/ui/date-selector";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/user-avatar";
import { createAdminGoal } from "../_lib/admin-goal-service";
import type { AdminGoalFormState, GoalPriority, GoalCategory } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Skeleton from "react-loading-skeleton";
import { cn } from "@/lib/utils";

const STEPS = ["User Select", "Category", "Details", "Review"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    emergency: Shield,
    vacation: Plane,
    house: Home,
    car: Car,
    education: GraduationCap,
    retirement: TrendingUp,
    debt: ArrowRight,
    general: Flag,
};

const GOAL_CATEGORIES: { value: GoalCategory; label: string; desc: string }[] = [
    { value: "emergency", label: "Emergency Fund", desc: "Build a safety net for unexpected expenses" },
    { value: "vacation", label: "Vacation", desc: "Save for travel and leisure activities" },
    { value: "house", label: "Housing", desc: "Save for home purchase or renovation" },
    { value: "car", label: "Transportation", desc: "Save for vehicle purchase or maintenance" },
    { value: "education", label: "Education", desc: "Fund education and learning expenses" },
    { value: "retirement", label: "Retirement", desc: "Build long-term retirement savings" },
    { value: "debt", label: "Debt Payoff", desc: "Pay off loans and credit obligations" },
    { value: "general", label: "General", desc: "Other savings goals and objectives" },
];

const GOAL_PRIORITIES: { value: GoalPriority; label: string }[] = [
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
];

const formatCurrency = (amount: string | number): string => {
    const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

const formatDate = (dateString: string): string => {
    if (!dateString) return "No date set";
    try {
        return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "Invalid date";
    }
};

type UserOption = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
};

type FamilyOption = {
    id: string;
    family_name: string;
};

interface AddAdminGoalModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddAdminGoalModal({ open, onClose, onSuccess }: AddAdminGoalModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [families, setFamilies] = useState<FamilyOption[]>([]);
    const [saveError, setSaveError] = useState<string | null>(null);
    const userListRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState<AdminGoalFormState>({
        user_id: "",
        goal_name: "",
        description: "",
        target_amount: "",
        current_amount: "",
        priority: "medium",
        category: "general",
        target_date: "",
        is_family_goal: false,
        auto_contribute_amount: "",
        notes: "",
        family_id: "",
    });

    // Load users when modal opens
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

    // Trigger search when query changes
    useEffect(() => {
        if (open && step === 1) {
            const timeoutId = setTimeout(() => {
                loadUsers(true);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [userSearchQuery, open, step]);

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
        if (listElement && open && step === 1) {
            listElement.addEventListener("scroll", handleScroll);
            return () => listElement.removeEventListener("scroll", handleScroll);
        }
    }, [loadingMore, hasMore, open, step, loadUsers]);

    // Load families for the selected user
    const loadUserFamilies = async (userId: string) => {
        const supabase = createClient();
        const { data } = await supabase
            .from("family_members")
            .select("family_id, families!family_members_family_id_fkey(id, family_name)")
            .eq("user_id", userId)
            .eq("status", "active");

        const familyList: FamilyOption[] = (data ?? [])
            .map((fm: any) => ({
                id: fm.families?.id,
                family_name: fm.families?.family_name ?? "Unknown Family",
            }))
            .filter((f: any) => f.id);

        setFamilies(familyList);
    };

    const handleClose = useCallback(() => {
        setStep(1);
        setUserSearchQuery("");
        setForm({
            user_id: "",
            goal_name: "",
            description: "",
            target_amount: "",
            current_amount: "",
            priority: "medium",
            category: "general",
            target_date: "",
            is_family_goal: false,
            auto_contribute_amount: "",
            notes: "",
            family_id: "",
        });
        setFamilies([]);
        setSaveError(null);
        onClose();
    }, [onClose]);

    const handleNext = async () => {
        if (step === 1) {
            if (!form.user_id) {
                toast.error("Please select a user");
                return;
            }
            await loadUserFamilies(form.user_id);
        }
        if (step === 3) {
            if (!form.goal_name.trim()) {
                toast.error("Please enter a goal name");
                return;
            }
            if (!form.target_amount || parseFloat(form.target_amount) <= 0) {
                toast.error("Target amount must be greater than 0");
                return;
            }
        }
        if (step >= STEPS.length) {
            handleSubmit();
            return;
        }
        setStep((prev) => Math.min(prev + 1, STEPS.length));
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setSaveError(null);
            const { error } = await createAdminGoal(form);

            if (error) {
                setSaveError(error);
                return;
            }

            toast.success("Goal created successfully");
            handleClose();
            onSuccess();
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Failed to create goal");
        } finally {
            setLoading(false);
        }
    };

    const updateField = useCallback(
        <K extends keyof AdminGoalFormState>(key: K, value: AdminGoalFormState[K]) => {
            setForm((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const selectCategory = useCallback((category: GoalCategory) => {
        updateField("category", category);
    }, [updateField]);

    const canContinue =
        (step === 1 && form.user_id !== "") ||
        (step === 2 && form.category !== "general") ||
        (step === 3 && form.goal_name !== "" && form.target_amount !== "") ||
        step === 4;

    const selectedUser = users.find((u) => u.id === form.user_id);
    const selectedCategory = GOAL_CATEGORIES.find((c) => c.value === form.category);
    const selectedPrio = GOAL_PRIORITIES.find((p) => p.value === form.priority);
    const selectedFamily = families.find((f) => f.id === form.family_id);

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[520px]">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Create Goal
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                        Step {step} of 4
                    </span>
                </div>
            </ModalHeader>

            <Stepper steps={STEPS} currentStep={step} />

            <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
                {/* Step 1: User Select */}
                {step === 1 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Select User</h2>
                            <p className="text-[11px] text-gray-500">Choose the user for this goal.</p>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                            />
                        </div>

                        {loadingUsers ? (
                            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <UserCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div ref={userListRef} className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
                                {users.map((user, idx) => {
                                    const selected = form.user_id === user.id;
                                    const supabaseUser: SupabaseUser = {
                                        id: user.id,
                                        email: user.email,
                                        user_metadata: { full_name: user.full_name, avatar_url: user.avatar_url },
                                        app_metadata: {},
                                        created_at: "",
                                        aud: "authenticated",
                                    } as SupabaseUser;

                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => updateField("user_id", user.id)}
                                            className={cn(
                                                "relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white",
                                                selected
                                                    ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                            )}
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
                                                    className={cn(
                                                        "w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200",
                                                        selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                    )}
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

                {/* Step 2: Category Selection */}
                {step === 2 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Choose Goal Category</h2>
                            <p className="text-[11px] text-gray-500">Select what type of goal you want to create</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
                            {GOAL_CATEGORIES.map((category, idx) => {
                                const IconComponent = CATEGORY_ICONS[category.value];
                                const selected = form.category === category.value;
                                return (
                                    <button
                                        key={category.value}
                                        type="button"
                                        onClick={() => selectCategory(category.value)}
                                        className={cn(
                                            "relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white",
                                            selected
                                                ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                        )}
                                        style={{ animationDelay: `${idx * 60}ms` }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white",
                                                    selected
                                                        ? "text-gray-700 border-gray-200"
                                                        : "text-gray-400 border-gray-100"
                                                )}
                                            >
                                                {IconComponent ? <IconComponent size={18} /> : null}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{category.label}</h3>
                                                <p className="text-[11px] text-gray-500 leading-relaxed">{category.desc}</p>
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200",
                                                    selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                )}
                                            >
                                                <Check size={10} />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 3: Goal Details */}
                {step === 3 && (
                    <div className="space-y-4 animate-txn-in">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Goal Details</h4>
                            <p className="text-xs text-slate-500">Configure your goal parameters</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Goal Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.goal_name}
                                    onChange={(e) => updateField("goal_name", e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                    placeholder="e.g., Emergency Fund"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Target Amount <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
                                        <input
                                            type="number"
                                            value={form.target_amount}
                                            onChange={(e) => updateField("target_amount", e.target.value)}
                                            className="w-full pl-6 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Current Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
                                        <input
                                            type="number"
                                            value={form.current_amount}
                                            onChange={(e) => updateField("current_amount", e.target.value)}
                                            className="w-full pl-6 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Monthly Contribution</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
                                        <input
                                            type="number"
                                            value={form.auto_contribute_amount}
                                            onChange={(e) => updateField("auto_contribute_amount", e.target.value)}
                                            className="w-full pl-6 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Priority</label>
                                    <SearchableDropdown
                                        value={form.priority}
                                        onChange={(value) => updateField("priority", value as GoalPriority)}
                                        options={GOAL_PRIORITIES.map((priority) => ({
                                            value: priority.value,
                                            label: priority.label,
                                        }))}
                                        placeholder="Select priority"
                                        allowEmpty={false}
                                        hideSearch={true}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Deadline</label>
                                <DateSelector
                                    value={form.target_date}
                                    onChange={(value) => updateField("target_date", value)}
                                    placeholder="Select date"
                                />
                            </div>

                            <Checkbox
                                id="isFamily"
                                checked={form.is_family_goal || false}
                                onChange={(checked) => updateField("is_family_goal", checked)}
                                disabled={families.length === 0}
                                label="This is a family goal"
                            />

                            {form.is_family_goal && families.length > 0 && (
                                <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                                    <Users size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <div className="font-medium text-sm mb-1 text-gray-900">Family Goal</div>
                                            <div className="text-xs text-gray-600">
                                                This goal will be shared with the selected family for collaborative tracking.
                                            </div>
                                        </div>
                                        <SearchableDropdown
                                            value={form.family_id}
                                            onChange={(value) => updateField("family_id", value)}
                                            options={families.map((f) => ({
                                                value: f.id,
                                                label: f.family_name,
                                                icon: Users,
                                            }))}
                                            placeholder="Select family..."
                                            allowEmpty={false}
                                        />
                                    </div>
                                </div>
                            )}

                            {families.length === 0 && (
                                <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">No Family Available</div>
                                        <div className="text-xs text-gray-600">
                                            The selected user must be part of a family to create family goals.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => updateField("notes", e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 min-h-[80px]"
                                    placeholder="Add any additional details or notes"
                                />
                            </div>

                            <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-3">
                                <Info size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />
                                <div>
                                    <div className="font-medium text-sm text-gray-900">Goal Planning</div>
                                    <div className="text-xs text-gray-600">
                                        Set realistic targets and monthly contributions to help the user stay on track
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div className="space-y-4 animate-txn-in">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Review Goal</h4>
                            <p className="text-xs text-slate-500">Confirm the goal details before creating</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-5 space-y-0 divide-y divide-gray-100">
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">User</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{selectedUser?.full_name || selectedUser?.email || "—"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Goal Name</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{form.goal_name || "Untitled Goal"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Target Amount</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(form.target_amount || "0")}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Current Amount</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(form.current_amount || "0")}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Monthly Contribution</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{formatCurrency(form.auto_contribute_amount || "0")}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Category</span>
                                    <span className="text-[13px] font-semibold text-gray-700">
                                        {GOAL_CATEGORIES.find((cat) => cat.value === form.category)?.label || "Other"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Priority</span>
                                    <span className="text-[13px] font-semibold text-gray-700">
                                        {GOAL_PRIORITIES.find((p) => p.value === form.priority)?.label || "Medium"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Deadline</span>
                                    <span className="text-[13px] font-semibold text-gray-700">{formatDate(form.target_date)}</span>
                                </div>
                                {form.is_family_goal && selectedFamily && (
                                    <div className="flex justify-between items-center py-2.5">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Family Goal</span>
                                        <span className="text-[13px] font-semibold text-gray-700 flex items-center gap-2">
                                            <Users size={14} /> {selectedFamily.family_name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {saveError && (
                            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 items-start">
                                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
                                <div>
                                    <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                                    <p className="text-[11px] leading-relaxed">{saveError}</p>
                                </div>
                            </div>
                        )}

                        <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-start gap-3">
                            <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                            <div>
                                <div className="font-medium text-sm text-gray-900">Ready to Create</div>
                                <div className="text-xs text-gray-600">
                                    The goal is ready to be created and will start tracking immediately
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="flex justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className={cn("transition-all", step === 1 ? "invisible" : "")}
                >
                    <ArrowLeft size={14} className="mr-1" />
                    Back
                </Button>
                <div className="flex-1" />
                <Button
                    size="sm"
                    onClick={handleNext}
                    disabled={!canContinue || loading}
                    className="bg-emerald-500 hover:bg-emerald-600"
                >
                    {step === 4 ? (
                        loading ? (<><Loader2 size={14} className="animate-spin mr-1" /> Creating...</>) : (<>Create Goal <ArrowRight size={14} className="ml-1" /></>)
                    ) : (
                        <>Continue <ArrowRight size={14} className="ml-1" /></>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

function UserCardSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-start gap-4">
                <Skeleton circle width={40} height={40} />
                <div className="flex-1">
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="80%" height={10} className="mt-1" />
                </div>
            </div>
        </div>
    );
}
