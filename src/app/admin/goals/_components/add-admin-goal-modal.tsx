"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Stepper } from "../../transactions/_components/stepper";
import { toast } from "sonner";
import {
    Loader2,
    ArrowLeft,
    ArrowRight,
    Check,
    PenSquare,
    ClipboardCheck,
    Search,
    Target,
    Flag,
    Users,
    Eye,
} from "lucide-react";
import { DateSelector } from "@/components/ui/date-selector";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/user-avatar";
import { createAdminGoal } from "../_lib/admin-goal-service";
import type { AdminGoalFormState, GoalPriority, GoalCategory } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Skeleton from "react-loading-skeleton";

interface AddAdminGoalModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = ["User Select", "Details", "Review"];

const GOAL_CATEGORIES: { value: GoalCategory; label: string; emoji: string; desc: string }[] = [
    { value: "emergency", label: "Emergency Fund", emoji: "🚨", desc: "Safety net for unexpected expenses" },
    { value: "vacation", label: "Vacation", emoji: "🏖️", desc: "Travel and vacation savings" },
    { value: "house", label: "House", emoji: "🏠", desc: "Home purchase or renovation" },
    { value: "car", label: "Car", emoji: "🚗", desc: "Vehicle purchase or maintenance" },
    { value: "education", label: "Education", emoji: "📚", desc: "Tuition, courses, or training" },
    { value: "retirement", label: "Retirement", emoji: "🏦", desc: "Long-term retirement savings" },
    { value: "debt", label: "Debt Payment", emoji: "💳", desc: "Paying off debt or loans" },
    { value: "general", label: "General", emoji: "🎯", desc: "General savings goal" },
];

const GOAL_PRIORITIES: { value: GoalPriority; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "bg-slate-100 text-slate-600" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
    { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

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

export function AddAdminGoalModal({ open, onClose, onSuccess }: AddAdminGoalModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [families, setFamilies] = useState<FamilyOption[]>([]);
    const userListRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<AdminGoalFormState>({
        user_id: "",
        goal_name: "",
        description: "",
        target_amount: "",
        current_amount: "",
        priority: "medium",
        category: "general",
        target_date: "",
        is_family_goal: false,
        is_public: false,
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
            listElement.addEventListener("scroll", handleScroll);
            return () => listElement.removeEventListener("scroll", handleScroll);
        }
    }, [loadingMore, hasMore, open, currentStep, loadUsers]);

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

    const handleClose = () => {
        setCurrentStep(1);
        setUserSearchQuery("");
        setFormData({
            user_id: "",
            goal_name: "",
            description: "",
            target_amount: "",
            current_amount: "",
            priority: "medium",
            category: "general",
            target_date: "",
            is_family_goal: false,
            is_public: false,
            auto_contribute_amount: "",
            notes: "",
            family_id: "",
        });
        setFamilies([]);
        onClose();
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            if (!formData.user_id) {
                toast.error("Please select a user");
                return;
            }
            await loadUserFamilies(formData.user_id);
        }
        if (currentStep === 2) {
            if (!formData.goal_name.trim()) {
                toast.error("Please enter a goal name");
                return;
            }
            if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
                toast.error("Target amount must be greater than 0");
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
            const { error } = await createAdminGoal(formData);

            if (error) {
                toast.error(error);
                return;
            }

            toast.success("Goal created successfully");
            handleClose();
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create goal");
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find((u) => u.id === formData.user_id);
    const selectedCategory = GOAL_CATEGORIES.find((c) => c.value === formData.category);
    const selectedPrio = GOAL_PRIORITIES.find((p) => p.value === formData.priority);
    const selectedFamily = families.find((f) => f.id === formData.family_id);

    const updateField = useCallback(
        <K extends keyof AdminGoalFormState>(key: K, value: AdminGoalFormState[K]) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    return (
        <Modal open={open} onClose={handleClose} className="max-w-2xl">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Add New Goal
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
                                        aud: "authenticated",
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

                {/* Step 2: Goal Details */}
                {currentStep === 2 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <PenSquare size={14} />
                                </div>
                                Goal Details
                            </h2>
                        </div>
                        <div className="space-y-5">
                            {/* Goal Name */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Goal Name <span className="text-gray-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.goal_name}
                                    onChange={(e) => updateField("goal_name", e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    placeholder="e.g., Emergency Fund, Dream Vacation..."
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Category <span className="text-gray-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {GOAL_CATEGORIES.map((cat) => {
                                        const selected = formData.category === cat.value;
                                        return (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => updateField("category", cat.value)}
                                                className={`relative p-3 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${selected
                                                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-lg">{cat.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-[12px] font-bold text-gray-900">{cat.label}</h3>
                                                        <p className="text-[10px] text-gray-400 truncate">{cat.desc}</p>
                                                    </div>
                                                    <div
                                                        className={`w-[16px] h-[16px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                            }`}
                                                    >
                                                        <Check size={8} />
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Target Amount + Current Amount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Target Amount <span className="text-gray-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₱</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.target_amount}
                                            onChange={(e) => updateField("target_amount", e.target.value)}
                                            className="w-full pl-7 pr-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Initial Amount <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₱</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.current_amount}
                                            onChange={(e) => updateField("current_amount", e.target.value)}
                                            className="w-full pl-7 pr-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Priority
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {GOAL_PRIORITIES.map((prio) => {
                                        const selected = formData.priority === prio.value;
                                        return (
                                            <button
                                                key={prio.value}
                                                type="button"
                                                onClick={() => updateField("priority", prio.value)}
                                                className={`px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all ${selected
                                                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981] bg-white"
                                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                                    }`}
                                            >
                                                {prio.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Target Date */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Target Date <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                                </label>
                                <DateSelector
                                    value={formData.target_date}
                                    onChange={(value) => updateField("target_date", value)}
                                    placeholder="Select target date"
                                    className="w-full"
                                />
                            </div>

                            {/* Auto Contribute */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Monthly Auto-Contribute <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₱</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.auto_contribute_amount}
                                        onChange={(e) => updateField("auto_contribute_amount", e.target.value)}
                                        className="w-full pl-7 pr-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Toggles row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Family Goal */}
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_family_goal}
                                        onChange={(e) => updateField("is_family_goal", e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20"
                                    />
                                    <div>
                                        <span className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5">
                                            <Users size={12} className="text-gray-400" /> Family Goal
                                        </span>
                                    </div>
                                </label>

                                {/* Public */}
                                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_public}
                                        onChange={(e) => updateField("is_public", e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/20"
                                    />
                                    <div>
                                        <span className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5">
                                            <Eye size={12} className="text-gray-400" /> Public Goal
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Family Selector (conditional) */}
                            {formData.is_family_goal && families.length > 0 && (
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Select Family
                                    </label>
                                    <SearchableDropdown
                                        value={formData.family_id}
                                        onChange={(value) => updateField("family_id", value)}
                                        options={families.map((f) => ({
                                            value: f.id,
                                            label: f.family_name,
                                            icon: Users,
                                        }))}
                                        placeholder="Select family..."
                                        className="w-full"
                                        allowEmpty={false}
                                    />
                                </div>
                            )}

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
                                    placeholder="Describe this goal..."
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Notes <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => updateField("notes", e.target.value)}
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    placeholder="Any additional notes..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <ClipboardCheck size={14} />
                                </div>
                                Review Goal
                            </h2>
                            <p className="text-[11px] text-gray-500 mt-0.5 ml-[42px]">Review the details before submitting.</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="p-5 space-y-0 divide-y divide-gray-100">
                                <ReviewRow label="User" value={selectedUser?.full_name || selectedUser?.email || "—"} />
                                <ReviewRow label="Goal Name" value={formData.goal_name} />
                                <ReviewRow label="Category" value={`${selectedCategory?.emoji ?? "🎯"} ${selectedCategory?.label ?? formData.category}`} />
                                <ReviewRow label="Target Amount" value={`₱${parseFloat(formData.target_amount || "0").toLocaleString()}`} />
                                {formData.current_amount && (
                                    <ReviewRow label="Initial Amount" value={`₱${parseFloat(formData.current_amount).toLocaleString()}`} />
                                )}
                                <ReviewRow label="Priority" value={selectedPrio?.label ?? formData.priority} />
                                <ReviewRow label="Target Date" value={formData.target_date ? new Date(formData.target_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "None"} />
                                {formData.auto_contribute_amount && (
                                    <ReviewRow label="Auto-Contribute" value={`₱${parseFloat(formData.auto_contribute_amount).toLocaleString()} / month`} />
                                )}
                                <ReviewRow label="Family Goal" value={formData.is_family_goal ? "Yes" : "No"} />
                                {formData.is_family_goal && selectedFamily && (
                                    <ReviewRow label="Family" value={selectedFamily.family_name} />
                                )}
                                <ReviewRow label="Public" value={formData.is_public ? "Yes" : "No"} />
                                {formData.description && <ReviewRow label="Description" value={formData.description} italic />}
                                {formData.notes && <ReviewRow label="Notes" value={formData.notes} italic />}
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="px-6 py-4">
                {currentStep > 1 && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleBack} disabled={loading}>
                        <ArrowLeft size={14} /> Back
                    </Button>
                )}
                {currentStep < STEPS.length ? (
                    <Button
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={handleNext}
                    >
                        Next <ArrowRight size={14} />
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                <Check size={14} /> Create Goal
                            </>
                        )}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}

function ReviewRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2.5 gap-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold flex-shrink-0">
                {label}
            </span>
            <span className={`text-[13px] font-semibold text-slate-700 text-right truncate ${italic ? "italic" : ""}`}>
                {value}
            </span>
        </div>
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
