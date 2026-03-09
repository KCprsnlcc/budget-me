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
    ClipboardCheck,
    PenSquare,
    Search,
} from "lucide-react";
import { DateSelector } from "@/components/ui/date-selector";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createAdminAnalytics } from "../_lib/admin-analytics-service";

interface AddAdminAnalyticsModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onAdded?: () => void;
}

const STEPS = ["User Select", "Report Details", "Review"];

const REPORT_TYPES = [
    { value: "spending", label: "Spending" },
    { value: "income-expense", label: "Income & Expense" },
    { value: "savings", label: "Savings" },
    { value: "trends", label: "Trends" },
    { value: "goals", label: "Goals" },
    { value: "predictions", label: "Predictions" },
    { value: "financial_intelligence", label: "Financial Intelligence" }
];

const TIMEFRAMES = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
    { value: "all-time", label: "All Time" }
];

type FormData = {
    user_id: string;
    report_type: string;
    timeframe: string;
    generated_at: string;
    data_points: string;
    confidence_level: string;
    accuracy_score: string;
    summary: string;
};

type User = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
};

export function AddAdminAnalyticsModal({ open, onClose, onSuccess, onAdded }: AddAdminAnalyticsModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const userListRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<FormData>({
        user_id: "",
        report_type: "spending",
        timeframe: "monthly",
        generated_at: new Date().toISOString().split("T")[0],
        data_points: "",
        confidence_level: "",
        accuracy_score: "",
        summary: "",
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

        // Apply search filter if present
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

    // Trigger search when query changes - only when modal is open and on step 1
    useEffect(() => {
        if (open && currentStep === 1) {
            const timeoutId = setTimeout(() => {
                loadUsers(true);
            }, 300); // Debounce search
            return () => clearTimeout(timeoutId);
        }
    }, [userSearchQuery, open, currentStep]);

    // Infinite scroll handler
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
        setFormData({
            user_id: "",
            report_type: "spending",
            timeframe: "monthly",
            generated_at: new Date().toISOString().split("T")[0],
            data_points: "",
            confidence_level: "",
            accuracy_score: "",
            summary: "",
        });
        onClose();
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            if (!formData.user_id) {
                toast.error("Please select a user");
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.report_type || !formData.timeframe || !formData.generated_at) {
                toast.error("Please fill in required fields");
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

            const payload: any = {
                user_id: formData.user_id,
                report_type: formData.report_type,
                timeframe: formData.timeframe,
                generated_at: formData.generated_at,
                data_points: formData.data_points ? parseInt(formData.data_points) : undefined,
                confidence_level: formData.confidence_level ? parseFloat(formData.confidence_level) : undefined,
                accuracy_score: formData.accuracy_score ? parseFloat(formData.accuracy_score) : undefined,
                summary: formData.summary || null,
                insights: [],
                ai_service: 'manual_admin'
            };

            const result = await createAdminAnalytics(payload);

            if (result.error) throw new Error(result.error);

            toast.success("Analytics report created successfully");
            handleClose();
            if (onSuccess) onSuccess();
            if (onAdded) onAdded();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create analytics report");
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find(u => u.id === formData.user_id);
    const selectedType = REPORT_TYPES.find(t => t.value === formData.report_type);

    const updateField = useCallback(
        <K extends keyof FormData>(key: K, value: FormData[K]) => {
            setFormData((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    return (
        <Modal open={open} onClose={handleClose} className="max-w-2xl">
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Add New AI Report
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
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Select User</h2>
                            <p className="text-[11px] text-gray-500">Choose the user for this analytics report.</p>
                        </div>

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
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
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
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <PenSquare size={14} />
                                </div>
                                Report Details
                            </h2>
                        </div>
                        <div className="space-y-5">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Report Type <span className="text-gray-400">*</span>
                                    </label>
                                    <select
                                        value={formData.report_type}
                                        onChange={(e) => updateField("report_type", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                    >
                                        {REPORT_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Timeframe <span className="text-gray-400">*</span>
                                    </label>
                                    <select
                                        value={formData.timeframe}
                                        onChange={(e) => updateField("timeframe", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                    >
                                        {TIMEFRAMES.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Data Points
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.data_points}
                                        onChange={(e) => updateField("data_points", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                        placeholder="e.g. 1500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Date <span className="text-gray-400">*</span>
                                    </label>
                                    <DateSelector
                                        value={formData.generated_at}
                                        onChange={(value) => updateField("generated_at", value)}
                                        placeholder="Generation date"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Confidence (0 - 1)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={formData.confidence_level}
                                        onChange={(e) => updateField("confidence_level", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                        placeholder="e.g. 0.95"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        Accuracy Score (0 - 100)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="100"
                                        value={formData.accuracy_score}
                                        onChange={(e) => updateField("accuracy_score", e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                        placeholder="e.g. 98"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Summary
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.summary}
                                    onChange={(e) => updateField("summary", e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500"
                                    placeholder="Provide a brief summary of the report..."
                                />
                            </div>

                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="mb-5 text-center">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-200">
                                <ClipboardCheck size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1.5">Review & Confirm</h2>
                            <p className="text-sm text-gray-500">Please review the details below before creating.</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {selectedUser?.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                                            {(selectedUser?.full_name || selectedUser?.email || "?").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">{selectedUser?.full_name || "Unknown User"}</h3>
                                        <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4 gap-y-5">
                                    <div>
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Report Type</span>
                                        <p className="text-[13px] font-medium text-gray-900 flex items-center gap-1.5">
                                            {selectedType?.label}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Timeframe</span>
                                        <p className="text-[13px] font-medium text-gray-900 capitalize">
                                            {formData.timeframe}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Confidence</span>
                                        <p className="text-[13px] font-medium text-gray-900 capitalize">
                                            {formData.confidence_level ? formData.confidence_level : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Accuracy</span>
                                        <p className="text-[13px] font-medium text-gray-900 capitalize">
                                            {formData.accuracy_score ? `${formData.accuracy_score}%` : "—"}
                                        </p>
                                    </div>
                                </div>

                                {formData.summary && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Summary</span>
                                        <div className="bg-gray-50 rounded-lg p-3 text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                                            {formData.summary}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="px-5 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="flex items-center gap-1.5 text-xs font-semibold px-4 h-9 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        disabled={loading}
                    >
                        <ArrowLeft size={14} strokeWidth={2.5} />
                        Back
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="text-xs font-semibold px-4 h-9 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}

                {currentStep < STEPS.length ? (
                    <Button
                        onClick={handleNext}
                        className="flex items-center gap-1.5 text-xs font-semibold px-5 h-9 bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
                    >
                        Continue
                        <ArrowRight size={14} strokeWidth={2.5} />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs font-semibold px-6 h-9 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                Confirm & Create
                                <Check size={14} strokeWidth={2.5} />
                            </>
                        )}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}
