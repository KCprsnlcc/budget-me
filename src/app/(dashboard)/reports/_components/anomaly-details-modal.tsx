"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  PhilippinePeso,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { AnomalyDetails } from "./types";

interface AnomalyDetailsModalProps {
  open: boolean;
  onClose: () => void;
  anomaly: AnomalyDetails | null;
  onDismissAnomaly?: (anomalyId: string) => void;
  onResolveAnomaly?: (anomalyId: string) => void;
}

const STEPS = ["Overview", "Details", "Actions"];

const SEVERITY_COLORS = {
  low: "text-blue-500",
  medium: "text-amber-500", 
  high: "text-red-500",
};

const TYPE_ICONS = {
  "unusual-spending": TrendingUp,
  "duplicate-transaction": AlertTriangle,
  "budget-overspend": TrendingDown,
  "income-anomaly": PhilippinePeso,
};

export function AnomalyDetailsModal({
  open,
  onClose,
  anomaly,
  onDismissAnomaly,
  onResolveAnomaly,
}: AnomalyDetailsModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleNext = useCallback(() => {
    if (step >= 3) {
      handleClose();
      return;
    }
    setStep((s) => s + 1);
  }, [step, handleClose]);

  const handleBack = useCallback(() => {
    if (step <= 1) return;
    setStep((s) => s - 1);
  }, []);

  const handleDismiss = useCallback(() => {
    if (anomaly && onDismissAnomaly) {
      onDismissAnomaly(anomaly.anomaly.id);
      handleClose();
    }
  }, [anomaly, onDismissAnomaly, handleClose]);

  const handleResolve = useCallback(() => {
    if (anomaly && onResolveAnomaly) {
      onResolveAnomaly(anomaly.anomaly.id);
      handleClose();
    }
  }, [anomaly, onResolveAnomaly, handleClose]);

  if (!anomaly) return null;

  const { anomaly: anomalyData, relatedTransactions, historicalData, recommendations } = anomaly;
  const TypeIcon = TYPE_ICONS[anomalyData.type];

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Anomaly Details
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 3
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className={`${SEVERITY_COLORS[anomalyData.severity]}`}>
                  <TypeIcon size={14} />
                </div>
                {anomalyData.title}
              </h2>
              <p className="text-[11px] text-slate-500">{anomalyData.description}</p>
            </div>

            {/* Severity Alert */}
            <div className={`p-4 rounded-xl mb-5 ${
              anomalyData.severity === 'high' ? 'text-red-600' :
              anomalyData.severity === 'medium' ? 'text-amber-600' :
              'text-blue-600'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    {anomalyData.severity === "high" ? "High Severity Alert" :
                     anomalyData.severity === "medium" ? "Medium Severity Alert" : "Low Severity Alert"}
                  </h4>
                  <p className="text-xs opacity-90">{anomalyData.description}</p>
                </div>
              </div>
            </div>

            {/* Anomaly Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Category</div>
                <div className="text-sm font-semibold text-slate-900">{anomalyData.category || "N/A"}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Amount</div>
                <div className="text-sm font-semibold text-slate-900">
                  {anomalyData.amount ? `₱${anomalyData.amount.toFixed(2)}` : "N/A"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Trend</div>
                <div className="text-sm font-semibold text-slate-900">
                  {anomalyData.trend ? `${anomalyData.trend > 0 ? "+" : ""}${anomalyData.trend}%` : "N/A"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Status</div>
                <div className="text-sm font-semibold text-slate-900">
                  <Badge variant={anomalyData.status === "active" ? "warning" : anomalyData.status === "resolved" ? "success" : "neutral"}>
                    {anomalyData.status === "active" ? "Active" : anomalyData.status === "resolved" ? "Resolved" : "Dismissed"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
              <Calendar size={14} />
              <span>Detected: {anomalyData.timestamp}</span>
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                  <Info size={14} />
                </div>
                Transaction Details
              </h2>
            </div>

            {/* Related Transactions */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Related Transactions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {relatedTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-xs font-medium text-slate-900 truncate">{transaction.name}</h5>
                        <Badge variant="neutral" className="text-[9px]">{transaction.category}</Badge>
                      </div>
                      <div className="text-[10px] text-slate-500">{transaction.date}</div>
                    </div>
                    <div className={`text-sm font-medium ${transaction.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {transaction.amount < 0 ? "-" : "+"}₱{Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Data */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Historical Comparison</h3>
              <div className="space-y-2">
                {historicalData.map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${data.isAnomalous ? "bg-amber-500" : "bg-emerald-500"}`} />
                      <div>
                        <div className="text-xs font-medium text-slate-900">{data.period}</div>
                        <div className="text-[10px] text-slate-500">{data.isAnomalous ? "Anomalous" : "Normal"}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-900">₱{data.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Actions */}
        {step === 3 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                  <CheckCircle size={14} />
                </div>
                Recommended Actions
              </h2>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-3 mb-5">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl">
                    <ArrowRight size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-700 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {anomalyData.status === "active" && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={handleDismiss} className="w-full">
                  <XCircle size={14} className="mr-1.5" />
                  Dismiss
                </Button>
                <Button size="sm" onClick={handleResolve} className="w-full bg-emerald-500 hover:bg-emerald-600">
                  <CheckCircle size={14} className="mr-1.5" />
                  Resolve
                </Button>
              </div>
            )}
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
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 3 ? "Close" : "Next"}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </ModalFooter>
    </Modal>
  );
}
