"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    Bot,
    User,
    Cpu,
    MessageSquare,
    Clock,
    Paperclip,
    Copy,
    Check,
    Share,
    Loader2,
    ChevronDown,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { AdminChatSession, AdminChatMessage } from "../_lib/types";
import { fetchUserChatMessages } from "../_lib/admin-chatbot-service";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

interface ViewAdminChatbotModalProps {
    open: boolean;
    onClose: () => void;
    session: AdminChatSession | null;
}

const assistantMarkdownComponents = {
    table: ({ children }: any) => (
        <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm my-4">
            <div className="overflow-x-auto">
                <table className="w-full text-xs">{children}</table>
            </div>
        </div>
    ),
    thead: ({ children }: any) => (
        <thead className="bg-slate-50/50 border-b border-slate-100">{children}</thead>
    ),
    th: ({ children, align }: any) => (
        <th
            className={`px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider ${align === "right" ? "text-right" : "text-left"
                }`}
        >
            {children}
        </th>
    ),
    tbody: ({ children }: any) => (
        <tbody className="divide-y divide-slate-50">{children}</tbody>
    ),
    tr: ({ children }: any) => (
        <tr className="hover:bg-slate-50 transition-colors">{children}</tr>
    ),
    td: ({ children, align }: any) => (
        <td
            className={`px-5 py-3 ${align === "right" ? "text-right text-slate-900 font-semibold" : "text-slate-500"
                }`}
        >
            {children}
        </td>
    ),
    h1: ({ children }: any) => (
        <h1 className="text-xl font-bold mt-6 mb-4 text-slate-900">{children}</h1>
    ),
    h2: ({ children }: any) => (
        <h2 className="text-lg font-bold mt-5 mb-3 text-slate-900">{children}</h2>
    ),
    h3: ({ children }: any) => (
        <h3 className="text-base font-bold mt-4 mb-2 text-slate-900">{children}</h3>
    ),
    h4: ({ children }: any) => (
        <h4 className="text-sm font-semibold mt-3 mb-2 text-slate-900">{children}</h4>
    ),
    ul: ({ children }: any) => (
        <ul className="space-y-1 mb-4">{children}</ul>
    ),
    ol: ({ children }: any) => (
        <ol className="space-y-1 mb-4 list-decimal list-inside">{children}</ol>
    ),
    li: ({ children }: any) => (
        <li className="flex items-start gap-2 text-slate-700">{children}</li>
    ),
    p: ({ children }: any) => (
        <p className="mb-2 text-slate-700">{children}</p>
    ),
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-slate-300 pl-4 py-2 my-4 text-slate-600">
            {children}
        </blockquote>
    ),
    code: ({ inline, children }: any) => (
        <code
            className={`${inline
                ? "bg-slate-100 px-1 py-0.5 rounded text-slate-800 text-xs"
                : "block bg-slate-900 text-slate-100 p-4 rounded-lg text-sm my-4"
                }`}
        >
            {children}
        </code>
    ),
    strong: ({ children }: any) => (
        <strong className="font-semibold text-slate-900">{children}</strong>
    ),
    a: ({ href, children }: any) => (
        <a href={href} className="text-emerald-500 hover:text-emerald-600 underline">
            {children}
        </a>
    ),
};

function ChatBubble({ message, copiedId, onCopy }: { message: AdminChatMessage; copiedId: string | null; onCopy: (id: string, content: string) => void }) {
    const isAssistant = message.role === "assistant";

    return (
        <div className={`mx-auto max-w-full ${isAssistant ? "flex justify-start" : "flex justify-end"}`}>
            {}
            <div className={`${isAssistant ? "space-y-2 flex-1" : "max-w-[90%] sm:max-w-[85%]"} relative group`}>
                {}
                <div
                    className={`${isAssistant
                        ? "rounded-[2rem] rounded-tl-sm text-slate-800 transition-all"
                        : "bg-emerald-500 text-white rounded-[2rem] rounded-tr-sm px-4 sm:px-6 py-2.5 sm:py-3.5 shadow-sm"
                        }`}
                >
                    {}
                    {message.attachment && (
                        <div className={`mb-1.5 sm:mb-2 p-1.5 sm:p-2 rounded-lg ${isAssistant ? "bg-slate-100" : "bg-emerald-600"}`}>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Paperclip size={14} className={`sm:w-4 sm:h-4 ${isAssistant ? "text-slate-500" : "text-emerald-200"}`} />
                                <span className={`text-xs sm:text-sm truncate ${isAssistant ? "text-slate-700" : "text-white"}`}>
                                    {message.attachment.name}
                                </span>
                                <span className={`text-[10px] sm:text-xs ${isAssistant ? "text-slate-500" : "text-emerald-200"}`}>
                                    ({(message.attachment.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                        </div>
                    )}

                    {}
                    {isAssistant ? (
                        <div className="text-sm leading-relaxed text-slate-700">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={assistantMarkdownComponents}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-sm leading-relaxed text-white whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    )}
                </div>

                {}
                <div className={`flex gap-1.5 sm:gap-2 ${isAssistant ? "opacity-100 justify-start" : "opacity-0 justify-end"} group-hover:opacity-100 transition-all duration-200`}>
                    <button
                        onClick={() => onCopy(message.id, message.content)}
                        className="p-1 sm:p-1.5 hover:opacity-80 transition-opacity"
                        title="Copy message"
                    >
                        {copiedId === message.id ? (
                            <Check size={12} className="sm:w-[14px] sm:h-[14px] text-emerald-500" />
                        ) : (
                            <Copy size={12} className="sm:w-[14px] sm:h-[14px] text-slate-400" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function MessagesSkeleton() {
    return (
        <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
            <div className="space-y-6 sm:space-y-8">
                {}
                <div className="flex justify-end">
                    <div className="max-w-[90%] sm:max-w-[85%]">
                        <Skeleton
                            height={56}
                            borderRadius={32}
                            width={240}
                        />
                    </div>
                </div>

                {}
                <div className="flex justify-start">
                    <div className="flex-1 space-y-2">
                        <Skeleton height={96} borderRadius={32} />
                        <div className="flex gap-2">
                            <Skeleton width={16} height={16} circle />
                        </div>
                    </div>
                </div>

                {}
                <div className="flex justify-end">
                    <div className="max-w-[90%] sm:max-w-[85%]">
                        <Skeleton
                            height={48}
                            borderRadius={32}
                            width={200}
                        />
                    </div>
                </div>

                {}
                <div className="flex justify-start">
                    <div className="flex-1 space-y-2">
                        <Skeleton height={140} borderRadius={32} />
                        <div className="flex gap-2">
                            <Skeleton width={16} height={16} circle />
                        </div>
                    </div>
                </div>
            </div>
        </SkeletonTheme>
    );
}

export function ViewAdminChatbotModal({ open, onClose, session }: ViewAdminChatbotModalProps) {
    const [messages, setMessages] = useState<AdminChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const handleCopy = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    }, []);

    useEffect(() => {
        if (open && session) {
            setLoadingMessages(true);
            setIsInitialLoad(true);
            fetchUserChatMessages(session.user_id, 10).then(({ data, error, hasMore: more }) => {
                if (!error) {
                    setMessages(data);
                    setHasMore(more);
                }
                setLoadingMessages(false);
            });
        } else {
            setMessages([]);
            setHasMore(false);
            setIsInitialLoad(true);
        }
    }, [open, session]);

    useEffect(() => {
        if (messages.length > 0 && isInitialLoad) {
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
                setIsInitialLoad(false);
            }, 100);
        }
    }, [messages.length, isInitialLoad]);

    const handleScroll = useCallback(() => {
        if (!chatContainerRef.current || loadingMessages) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isNearBottom && messages.length > 0);

        if (loadingMore || !hasMore) return;

        if (scrollTop < 100 && !isInitialLoad && messages.length > 0) {
            setLoadingMore(true);

            const oldestMessage = messages[0];
            if (!oldestMessage || !oldestMessage.created_at) {
                setLoadingMore(false);
                return;
            }

            const beforeTimestamp = oldestMessage.created_at;

            fetchUserChatMessages(session!.user_id, 10, beforeTimestamp).then(({ data, error, hasMore: more }) => {
                if (!error) {
                    if (data.length > 0) {

                        const scrollFromBottom = scrollHeight - scrollTop - clientHeight;

                        setMessages(prev => [...data, ...prev]);

                        setTimeout(() => {
                            if (chatContainerRef.current) {
                                const newScrollHeight = chatContainerRef.current.scrollHeight;
                                const newScrollTop = newScrollHeight - scrollFromBottom - clientHeight;
                                chatContainerRef.current.scrollTop = Math.max(newScrollTop, 200);
                            }
                        }, 0);
                    }
                    setHasMore(more);
                }
                setLoadingMore(false);
            });
        }
    }, [messages, loadingMore, hasMore, session, isInitialLoad, loadingMessages]);

    if (!session) return null;

    const mockUser: SupabaseUser = {
        id: session.user_id,
        email: session.user_email,
        user_metadata: {
            full_name: session.user_name,
            avatar_url: session.user_avatar,
        },
        app_metadata: {},
        created_at: "",
        aud: "authenticated",
    } as SupabaseUser;

    const groupedMessages = messages
        .filter(msg => msg.content && msg.content.trim() !== "")
        .reduce<Record<string, AdminChatMessage[]>>((acc, msg) => {
            const dateKey = format(new Date(msg.created_at), "MMM dd, yyyy");
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(msg);
            return acc;
        }, {});

    return (
        <Modal open={open} onClose={onClose} className="max-w-3xl">
            {}
            <ModalHeader onClose={onClose} className="px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <UserAvatar
                        user={mockUser}
                        size="lg"
                        className="ring-2 ring-white shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5 sm:gap-2 truncate">
                            <span className="truncate">{session.user_name || session.user_email}</span>
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                                <MessageSquare size={10} />
                                {session.total_messages} messages
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={10} />
                                Last active {format(new Date(session.last_message_at), "MMM dd, h:mm a")}
                            </span>
                        </div>
                    </div>
                </div>
            </ModalHeader>

            {}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">User:</span>
                    <span className="font-semibold text-slate-700">{session.user_messages}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-slate-500">Assistant:</span>
                    <span className="font-semibold text-slate-700">{session.assistant_messages}</span>
                </div>
                {session.models_used.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Cpu size={10} className="text-slate-400" />
                        <span className="text-slate-500">Models:</span>
                        <span className="font-semibold text-slate-700">{session.models_used.join(", ")}</span>
                    </div>
                )}
            </div>

            {}
            <ModalBody className="p-0 relative">
                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="p-4 sm:p-6 bg-white max-h-[60vh] overflow-y-auto scroll-smooth scrollbar-thin"
                >
                    {loadingMessages ? (
                        <MessagesSkeleton />
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                            <Bot size={48} className="mb-4 text-slate-300" />
                            <p className="text-sm">No messages in this conversation.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 sm:space-y-8">
                            {}
                            {loadingMore && (
                                <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
                                    <div className="space-y-4 sm:space-y-6">
                                        {}
                                        <div className="flex justify-end">
                                            <div className="max-w-[90%] sm:max-w-[85%]">
                                                <Skeleton height={48} borderRadius={32} width={200} />
                                            </div>
                                        </div>
                                        <div className="flex justify-start">
                                            <div className="flex-1">
                                                <Skeleton height={80} borderRadius={32} />
                                            </div>
                                        </div>
                                    </div>
                                </SkeletonTheme>
                            )}

                            {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                                <div key={dateKey}>
                                    {}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex-1 h-px bg-slate-100" />
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2">
                                            {dateKey}
                                        </span>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>

                                    {}
                                    <div className="space-y-6 sm:space-y-8">
                                        {msgs.map((msg) => (
                                            <ChatBubble
                                                key={msg.id}
                                                message={msg}
                                                copiedId={copiedId}
                                                onCopy={handleCopy}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                            <div className="h-4" />
                        </div>
                    )}
                </div>

                {}
                {showScrollToBottom && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-emerald-500 text-white p-2 rounded-full shadow-lg transition-opacity duration-300 ease-in-out"
                    >
                        <ChevronDown size={20} />
                    </button>
                )}
            </ModalBody>

            {}
            <ModalFooter className="flex justify-between px-6 py-4">
                <div className="text-[10px] text-slate-400">
                    Conversation started {format(new Date(session.first_message_at), "MMM dd, yyyy")}
                </div>
                <Button
                    size="sm"
                    onClick={onClose}
                    className="bg-emerald-500 hover:bg-emerald-600"
                >
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
}
