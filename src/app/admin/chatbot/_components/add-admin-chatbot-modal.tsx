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
    AlertTriangle,
    Search,
    Bot,
    User,
    MessageSquare,
    Cpu,
} from "lucide-react";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Skeleton from "react-loading-skeleton";

interface AddAdminChatbotModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = ["User Select", "Details", "Review"];

const ROLE_OPTIONS = [
    { value: "user", label: "User Message", desc: "A message sent by the user.", icon: User },
    { value: "assistant", label: "Assistant Response", desc: "A response from the AI assistant.", icon: Bot },
];

type FormData = {
    user_id: string;
    role: string;
    content: string;
    model: string;
};

type UserOption = {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
};

function UserCardSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
            <div className="flex items-start gap-4">
                <Skeleton width={40} height={40} borderRadius="50%" />
                <div className="flex-1 min-w-0">
                    <Skeleton width={120} height={14} className="mb-1" />
                    <Skeleton width={180} height={12} />
                </div>
            </div>
        </div>
    );
}

export function AddAdminChatbotModal({ open, onClose, onSuccess }: AddAdminChatbotModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const userListRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<FormData>({
        user_id: "",
        role: "user",
        content: "",
        model: "",
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

    // Debounced search
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
        setFormData({
            user_id: "",
            role: "user",
            content: "",
            model: "",
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
            if (!formData.role || !formData.content.trim()) {
                toast.error("Please fill in all required fields");
                return;
            }
            if (formData.role === "assistant" && !formData.model.trim()) {
                toast.error("Please specify a model for assistant messages");
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
                role: formData.role,
                content: formData.content.trim(),
                model: formData.role === "assistant" ? (formData.model.trim() || null) : null,
                suggestions: [],
                attachment: null,
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase.from("chatbot_messages").insert(payload);

            if (error) throw error;

            toast.success("Message created successfully");
            handleClose();
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create message");
        } finally {
            setLoading(false);
        }
    };

    const selectedUser = users.find(u => u.id === formData.user_id);
    const selectedRole = ROLE_OPTIONS.find(r => r.value === formData.role);

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
                        Add New Message
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
                            <p className="text-[11px] text-gray-500">Choose the user for this chat message.</p>
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

                {/* Step 2: Message Details */}
                {currentStep === 2 && (
                    <div className="animate-txn-in">
                        <div className="mb-5">
                            <h2 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 bg-white">
                                    <PenSquare size={14} />
                                </div>
                                Message Details
                            </h2>
                        </div>
                        <div className="space-y-5">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Message Role <span className="text-gray-400">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {ROLE_OPTIONS.map((role, idx) => {
                                        const Icon = role.icon;
                                        const selected = formData.role === role.value;
                                        return (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => updateField("role", role.value)}
                                                className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${selected
                                                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                                                        : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                                                    }`}
                                                style={{ animationDelay: `${idx * 60}ms` }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${selected
                                                                ? "text-gray-700 border-gray-200"
                                                                : "text-gray-400 border-gray-100"
                                                            }`}
                                                    >
                                                        <Icon size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{role.label}</h3>
                                                        <p className="text-[11px] text-gray-500 leading-relaxed">{role.desc}</p>
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
                                </div>
                            </div>

                            {/* Model (for assistant messages only) */}
                            {formData.role === "assistant" && (
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                        AI Model <span className="text-gray-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Cpu size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.model}
                                            onChange={(e) => updateField("model", e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                            placeholder="e.g., gpt-4o, gpt-oss-20b"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                                    Message Content <span className="text-gray-400">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    value={formData.content}
                                    onChange={(e) => updateField("content", e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                                    placeholder="Enter the message content..."
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
                                Review Message
                            </h2>
                            <p className="text-[11px] text-gray-500 mt-1">Review the details before submitting.</p>
                        </div>

                        <div className="space-y-4">
                            {/* User Info */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <h4 className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-widest">Selected User</h4>
                                <div className="flex items-center gap-3">
                                    {selectedUser && (
                                        <>
                                            <UserAvatar
                                                user={{
                                                    id: selectedUser.id,
                                                    email: selectedUser.email,
                                                    user_metadata: { full_name: selectedUser.full_name, avatar_url: selectedUser.avatar_url },
                                                    app_metadata: {},
                                                    created_at: "",
                                                    aud: "authenticated"
                                                } as SupabaseUser}
                                                size="lg"
                                                className="ring-2 ring-white shadow-sm"
                                            />
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-900">{selectedUser.full_name || "No Name"}</p>
                                                <p className="text-[11px] text-slate-500">{selectedUser.email}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Message Details */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="p-4 space-y-0 divide-y divide-slate-100">
                                    <div className="flex justify-between items-center py-2.5">
                                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Role</span>
                                        <span className={`text-[13px] font-semibold ${formData.role === "assistant" ? "text-emerald-600" : "text-blue-600"}`}>
                                            {selectedRole?.label}
                                        </span>
                                    </div>
                                    {formData.role === "assistant" && formData.model && (
                                        <div className="flex justify-between items-center py-2.5">
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Model</span>
                                            <span className="text-[13px] font-semibold text-slate-700">{formData.model}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content Preview */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <h4 className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-widest">Content</h4>
                                <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {formData.content}
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="p-3 rounded-lg bg-white border border-slate-200">
                                <div className="flex gap-2.5 items-start">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                                    <div>
                                        <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">
                                            Admin Action
                                        </h4>
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            This message will be added to the user's chat history. It will appear as if it was part of the conversation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="px-5 py-3.5">
                {currentStep > 1 ? (
                    <Button variant="secondary" size="sm" onClick={handleBack} disabled={loading}>
                        <ArrowLeft size={14} /> Back
                    </Button>
                ) : (
                    <div />
                )}
                {currentStep < STEPS.length ? (
                    <Button size="sm" onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600">
                        Next <ArrowRight size={14} />
                    </Button>
                ) : (
                    <Button size="sm" onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Creating...</>
                        ) : (
                            <><Check size={14} /> Create Message</>
                        )}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}
