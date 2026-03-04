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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  if (!hasGeneratedInsights) {
    return (
      <Card className="p-6 mb-8 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              AI Financial Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Deep analysis of your spending habits and financial future</p>
          </div>
          <Button 
            size="sm" 
            onClick={onGenerateAIInsights} 
            className="text-xs h-9 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGeneratingInsights || !hasGeneratedPredictions || !rateLimitStatus?.canUseAI}
            title={!rateLimitStatus?.canUseAI ? "Daily limit reached" : !hasGeneratedPredictions ? "Generate predictions first" : ""}
          >
            {isGeneratingInsights ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Generate AI Insights
              </>
            )}
          </Button>
        </div>

        {/* No Data Grid: Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Financial Summary Card - No Data */}
          <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-slate-300">
                <Clapperboard size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Summary</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Brain size={32} className="text-slate-300 mb-3" />
              <p className="text-xs text-slate-500 mb-1">No AI insights available</p>
              <p className="text-[10px] text-slate-400">Generate to see analysis</p>
            </div>
          </Card>

          {/* Risk Management Card - No Data */}
          <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-slate-300">
                <Shield size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Level: Unknown</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Shield size={32} className="text-slate-300 mb-3" />
              <p className="text-xs text-slate-500 mb-1">No risk assessment available</p>
              <p className="text-[10px] text-slate-400">Generate AI insights to see analysis</p>
            </div>
          </Card>

          {/* Growth Potential Card - No Data */}
          <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-slate-300">
                <Star size={20} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Growth Potential</span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <TrendingUp size={32} className="text-slate-300 mb-3" />
              <p className="text-xs text-slate-500 mb-1">No growth analysis available</p>
              <p className="text-[10px] text-slate-400">Generate AI insights to see opportunities</p>
            </div>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8 overflow-hidden hover:shadow-md transition-all group cursor-pointer">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            AI Financial Intelligence
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-light">Deep analysis of your spending habits and financial future</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToggleDetailedInsights} className="text-xs h-9 px-4">
            <ArrowRight size={14} className={`transition-transform ${detailedInsights ? "rotate-180" : ""}`} />
            {detailedInsights ? "View Less" : "View More"}
          </Button>
          <Button 
            size="sm" 
            onClick={onGenerateAIInsights} 
            className="text-xs h-9 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGeneratingInsights || !rateLimitStatus?.canUseAI}
            title={!rateLimitStatus?.canUseAI ? "Daily limit reached" : ""}
          >
            {isGeneratingInsights ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Initial Grid: Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* High-Level Financial Analysis Card */}
        <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-slate-500">
              <Clapperboard size={20} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Financial Summary</span>
          </div>
          {aiInsights?.summary ? (
            <>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                {aiInsights.summary}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
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
              <p className="text-xs text-slate-500 mb-2">No AI insights available</p>
              <p className="text-[10px] text-slate-400">Click "Regenerate" to generate insights</p>
            </div>
          )}
        </Card>

        {/* Risk Management Card */}
        <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-slate-500">
              <Shield size={20} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
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
              <p className="text-xs text-slate-500 mb-2">No risk assessment available</p>
              <p className="text-[10px] text-slate-400">Generate AI insights to see risk analysis</p>
            </div>
          )}
        </Card>

        {/* Smart Opportunities Card */}
        <Card className="p-5 hover:shadow-md transition-all group h-full cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-slate-500">
              <Star size={20} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Growth Potential</span>
          </div>
          {aiInsights?.growthPotential ? (
            <>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium mb-3">
                {aiInsights.growthAnalysis || `Potential savings of ${aiInsights.growthPotential} identified through spending optimization and category analysis.`}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-600 font-semibold">
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
              <p className="text-xs text-slate-500 mb-2">No growth analysis available</p>
              <p className="text-[10px] text-slate-400">Generate AI insights to see opportunities</p>
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Expansion (Hidden by default) */}
      {detailedInsights && (
        <div className="space-y-6 pt-6 border-t border-slate-100 animate-fade-in">
          {aiInsights?.recommendations && aiInsights.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actionable Recommendations */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ListChecks size={16} className="text-emerald-500" />
                  Smart Recommendations
                </h4>
                <div className="space-y-3">
                  {aiInsights.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:shadow-sm transition-all group">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-1">{rec.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-light">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={rec.priority === "high" ? "danger" : rec.priority === "medium" ? "warning" : "neutral"}
                            className="text-[9px] px-2 py-0.5 bg-transparent"
                          >
                            {rec.priority} priority
                          </Badge>
                          <span className="text-[9px] text-slate-400">{rec.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Risk Assessment */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-500" />
                  Risk Mitigation Strategies
                </h4>
                {aiInsights?.riskMitigationStrategies && aiInsights.riskMitigationStrategies.length > 0 ? (
                  <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={
                            aiInsights.riskLevel === "low" ? "success" : 
                            aiInsights.riskLevel === "medium" ? "warning" : "danger"
                          } 
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-transparent"
                        >
                          {aiInsights.riskLevel} Risk Environment
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">
                          SCORE: {aiInsights.riskScore}/100
                        </span>
                      </div>
                      <div className="space-y-4">
                        {aiInsights.riskMitigationStrategies.slice(0, 2).map((strategy, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                            <div className={`mt-1 w-2 h-2 rounded-full ${
                              strategy.impact === "high" ? "bg-red-500" : 
                              strategy.impact === "medium" ? "bg-amber-500" : "bg-emerald-500"
                            }`}></div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              <span className="text-slate-900 font-bold">{strategy.strategy}:</span> {strategy.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-5 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ShieldCheck size={32} className="text-slate-300 mb-3" />
                      <p className="text-xs text-slate-500 mb-2">No risk strategies available</p>
                      <p className="text-[10px] text-slate-400">Generate AI insights to see mitigation strategies</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb size={48} className="text-slate-300 mb-4" />
              <h4 className="text-sm font-semibold text-slate-700 mb-2">No Detailed Insights Available</h4>
              <p className="text-xs text-slate-500 mb-4 max-w-md">
                Click the "Regenerate" button above to generate comprehensive AI insights including recommendations and risk strategies.
              </p>
            </div>
          )}

          {/* Long-term Opportunity Map */}
          {aiInsights?.longTermOpportunities && aiInsights.longTermOpportunities.length > 0 ? (
            <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-slate-500">
                    <File size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">Long-term Opportunity Map</h4>
                    <p className="text-[10px] text-slate-500">AI-identified wealth building opportunities</p>
                  </div>
                </div>
                <Badge variant="neutral" className="px-3 py-1 bg-transparent border border-slate-200 text-[10px] font-medium text-slate-600">
                  {aiInsights.longTermOpportunities.length} {aiInsights.longTermOpportunities.length === 1 ? 'Opportunity' : 'Opportunities'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.longTermOpportunities.map((opp, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h5 className="text-sm font-semibold text-slate-800 leading-tight">{opp.opportunity}</h5>
                      <Badge variant="success" className="text-[9px] px-2 py-0.5 whitespace-nowrap flex-shrink-0 bg-transparent">
                        {opp.potentialReturn}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{opp.description}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase">Timeframe:</span>
                      <span className="text-[10px] text-slate-600 font-medium">{opp.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : forecastData && forecastData.predicted.length > 0 ? (
            <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-slate-500">
                    <File size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">Long-term Opportunity Map</h4>
                    <p className="text-[10px] text-slate-500">Predicted wealth accumulation markers</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="neutral" className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-600">
                    {forecastData.summary.trendDirection === "up" ? "Growth Trend" : "Stable Trend"}
                  </Badge>
                  <Badge variant="neutral" className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-600">
                    {forecastData.summary.confidence}% Confidence
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">6-Month Goal</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(forecastData.summary.maxSavings * 6)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">1-Year Projection</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(forecastData.summary.maxSavings * 12)}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Avg Growth</span>
                  <span className="text-sm font-bold text-slate-800">
                    {forecastData.summary.avgGrowth > 0 ? "+" : ""}{forecastData.summary.avgGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[9px] text-slate-400 uppercase block mb-1">Trend Strength</span>
                  <span className="text-sm font-bold text-slate-800">
                    {((forecastData.summary.trendStrength || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </Card>
  );
}
