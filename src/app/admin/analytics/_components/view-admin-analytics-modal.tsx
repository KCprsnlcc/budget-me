"use client";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    X,
    Calendar,
    User,
    Activity,
    FileText,
    PieChart,
    BarChart2,
    TrendingUp,
    Target,
    BrainCircuit,
} from "lucide-react";
import type { AdminAnalyticsReport } from "../_lib/types";

interface ViewAdminAnalyticsModalProps {
    open?: boolean; // Keep for compatibility if needed
    isOpen?: boolean; // The new standard
    onClose: () => void;
    report: AdminAnalyticsReport | null;
}

function getReportTypeIcon(type: string): React.ComponentType<any> {
    switch (type) {
        case 'spending': return PieChart;
        case 'income-expense': return BarChart2;
        case 'savings': return Target;
        case 'trends': return TrendingUp;
        case 'goals': return Target;
        case 'financial_intelligence': return BrainCircuit;
        default: return FileText;
    }
}

export function ViewAdminAnalyticsModal({ open, isOpen, onClose, report }: ViewAdminAnalyticsModalProps) {
    const actualOpen = isOpen !== undefined ? isOpen : (open || false);

    if (!report) return null;

    const Icon = getReportTypeIcon(report.report_type);

    return (
        <Modal open={actualOpen} onClose={onClose} className="max-w-2xl">
            <ModalHeader onClose={onClose} className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Icon size={20} />
                    </div>
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight capitalize">
                            {report.report_type.replace(/_/g, " ")} Report
                        </h2>
                        <p className="text-[11px] text-gray-500 font-medium">
                            ID: <span className="font-mono text-gray-400">{report.id.substring(0, 8)}...</span>
                        </p>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="px-6 py-6 bg-[#F9FAFB]/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* User Details */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-emerald-100 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={14} className="text-emerald-500" />
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">User Information</h3>
                        </div>

                        <div className="flex items-center gap-4">
                            {report.user_avatar ? (
                                <img src={report.user_avatar} alt="" className="w-12 h-12 rounded-full border border-gray-200" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold ring-2 ring-white">
                                    {(report.user_name || report.user_email || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-gray-900 truncate">
                                    {report.user_name || "Unknown User"}
                                </span>
                                <span className="text-[11px] text-gray-500 truncate mt-0.5">
                                    {report.user_email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-emerald-100 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={14} className="text-emerald-500" />
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Report Basics</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center group">
                                <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Date</span>
                                <span className="text-[13px] font-bold text-gray-900">
                                    {report.generated_at ? new Date(report.generated_at).toLocaleDateString("en-US", {
                                        month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                                    }) : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Timeframe</span>
                                <span className="text-[13px] font-bold text-gray-900 capitalize">
                                    {report.timeframe}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Metrics */}
                <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-emerald-100 transition-colors">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <Activity size={14} className="text-emerald-500" />
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">AI Metrics</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        <div className="p-4 text-center">
                            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Data Points</span>
                            <span className="text-lg font-bold text-gray-900">{report.data_points?.toLocaleString() || '—'}</span>
                        </div>
                        <div className="p-4 text-center">
                            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Confidence</span>
                            <span className="text-lg font-bold text-gray-900">{report.confidence_level ? `${(report.confidence_level * 100).toFixed(0)}%` : '—'}</span>
                        </div>
                        <div className="p-4 text-center">
                            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Accuracy</span>
                            <span className="text-lg font-bold text-gray-900">{report.accuracy_score ? `${report.accuracy_score}%` : '—'}</span>
                        </div>
                        <div className="p-4 text-center">
                            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Service</span>
                            <span className="text-[13px] font-bold text-gray-600 mt-1 block truncate px-2">{report.ai_service || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-emerald-100 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText size={14} className="text-emerald-500" />
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Summary</h3>
                    </div>
                    {report.summary ? (
                        <div className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/80 p-4 rounded-lg border border-gray-100">
                            {report.summary}
                        </div>
                    ) : (
                        <div className="text-[13px] text-gray-400 italic bg-gray-50/80 p-4 rounded-lg border border-gray-100/50 flex flex-col items-center justify-center text-center">
                            <FileText size={20} className="mb-2 opacity-20" />
                            No summary provided.
                        </div>
                    )}
                </div>

            </ModalBody>

            <ModalFooter className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
                <Button
                    onClick={onClose}
                    className="text-xs font-semibold px-6 h-9 bg-gray-900 hover:bg-gray-800 text-white shadow-sm flex items-center gap-1.5"
                >
                    <X size={14} strokeWidth={2.5} />
                    Close Details
                </Button>
            </ModalFooter>
        </Modal>
    );
}
