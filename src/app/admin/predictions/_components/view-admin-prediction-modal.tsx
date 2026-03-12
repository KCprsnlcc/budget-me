"use client";

import { useState, useCallback } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Brain,
    Tag,
    FileText,
    Clock,
    TrendingUp,
    Shield,
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    Wand2 as Wand2Icon,
    Database,
    Activity,
    ArrowUp,
    ArrowDown,
    TrendingDown,
    Lightbulb,
    Star,
    PieChart,
    Wallet,
    Wand2,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminPredictionReport, AdminAIInsight } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Data & Analysis"];

interface ViewAdminPredictionModalProps {
    open: boolean;
    onClose: () => void;
    report: AdminPredictionReport | null;
    insight: AdminAIInsight | null;
    dataSource: "reports" | "insights";
}

export function ViewAdminPredictionModal({
    open,
    onClose,
    report,
    insight,
    dataSource,
}: ViewAdminPredictionModalProps) {
    const [step, setStep] = useState(1);

    const reset = useCallback(() => {
        setStep(1);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    const createMockUser = (userId: string, email?: string, name?: string, avatar?: string): SupabaseUser => {
        return {
            id: userId,
            email: email || "",
            user_metadata: {
                full_name: name,
                avatar_url: avatar,
            },
            app_metadata: {},
            aud: "authenticated",
            created_at: "",
        } as SupabaseUser;
    };

    if (dataSource === "reports" && !report) return null;
    if (dataSource === "insights" && !insight) return null;

    const item = dataSource === "reports" ? report! : insight!;
    const userId = item.user_id;
    const userEmail = item.user_email;
    const userName = item.user_name;
    const userAvatar = item.user_avatar;
    const createdAt = dataSource === "reports" ? report!.created_at : insight!.generated_at;
    const confidenceLevel = dataSource === "reports"
        ? report!.confidence_level
        : insight!.confidence_level ? insight!.confidence_level * 100 : null;

    return (
        <Modal open={open} onClose={handleClose} className="max-w-[520px]">
            {}
            <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {dataSource === "reports" ? "Prediction Report" : "AI Insight"} Details
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Step {step} of 2
                    </span>
                </div>
            </ModalHeader>

            {}
            <Stepper steps={STEPS} currentStep={step} />

            {}
            <ModalBody className="px-5 py-5">
                {}
                {step === 1 && (
                    <div className="space-y-6 animate-txn-in">
                        {}
                        <div className="text-center p-6 border border-slate-200 rounded-xl">
                            <div className="flex justify-center mb-3">
                                <UserAvatar
                                    user={createMockUser(userId, userEmail, userName, userAvatar)}
                                    size="xl"
                                    className="ring-2 ring-white shadow-sm"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{userName || "No Name"}</h3>
                            <p className="text-sm text-slate-500 mb-3">{userEmail || "Unknown User"}</p>

                            {dataSource === "reports" ? (
                                <>
                                    {report!.accuracy_score !== null && (
                                        <div className="text-[32px] font-bold my-2 text-emerald-500">
                                            {Number(report!.accuracy_score).toFixed(0)}%
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center">
                                        <span className="text-xs font-medium text-slate-600">
                                            Accuracy Score
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {confidenceLevel !== null && (
                                        <div className="text-[32px] font-bold my-2 text-emerald-500">
                                            {confidenceLevel.toFixed(0)}%
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center">
                                        <span className="text-xs font-medium text-slate-600">
                                            Confidence Level
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {}
                        <div>
                            <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">
                                {dataSource === "reports" ? "Report" : "Insight"} Information
                            </h4>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <DetailRow
                                        label="Generated"
                                        value={format(new Date(createdAt), "MMM dd, yyyy 'at' h:mm a")}
                                        icon={Calendar}
                                    />
                                    {dataSource === "reports" ? (
                                        <>
                                            <DetailRow
                                                label="Report Type"
                                                value={report!.report_type}
                                                icon={Tag}
                                            />
                                            <DetailRow
                                                label="Timeframe"
                                                value={report!.timeframe}
                                                icon={Clock}
                                            />
                                            <DetailRow
                                                label="Data Points"
                                                value={report!.data_points.toString()}
                                                icon={Database}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <DetailRow
                                                label="AI Service"
                                                value={insight!.ai_service || "—"}
                                                icon={Wand2Icon}
                                            />
                                            <DetailRow
                                                label="Status"
                                                value={(insight!.processing_status || "Unknown").charAt(0).toUpperCase() + (insight!.processing_status || "Unknown").slice(1)}
                                                icon={Activity}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {}
                        {dataSource === "insights" && insight!.validation_notes && (
                            <div>
                                <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Admin Notes</h4>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-5">
                                        <DetailRow
                                            label="Notes"
                                            value={insight!.validation_notes}
                                            icon={FileText}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {}
                {step === 2 && (
                    <div className="space-y-4 animate-txn-in">
                        {dataSource === "reports" && report && report.prediction_data ? (
                            <>
                                {}
                                {report.report_type === "predictions" && report.prediction_data.fullForecastData ? (
                                    <div className="space-y-4">
                                        {}
                                        {(() => {
                                            const summary = {
                                                monthlyIncome: report.prediction_data.projectedIncome || 0,
                                                monthlyExpenses: report.prediction_data.projectedExpenses || 0,
                                                netBalance: report.prediction_data.projectedSavings || 0,
                                                incomeChange: report.prediction_data.incomeGrowth,
                                                expenseChange: report.prediction_data.expenseGrowth,
                                            };
                                            
                                            return (
                                                <>
                                                    {}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="border border-slate-200 rounded-xl p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="text-slate-500"><TrendingUp size={20} strokeWidth={1.5} /></div>
                                                                {summary.incomeChange !== null && summary.incomeChange !== undefined && (
                                                                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                                                                        {summary.incomeChange >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                                                        {summary.incomeChange >= 0 ? "+" : ""}{summary.incomeChange.toFixed(1)}%
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wide">Projected Income Growth</div>
                                                            <div className="text-lg font-semibold text-slate-900 tracking-tight">₱{summary.monthlyIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-[10px] text-slate-500 mt-1">Next month projection</div>
                                                        </div>
                                                        <div className="border border-slate-200 rounded-xl p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="text-slate-500"><TrendingDown size={20} strokeWidth={1.5} /></div>
                                                                {summary.expenseChange !== null && summary.expenseChange !== undefined && (
                                                                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                                                                        {summary.expenseChange <= 0 ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
                                                                        {summary.expenseChange <= 0 ? "" : "+"}{summary.expenseChange.toFixed(1)}%
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wide">Projected Expense Growth</div>
                                                            <div className="text-lg font-semibold text-slate-900 tracking-tight">₱{summary.monthlyExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-[10px] text-slate-500 mt-1">Next month projection</div>
                                                        </div>
                                                        <div className="border border-slate-200 rounded-xl p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="text-slate-500"><Wallet size={20} strokeWidth={1.5} /></div>
                                                                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                                                                    <BarChart3 size={10} />
                                                                    {summary.monthlyIncome > 0 ? ((summary.netBalance / summary.monthlyIncome) * 100).toFixed(1) : "0.0"}%
                                                                </div>
                                                            </div>
                                                            <div className="text-slate-500 text-[10px] font-medium mb-1 uppercase tracking-wide">Projected Savings Growth</div>
                                                            <div className="text-lg font-semibold text-slate-900 tracking-tight">₱{summary.netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-[10px] text-slate-500 mt-1">Next month projection</div>
                                                        </div>
                                                    </div>

                                                    {}
                                                    <div className="border border-slate-200 rounded-xl p-5">
                                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <BarChart3 size={14} className="text-emerald-500" />Income vs Expenses Forecast
                                                        </h3>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 mb-1">Monthly Income</p>
                                                                <p className="text-sm font-bold text-emerald-600">₱{summary.monthlyIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 mb-1">Monthly Expenses</p>
                                                                <p className="text-sm font-bold text-red-600">₱{summary.monthlyExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-500 mb-1">Net Balance</p>
                                                                <p className={`text-sm font-bold ${summary.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₱{summary.netBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}

                                        {}
                                        {report.prediction_data.fullCategoryPredictions && report.prediction_data.fullCategoryPredictions.length > 0 && (
                                            <div className="border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <PieChart size={14} className="text-emerald-500" />Category Spending Forecast ({report.prediction_data.fullCategoryPredictions.length})
                                                </h3>
                                                <div className="space-y-2">
                                                    {report.prediction_data.fullCategoryPredictions.slice(0, 5).map((cat: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full text-emerald-600 flex items-center justify-center">
                                                                    <span className="text-[10px] font-bold">{idx + 1}</span>
                                                                </div>
                                                                <span className="text-xs font-semibold text-slate-900">{cat.category}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-slate-600">₱{cat.predicted.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cat.trend === 'up' ? 'text-emerald-700' : cat.trend === 'down' ? 'text-emerald-700' : 'text-emerald-700'}`}>
                                                                    {cat.trend === 'up' ? '↑' : cat.trend === 'down' ? '↓' : '→'} {Math.abs(cat.changePercent)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {}
                                        {report.prediction_data.fullExpenseTypes && (
                                            <div className="border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Wallet size={14} className="text-emerald-500" />Expense Type Forecast
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-900">Recurring Expenses</p>
                                                            <p className="text-[10px] text-slate-600 mt-0.5">{report.prediction_data.fullExpenseTypes.recurring.percentage}% of total</p>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-900">₱{report.prediction_data.fullExpenseTypes.recurring.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-900">Variable Expenses</p>
                                                            <p className="text-[10px] text-slate-600 mt-0.5">{report.prediction_data.fullExpenseTypes.variable.percentage}% of total</p>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-900">₱{report.prediction_data.fullExpenseTypes.variable.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {}
                                        {report.prediction_data.fullBehaviorInsights && report.prediction_data.fullBehaviorInsights.length > 0 && (
                                            <div className="border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Activity size={14} className="text-emerald-500" />Transaction Behavior Insight
                                                </h3>
                                                <div className="space-y-2">
                                                    {report.prediction_data.fullBehaviorInsights.slice(0, 4).map((behavior: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg">
                                                            <span className="text-xs font-semibold text-slate-900">{behavior.name || behavior.type}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-slate-600">Avg: ₱{behavior.currentAvg.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${behavior.trend === 'up' ? 'text-emerald-700' : behavior.trend === 'down' ? 'text-emerald-700' : 'text-emerald-700'}`}>
                                                                    {behavior.trend === 'up' ? '↑' : behavior.trend === 'down' ? '↓' : '→'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : report.report_type === "financial_intelligence" && report.prediction_data.fullAIInsights ? (
                                    <div className="space-y-4">
                                        {}
                                        <div className="border border-slate-200 rounded-xl p-5">
                                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                <Wand2 size={14} className="text-emerald-500" />Financial Summary
                                            </h3>
                                            <p className="text-xs text-slate-600 leading-relaxed">{report.prediction_data.fullAIInsights.financialSummary}</p>
                                        </div>

                                        {}
                                        <div className="border border-slate-200 rounded-xl p-5">
                                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-emerald-500" />Risk Assessment
                                            </h3>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-xs font-semibold text-emerald-700">
                                                    {report.prediction_data.fullAIInsights.riskLevel.toUpperCase()} RISK
                                                </span>
                                                <span className="text-xs text-slate-500">Score: {report.prediction_data.fullAIInsights.riskScore}/100</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">{report.prediction_data.fullAIInsights.riskAnalysis}</p>
                                        </div>

                                        {}
                                        <div className="border border-slate-200 rounded-xl p-5">
                                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                <TrendingUp size={14} className="text-emerald-500" />Growth Potential
                                            </h3>
                                            <div className="text-lg font-bold text-emerald-600 mb-2">{report.prediction_data.fullAIInsights.growthPotential}</div>
                                            <p className="text-xs text-slate-600 leading-relaxed">{report.prediction_data.fullAIInsights.growthAnalysis}</p>
                                        </div>

                                        {}
                                        {report.prediction_data.fullAIInsights.recommendations.length > 0 && (
                                            <div className="border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Lightbulb size={14} className="text-emerald-500" />Recommendations ({report.prediction_data.fullAIInsights.recommendations.length})
                                                </h3>
                                                <div className="space-y-3">
                                                    {report.prediction_data.fullAIInsights.recommendations.map((rec: any, idx: number) => (
                                                        <div key={idx} className="flex gap-3 p-3 border border-slate-100 rounded-lg">
                                                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
                                                                <span className="text-[10px] font-bold">{idx + 1}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-semibold text-slate-900 mb-1">{rec.title}</h4>
                                                                <p className="text-[10px] text-slate-600 leading-relaxed">{rec.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {}
                                        {report.prediction_data.fullAIInsights.riskMitigationStrategies.length > 0 && (
                                            <div className="border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Shield size={14} className="text-emerald-500" />Risk Mitigation Strategies ({report.prediction_data.fullAIInsights.riskMitigationStrategies.length})
                                                </h3>
                                                <div className="space-y-2">
                                                    {report.prediction_data.fullAIInsights.riskMitigationStrategies.map((strategy: any, idx: number) => (
                                                        <div key={idx} className="flex items-start gap-2 text-xs">
                                                            <span className="text-emerald-500 mt-0.5">•</span>
                                                            <div>
                                                                <span className="font-semibold text-slate-900">{strategy.strategy}:</span>
                                                                <span className="text-slate-600"> {strategy.description}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {}
                                        {report.prediction_data.fullAIInsights.longTermOpportunities.length > 0 && (
                                            <div className="border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Star size={14} className="text-emerald-500" />Long-term Opportunities ({report.prediction_data.fullAIInsights.longTermOpportunities.length})
                                                </h3>
                                                <div className="space-y-3">
                                                    {report.prediction_data.fullAIInsights.longTermOpportunities.map((opp: any, idx: number) => (
                                                        <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                                                            <h4 className="text-xs font-semibold text-slate-900 mb-1">{opp.opportunity}</h4>
                                                            <p className="text-[10px] text-slate-600 mb-2">{opp.description}</p>
                                                            <div className="flex gap-3 text-[10px]">
                                                                <span className="text-slate-500">⏱ {opp.timeframe}</span>
                                                                <span className="text-slate-500">💰 {opp.potentialReturn}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-slate-500">No prediction data available</p>
                                    </div>
                                )}
                            </>
                        ) : dataSource === "insights" && insight ? (
                            <div className="space-y-4">
                                {}
                                {(() => {

                                    const insightsData = insight.insights || {};
                                    const riskData = insight.risk_assessment || {};
                                    const recommendationsData = insight.recommendations || [];
                                    const opportunityData = insight.opportunity_areas || {};

                                    const financialSummary = insightsData.financial_summary || "";
                                    const growthPotential = insightsData.growth_potential || "";
                                    const growthAnalysis = insightsData.growth_analysis || "";
                                    const riskLevel = riskData.risk_level || "medium";
                                    const riskScore = riskData.risk_score || 0;
                                    const riskAnalysis = riskData.risk_analysis || "";
                                    const riskMitigationStrategies = opportunityData.risk_mitigation_strategies || [];
                                    const longTermOpportunities = opportunityData.long_term_opportunities || [];

                                    const hasCompleteData = financialSummary || growthPotential || recommendationsData.length > 0;

                                    return hasCompleteData ? (
                                        <>
                                            {}
                                            {financialSummary && (
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Wand2 size={14} className="text-emerald-500" />Financial Summary
                                                    </h3>
                                                    <p className="text-xs text-slate-600 leading-relaxed">{financialSummary}</p>
                                                </div>
                                            )}

                                            {}
                                            {(riskLevel || riskScore || riskAnalysis) && (
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <AlertTriangle size={14} className="text-emerald-500" />Risk Assessment
                                                    </h3>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-xs font-semibold text-emerald-700">
                                                            {riskLevel.toUpperCase()} RISK
                                                        </span>
                                                        {riskScore > 0 && (
                                                            <span className="text-xs text-slate-500">Score: {riskScore}/100</span>
                                                        )}
                                                    </div>
                                                    {riskAnalysis && (
                                                        <p className="text-xs text-slate-600 leading-relaxed">{riskAnalysis}</p>
                                                    )}
                                                </div>
                                            )}

                                            {}
                                            {(growthPotential || growthAnalysis) && (
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <TrendingUp size={14} className="text-emerald-500" />Growth Potential
                                                    </h3>
                                                    {growthPotential && (
                                                        <div className="text-lg font-bold text-emerald-600 mb-2">{growthPotential}</div>
                                                    )}
                                                    {growthAnalysis && (
                                                        <p className="text-xs text-slate-600 leading-relaxed">{growthAnalysis}</p>
                                                    )}
                                                </div>
                                            )}

                                            {}
                                            {Array.isArray(recommendationsData) && recommendationsData.length > 0 && (
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Lightbulb size={14} className="text-emerald-500" />Recommendations ({recommendationsData.length})
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {recommendationsData.map((rec: any, idx: number) => (
                                                            <div key={idx} className="flex gap-3 p-3 border border-slate-100 rounded-lg">
                                                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
                                                                    <span className="text-[10px] font-bold">{idx + 1}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-xs font-semibold text-slate-900 mb-1">{rec.title}</h4>
                                                                    <p className="text-[10px] text-slate-600 leading-relaxed">{rec.description}</p>
                                                                    {rec.category && (
                                                                        <span className="inline-block mt-1 text-[9px] text-slate-600 font-medium">
                                                                            {rec.category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {}
                                            {Array.isArray(riskMitigationStrategies) && riskMitigationStrategies.length > 0 && (
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Shield size={14} className="text-emerald-500" />Risk Mitigation Strategies ({riskMitigationStrategies.length})
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {riskMitigationStrategies.map((strategy: any, idx: number) => (
                                                            <div key={idx} className="flex items-start gap-2 p-2 border border-slate-200 rounded-lg">
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-600">
                                                                    <span className="text-[9px] font-bold">{idx + 1}</span>
                                                                </div>
                                                                <div className="flex-1 text-xs">
                                                                    <span className="font-semibold text-slate-900">{strategy.strategy}:</span>
                                                                    <span className="text-slate-600"> {strategy.description}</span>
                                                                    {strategy.impact && (
                                                                        <span className="ml-2 text-[9px] font-semibold text-slate-600">
                                                                            {strategy.impact} impact
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {}
                                            {Array.isArray(longTermOpportunities) && longTermOpportunities.length > 0 && (
                                                <div className="border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Star size={14} className="text-emerald-500" />Long-term Opportunities ({longTermOpportunities.length})
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {longTermOpportunities.map((opp: any, idx: number) => (
                                                            <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                                                                <div className="flex items-start gap-2 mb-2">
                                                                    <div className="w-5 h-5 rounded-full text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <span className="text-[9px] font-bold">{idx + 1}</span>
                                                                    </div>
                                                                    <h4 className="text-xs font-semibold text-slate-900 flex-1">{opp.opportunity}</h4>
                                                                </div>
                                                                <p className="text-[10px] text-slate-600 mb-2 pl-7">{opp.description}</p>
                                                                <div className="flex gap-3 text-[10px] pl-7">
                                                                    {opp.timeframe && (
                                                                        <span className="text-slate-500 flex items-center gap-1">
                                                                            <Clock size={10} /> {opp.timeframe}
                                                                        </span>
                                                                    )}
                                                                    {opp.potentialReturn && (
                                                                        <span className="text-slate-500 flex items-center gap-1">
                                                                            <TrendingUp size={10} /> {opp.potentialReturn}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {}
                                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-amber-500" />No Detailed Insights Available
                                                </h3>
                                                <p className="text-xs text-slate-600 mb-4">This AI insight record doesn't contain detailed analysis data. It may be an older record or the data structure has changed.</p>
                                            </div>

                                            {}
                                            {riskData && Object.keys(riskData).length > 0 && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Shield size={14} className={riskLevel === "high" ? "text-red-500" : riskLevel === "medium" ? "text-amber-500" : "text-emerald-500"} />Risk Assessment
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskLevel === "high" ? "bg-red-100 text-red-700" : riskLevel === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                            {riskLevel.toUpperCase()} RISK
                                                        </span>
                                                        {riskScore > 0 && (
                                                            <span className="text-xs text-slate-500">Score: {riskScore}/100</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {}
                                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Wand2Icon size={14} className="text-violet-500" />AI Service Information
                                                </h3>
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Service:</span>
                                                        <span className="font-semibold text-slate-900">{insight.ai_service || "Unknown"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Model:</span>
                                                        <span className="font-semibold text-slate-900">{insight.model_used || "Unknown"}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Generated:</span>
                                                        <span className="font-semibold text-slate-900">{format(new Date(insight.generated_at), "MMM dd, yyyy 'at' h:mm a")}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Expires:</span>
                                                        <span className="font-semibold text-slate-900">{format(new Date(insight.expires_at), "MMM dd, yyyy 'at' h:mm a")}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Access Count:</span>
                                                        <span className="font-semibold text-slate-900">{insight.access_count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500">No data available</p>
                            </div>
                        )}
                    </div>
                )}
            </ModalBody>

            {}
            <ModalFooter className="flex justify-between">
                {step > 1 ? (
                    <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                        <ArrowLeft size={14} /> Back
                    </Button>
                ) : (
                    <div />
                )}
                <Button
                    size="sm"
                    onClick={() => {
                        if (step === 2) {
                            setStep(1);
                        } else {
                            setStep(2);
                        }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600"
                >
                    {step === 2 ? (
                        <>Back to Overview <ArrowLeft size={14} /></>
                    ) : (
                        <>View Data & Analysis <ArrowRight size={14} /></>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
    return (
        <div className="flex justify-between items-center py-2.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1.5">
                <Icon size={12} className="text-slate-400" />
                {label}
            </span>
            <span className="text-[13px] font-semibold text-slate-700 max-w-[60%] text-right truncate">{value}</span>
        </div>
    );
}
