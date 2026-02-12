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
  ArrowRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
}

interface PredictionHistory {
  id: string;
  date: string;
  type: "monthly" | "weekly" | "category";
  status: "completed" | "failed" | "processing";
  accuracy?: number;
  insights: number;
  dataPoints: number;
  model: string;
}

const mockHistory: PredictionHistory[] = [
  {
    id: "1",
    date: "2024-02-10",
    type: "monthly",
    status: "completed",
    accuracy: 94.2,
    insights: 8,
    dataPoints: 186,
    model: "Prophet v1.1"
  },
  {
    id: "2",
    date: "2024-02-03",
    type: "weekly",
    status: "completed",
    accuracy: 91.8,
    insights: 5,
    dataPoints: 42,
    model: "Prophet v1.1"
  },
  {
    id: "3",
    date: "2024-01-27",
    type: "category",
    status: "failed",
    insights: 0,
    dataPoints: 0,
    model: "Prophet v1.0"
  },
  {
    id: "4",
    date: "2024-01-20",
    type: "monthly",
    status: "completed",
    accuracy: 89.5,
    insights: 12,
    dataPoints: 186,
    model: "Prophet v1.0"
  },
];

export function HistoryModal({ open, onClose }: HistoryModalProps) {
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
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Prediction History
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            {mockHistory.length} total predictions
          </span>
        </div>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="p-0">
        {view === "list" ? (
          <div className="animate-txn-in">
            {/* List Header */}
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Recent Predictions</h3>
            </div>
            
            {/* Prediction List */}
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {mockHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="px-5 py-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Prediction
                            </span>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
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
                          <div className="text-sm font-medium text-slate-900">
                            {item.accuracy}% accuracy
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          {item.insights} insights
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-txn-in">
            {selectedItem && (
              <div className="px-5 py-6">
                {/* Detail Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(selectedItem.status)}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)} Prediction
                      </h3>
                      <p className="text-sm text-slate-500">
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

                {/* Performance Metrics */}
                <div className="mb-6">
                  <h4 className="text-[15px] font-bold text-slate-900 mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedItem.accuracy && (
                      <div className="border border-slate-100 rounded-lg p-4">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                          Accuracy
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{selectedItem.accuracy}%</span>
                          {selectedItem.accuracy >= 90 ? (
                            <TrendingUp size={16} className="text-emerald-500" />
                          ) : (
                            <TrendingDown size={16} className="text-amber-500" />
                          )}
                        </div>
                      </div>
                    )}
                    <div className="border border-slate-100 rounded-lg p-4">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Data Points
                      </div>
                      <div className="text-lg font-bold text-slate-900">{selectedItem.dataPoints}</div>
                    </div>
                    <div className="border border-slate-100 rounded-lg p-4">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Insights Generated
                      </div>
                      <div className="text-lg font-bold text-slate-900">{selectedItem.insights}</div>
                    </div>
                    <div className="border border-slate-100 rounded-lg p-4">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Model Version
                      </div>
                      <div className="text-sm font-medium text-slate-900">{selectedItem.model}</div>
                    </div>
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="mb-6">
                  <h4 className="text-[15px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Brain size={16} className="text-emerald-500" />
                    Analysis Details
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-5 space-y-0 divide-y divide-slate-100">
                      <DetailRow label="Processing Time" value="2.4 seconds" />
                      <DetailRow label="Confidence Level" value="High" />
                      <DetailRow label="Categories Analyzed" value="8" />
                      <DetailRow label="Model Type" value="Prophet ML" />
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {selectedItem.status === "failed" && (
                  <div className="flex gap-2.5 p-3 rounded-lg text-xs border border-amber-100 text-amber-900 items-start">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
                    <div>
                      <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error Details</h4>
                      <p className="text-[11px] leading-relaxed opacity-85">
                        Prediction failed due to insufficient data. Please ensure you have at least 30 days of transaction history.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalBody>

      {/* Footer */}
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

// Helper component for detail rows
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}
