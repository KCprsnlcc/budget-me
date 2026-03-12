"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { PredictionHistory } from "../_lib/types";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history?: PredictionHistory[];
}

export function HistoryModal({ open, onClose, history = [] }: HistoryModalProps) {
  const [selectedItem, setSelectedItem] = useState<PredictionHistory | null>(null);
  const [view, setView] = useState<"list" | "details">("list");

  const reset = useCallback(() => {
    setSelectedItem(null);
    setView("list");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleItemClick = useCallback((item: PredictionHistory) => {
    setSelectedItem(item);
    setView("details");
  }, []);

  const handleBack = useCallback(() => {
    setView("list");
    setSelectedItem(null);
  }, []);

  const getStatusIcon = (status: PredictionHistory["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "failed":
        return <XCircle size={16} className="text-red-500" />;
      case "processing":
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusBadge = (status: PredictionHistory["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" className="text-xs">Completed</Badge>;
      case "failed":
        return <Badge variant="danger" className="text-xs">Failed</Badge>;
      case "processing":
        return <Badge variant="warning" className="text-xs">Processing</Badge>;
    }
  };

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl">
      {}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Prediction History
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            {history.length} total predictions
          </span>
        </div>
      </ModalHeader>

      {}
      <ModalBody className="p-0 bg-[#F9FAFB]/30">
        {view === "list" ? (
          <div className="animate-txn-in">
            {}
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">Recent Predictions</h3>
            </div>
            
            {}
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="px-5 py-4 hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Prediction
                              </span>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(item.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.accuracy && (
                            <div className="text-sm font-medium text-gray-900">
                              {item.accuracy.toFixed(1)}% accuracy
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {item.insights} insights
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center text-gray-500 bg-white">
                    No prediction history yet. Generate your first prediction to see it here.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-txn-in">
            {selectedItem && (
              <div className="px-5 py-6 bg-white">
                {}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(selectedItem.status)}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)} Prediction
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedItem.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(selectedItem.status)}
                </div>

                {}
                {(selectedItem.projectedIncome || selectedItem.projectedExpenses || selectedItem.projectedSavings) && (
                  <div className="mb-6">
                    <h4 className="text-[15px] font-bold text-gray-900 mb-3">Projected Metrics</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedItem.projectedIncome !== undefined && (
                        <div className="border border-gray-100 rounded-lg p-4 bg-white">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Income
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ₱{selectedItem.projectedIncome.toLocaleString()}
                          </div>
                          {selectedItem.incomeGrowth !== undefined && (
                            <div className={`text-xs flex items-center gap-1 mt-1 ${
                              selectedItem.incomeGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {selectedItem.incomeGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {Math.abs(selectedItem.incomeGrowth).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      )}
                      {selectedItem.projectedExpenses !== undefined && (
                        <div className="border border-gray-100 rounded-lg p-4 bg-white">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Expenses
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ₱{selectedItem.projectedExpenses.toLocaleString()}
                          </div>
                          {selectedItem.expenseGrowth !== undefined && (
                            <div className={`text-xs flex items-center gap-1 mt-1 ${
                              selectedItem.expenseGrowth <= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {selectedItem.expenseGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {Math.abs(selectedItem.expenseGrowth).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      )}
                      {selectedItem.projectedSavings !== undefined && (
                        <div className="border border-gray-100 rounded-lg p-4 bg-white">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Savings
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ₱{selectedItem.projectedSavings.toLocaleString()}
                          </div>
                          {selectedItem.savingsGrowth !== undefined && (
                            <div className={`text-xs flex items-center gap-1 mt-1 ${
                              selectedItem.savingsGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {selectedItem.savingsGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {Math.abs(selectedItem.savingsGrowth).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {}
                {selectedItem.topCategories && selectedItem.topCategories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[15px] font-bold text-gray-900 mb-3">Top Categories</h4>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {selectedItem.topCategories.map((cat, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3">
                            <span className="text-sm text-gray-700">{cat.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                ₱{cat.amount.toLocaleString()}
                              </span>
                              {cat.trend === "up" && <TrendingUp size={14} className="text-red-500" />}
                              {cat.trend === "down" && <TrendingDown size={14} className="text-emerald-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {}
                {(selectedItem.recurringExpenses !== undefined || selectedItem.variableExpenses !== undefined) && (
                  <div className="mb-6">
                    <h4 className="text-[15px] font-bold text-gray-900 mb-3">Expense Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedItem.recurringExpenses !== undefined && (
                        <div className="border border-gray-100 rounded-lg p-4 bg-white">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Recurring
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ₱{selectedItem.recurringExpenses.toLocaleString()}
                          </div>
                        </div>
                      )}
                      {selectedItem.variableExpenses !== undefined && (
                        <div className="border border-gray-100 rounded-lg p-4 bg-white">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                            Variable
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ₱{selectedItem.variableExpenses.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {}
                {selectedItem.transactionPatterns && selectedItem.transactionPatterns.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[15px] font-bold text-gray-900 mb-3">Transaction Patterns</h4>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {selectedItem.transactionPatterns.map((pattern, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3">
                            <span className="text-sm text-gray-700">{pattern.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                ₱{pattern.avgAmount.toLocaleString()}
                              </span>
                              {pattern.trend === "up" && <TrendingUp size={14} className="text-emerald-500" />}
                              {pattern.trend === "down" && <TrendingDown size={14} className="text-red-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {}
                <div className="mb-6">
                  <h4 className="text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Brain size={16} className="text-emerald-500" />
                    Analysis Summary
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-5 space-y-0 divide-y divide-gray-100">
                      {selectedItem.accuracy && (
                        <DetailRow 
                          label="Confidence" 
                          value={`${selectedItem.accuracy.toFixed(1)}%`} 
                        />
                      )}
                      <DetailRow 
                        label="Data Points" 
                        value={selectedItem.dataPoints.toString()} 
                      />
                      {selectedItem.categoriesAnalyzed !== undefined && (
                        <DetailRow 
                          label="Categories" 
                          value={selectedItem.categoriesAnalyzed.toString()} 
                        />
                      )}
                      {selectedItem.anomaliesDetected !== undefined && (
                        <DetailRow 
                          label="Anomalies" 
                          value={selectedItem.anomaliesDetected.toString()} 
                        />
                      )}
                      {selectedItem.savingsOpportunities !== undefined && (
                        <DetailRow 
                          label="Opportunities" 
                          value={selectedItem.savingsOpportunities.toString()} 
                        />
                      )}
                      <DetailRow 
                        label="Insights" 
                        value={selectedItem.insights.toString()} 
                      />
                    </div>
                  </div>
                </div>

                {}
                {selectedItem.status === "failed" && (
                  <div className="flex gap-2.5 p-3 rounded-lg text-xs border border-gray-200 text-gray-700 items-start bg-white">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                    <div>
                      <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error Details</h4>
                      <p className="text-[11px] leading-relaxed">
                        {selectedItem.errorMessage || "Prediction failed due to insufficient data. Please ensure you have at least 30 days of transaction history."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalBody>

      {}
      <ModalFooter className="flex justify-between">
        {view === "details" ? (
          <Button variant="secondary" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} /> Back to List
          </Button>
        ) : (
          <div />
        )}
        <Button size="sm" onClick={handleClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
      <span className="text-sm font-semibold text-gray-700">{value}</span>
    </div>
  );
}
