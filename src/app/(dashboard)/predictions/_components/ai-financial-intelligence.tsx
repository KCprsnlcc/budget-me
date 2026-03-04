"use client";

import {
  Wand2,
  TrendingUp,
  Brain,
  Shield,
  Star,
  Clapperboard,
  ShieldCheck,
  ListChecks,
  File,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIInsights {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  riskAnalysis: string;
  growthPotential: string;
  growthAnalysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
  }>;
  riskMitigationStrategies: Array<{
    strategy: string;
    description: string;
    impact: "high" | "medium" | "low";
  }>;
  longTermOpportunities: Array<{
    opportunity: string;
    description: string;
    timeframe: string;
    potentialReturn: string;
  }>;
}

interface ForecastData {
  historical: Array<{ month: string; income: number; expense: number; type: string }>;
  predicted: Array<{ month: string; income: number; expense: number; type: string }>;
  summary: {
    avgGrowth: number;
    maxSavings: number;
    confidence: number;
    trendDirection?: "up" | "down" | "stable";
    trendStrength?: number;
  };
}

interface AIFinancialIntelligenceProps {
  hasGeneratedInsights: boolean;
  hasGeneratedPredictions: boolean;
  isGeneratingInsights: boolean;
  aiInsights: AIInsights | null;
  anomalies: Array<any>;
  savingsOpportunities: Array<any>;
  forecastData: ForecastData | null;
  detailedInsights: boolean;
  rateLimitStatus: { canUseAI: boolean } | null;
  onGenerateAIInsights: () => void;
  onToggleDetailedInsights: () => void;
}

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AIFinancialIntelligence({
  hasGeneratedInsights,
  hasGeneratedPredictions,
  isGeneratingInsights,
  aiInsights,
  anomalies,
  savingsOpportunities,
  forecastData,
  detailedInsights,
  rateLimitStatus,
  onGenerateAIInsights,
  onToggleDetailedInsights,
}: AIFinancialIntelligenceProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && typeof window !== 'undefined') {
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [detailedInsights]);

  if (!hasGeneratedInsights) {
    return (
      <Card className="p-4 sm:p-6 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              AI Financial Intelligence
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Deep analysis of your spending habits and financial future</p>
          </div>
          <Button 
            size="sm" 
            onClick={onGenerateAIInsights} 
            className="text-xs h-8 sm:h-9 px-3 sm:px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            disabled={isGeneratingInsights || !hasGeneratedPredictions || !rateLimitStatus?.canUseAI}
            title={!rateLimitStatus?.canUseAI ? "Daily limit reached" : !hasGeneratedPredictions ? "Generate predictions first" : ""}
          >
            {isGeneratingInsights ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 size={14} className="mr-1.5" />
                <span>Generate AI Insights</span>
              </>
            )}
          </Button>
        </div>

        {/* No Data Grid: Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Financial Summary Card - No Data */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Clapperboard size={20} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Financial Summary</span>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Brain size={32} className="text-slate-300 mb-3" />
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No AI insights available</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Generate to see analysis</p>
              </div>
            </div>
          </div>

          {/* Risk Management Card - No Data */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Risk Level: Unknown</span>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Shield size={32} className="text-slate-300 mb-3" />
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No risk assessment available</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Generate AI insights to see analysis</p>
              </div>
            </div>
          </div>

          {/* Growth Potential Card - No Data */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Star size={20} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Growth Potential</span>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <TrendingUp size={32} className="text-slate-300 mb-3" />
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No growth analysis available</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Generate AI insights to see opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
      <div ref={contentRef} className="flex-1 overflow-y-auto lg:overflow-visible scroll-smooth">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              AI Financial Intelligence
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-light">Deep analysis of your spending habits and financial future</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onToggleDetailedInsights} className="text-xs h-8 sm:h-9 px-3 sm:px-4 w-full sm:w-auto">
              <ArrowRight size={14} className={`mr-1.5 transition-transform ${detailedInsights ? "rotate-180" : ""}`} />
              <span>{detailedInsights ? "View Less" : "View More"}</span>
            </Button>
            <Button 
              size="sm" 
              onClick={onGenerateAIInsights} 
              className="text-xs h-8 sm:h-9 px-3 sm:px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              disabled={isGeneratingInsights || !rateLimitStatus?.canUseAI}
              title={!rateLimitStatus?.canUseAI ? "Daily limit reached" : ""}
            >
              {isGeneratingInsights ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} className="mr-1.5" />
                  <span>Regenerate</span>
                </>
              )}
            </Button>
          </div>
        </div>

      {/* Initial Grid: Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* High-Level Financial Analysis Card */}
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Clapperboard size={20} className="text-slate-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 uppercase tracking-wider">Financial Summary</span>
            </div>
            {aiInsights?.summary ? (
              <>
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                  {aiInsights.summary}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-xs text-slate-600 font-semibold">
                  <Star size={12} />
                  {savingsOpportunities.length > 0 
                    ? `${savingsOpportunities.length} savings opportunities detected`
                    : "Financial patterns analyzed"
                  }
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Brain size={32} className="text-slate-300 mb-3" />
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No AI insights available</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Click "Regenerate" to generate insights</p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Management Card */}
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-slate-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 uppercase tracking-wider">
                Risk Level: {aiInsights?.riskLevel ? aiInsights.riskLevel.charAt(0).toUpperCase() + aiInsights.riskLevel.slice(1) : "Unknown"}
              </span>
            </div>
            {aiInsights?.riskLevel ? (
              <>
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  {aiInsights.riskAnalysis || (anomalies.length > 0 
                    ? `Detected ${anomalies.length} anomaly${anomalies.length > 1 ? "ies" : "y"} in your transactions. Review the flagged items for potential savings.`
                    : "No significant anomalies detected. Your spending patterns are consistent with historical trends."
                  )}
                </p>
                <div className="w-full bg-slate-100 rounded-full h-1 mt-4">
                  <div 
                    className={`h-full rounded-full ${
                      aiInsights.riskScore < 30 ? "bg-emerald-500" : 
                      aiInsights.riskScore < 60 ? "bg-amber-500" : "bg-red-500"
                    }`} 
                    style={{ width: `${Math.min(100, aiInsights.riskScore)}%` }} 
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Shield size={32} className="text-slate-300 mb-3" />
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No risk assessment available</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Generate AI insights to see risk analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Smart Opportunities Card */}
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-slate-500" strokeWidth={1.5} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 uppercase tracking-wider">Growth Potential</span>
            </div>
            {aiInsights?.growthPotential ? (
              <>
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium mb-3">
                  {aiInsights.growthAnalysis || `Potential savings of ${aiInsights.growthPotential} identified through spending optimization and category analysis.`}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-xs text-slate-600 font-semibold">
                  <TrendingUp size={12} />
                  {savingsOpportunities.length > 0 
                    ? `${savingsOpportunities.length} optimization ${savingsOpportunities.length === 1 ? 'opportunity' : 'opportunities'} available`
                    : forecastData?.summary.trendDirection === "up" 
                    ? "Positive growth trajectory detected"
                    : "Stable financial outlook"
                  }
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <TrendingUp size={32} className="text-slate-300 mb-3" />
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No growth analysis available</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Generate AI insights to see opportunities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Expansion (Hidden by default) */}
      {detailedInsights && (
        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 pb-4 sm:pb-8 border-t border-slate-100 animate-fade-in">
          {aiInsights?.recommendations && aiInsights.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Actionable Recommendations */}
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest flex items-center gap-2">
                  <ListChecks size={14} className="text-emerald-500 sm:w-4 sm:h-4" />
                  Smart Recommendations
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {aiInsights.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-all group">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-1 leading-snug">{rec.title}</p>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light">{rec.description}</p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                          <span className={`text-[9px] px-1.5 sm:px-2 py-0.5 font-semibold ${
                            rec.priority === "high" ? "text-red-600" :
                            rec.priority === "medium" ? "text-amber-600" :
                            "text-blue-600"
                          }`}>
                            {rec.priority} priority
                          </span>
                          <span className="text-[9px] text-slate-400 truncate">{rec.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Risk Assessment */}
              <div className="space-y-3 sm:space-y-4 lg:col-span-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest flex items-center gap-2 px-3 sm:px-0">
                  <ShieldCheck size={14} className="text-amber-500 sm:w-4 sm:h-4" />
                  Risk Mitigation Strategies
                </h4>
                {aiInsights?.riskMitigationStrategies && aiInsights.riskMitigationStrategies.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-3 sm:p-4 lg:p-5">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                          <span className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest w-fit ${
                            aiInsights.riskLevel === "low" ? "text-emerald-600" :
                            aiInsights.riskLevel === "medium" ? "text-amber-600" :
                            "text-red-600"
                          }`}>
                            {aiInsights.riskLevel} Risk Environment
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                            SCORE: {aiInsights.riskScore}/100
                          </span>
                        </div>
                        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                          {aiInsights.riskMitigationStrategies.slice(0, 2).map((strategy, idx) => (
                            <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 bg-white">
                              <div className={`mt-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                                strategy.impact === "high" ? "bg-red-500" : 
                                strategy.impact === "medium" ? "bg-amber-500" : "bg-emerald-500"
                              }`}></div>
                              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                                <span className="text-slate-900 font-bold">{strategy.strategy}:</span> {strategy.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                        <ShieldCheck size={28} className="text-slate-300 mb-3 sm:w-8 sm:h-8" />
                        <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">No risk strategies available</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 px-4">Generate AI insights to see mitigation strategies</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <Lightbulb size={40} className="text-slate-300 mb-3 sm:w-12 sm:h-12 sm:mb-4" />
              <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">No Detailed Insights Available</h4>
              <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-md">
                Click the "Regenerate" button above to generate comprehensive AI insights including recommendations and risk strategies.
              </p>
            </div>
          )}

          {/* Long-term Opportunity Map */}
          {aiInsights?.longTermOpportunities && aiInsights.longTermOpportunities.length > 0 ? (
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <File size={18} className="text-slate-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-[13px] font-semibold text-slate-900">Long-term Opportunity Map</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500">AI-identified wealth building opportunities</p>
                    </div>
                  </div>
                  <span className="px-2.5 sm:px-3 py-1 border border-slate-200 rounded-full text-[10px] sm:text-xs font-medium text-slate-600 w-fit">
                    {aiInsights.longTermOpportunities.length} {aiInsights.longTermOpportunities.length === 1 ? 'Opportunity' : 'Opportunities'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {aiInsights.longTermOpportunities.map((opp, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl bg-white p-3 sm:p-4 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                        <h5 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight flex-1">{opp.opportunity}</h5>
                        <span className="text-[9px] px-1.5 sm:px-2 py-0.5 whitespace-nowrap flex-shrink-0 text-emerald-600 font-semibold">
                          {opp.potentialReturn}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-2 sm:mb-3">{opp.description}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
                        <span className="text-[9px] text-slate-400 uppercase">Timeframe:</span>
                        <span className="text-[10px] sm:text-xs text-slate-600 font-medium">{opp.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : forecastData && forecastData.predicted.length > 0 ? (
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <File size={18} className="text-slate-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-[13px] font-semibold text-slate-900">Long-term Opportunity Map</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500">Predicted wealth accumulation markers</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 sm:px-3 py-1 border border-slate-200 rounded-full text-[10px] sm:text-xs font-medium text-slate-600">
                      {forecastData.summary.trendDirection === "up" ? "Growth Trend" : "Stable Trend"}
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 border border-slate-200 rounded-full text-[10px] sm:text-xs font-medium text-slate-600">
                      {forecastData.summary.confidence}% Confidence
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  <div className="border border-slate-200 rounded-xl bg-white p-2.5 sm:p-3">
                    <span className="text-[9px] text-slate-400 uppercase block mb-1">6-Month Goal</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 break-all">
                      {formatCurrency(forecastData.summary.maxSavings * 6)}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl bg-white p-2.5 sm:p-3">
                    <span className="text-[9px] text-slate-400 uppercase block mb-1">1-Year Projection</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 break-all">
                      {formatCurrency(forecastData.summary.maxSavings * 12)}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl bg-white p-2.5 sm:p-3">
                    <span className="text-[9px] text-slate-400 uppercase block mb-1">Avg Growth</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {forecastData.summary.avgGrowth > 0 ? "+" : ""}{forecastData.summary.avgGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl bg-white p-2.5 sm:p-3">
                    <span className="text-[9px] text-slate-400 uppercase block mb-1">Trend Strength</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {((forecastData.summary.trendStrength || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </Card>
  );
}
