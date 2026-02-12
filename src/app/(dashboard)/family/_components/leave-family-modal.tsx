"use client";

import React from "react";
import { X, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LeaveFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function LeaveFamilyModal({ open, onClose, onConfirm }: LeaveFamilyModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    console.log("Leaving family group");
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Leave Family Group
          </h3>
          <button
            className="text-slate-400 hover:text-slate-600"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <Card className="p-4 bg-amber-50 border-amber-100">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={20} />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-900">
                  Are you sure you want to leave?
                </p>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  You will lose access to all shared budgets, goals, and history. You'll need a new invitation to rejoin.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-700">
              What happens next:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[11px] text-slate-500">
                <Check className="text-emerald-400 mt-0.5" size={14} />
                Your contributions to shared goals will remain visible.
              </li>
              <li className="flex items-start gap-2 text-[11px] text-slate-500">
                <Check className="text-emerald-400 mt-0.5" size={14} />
                Shared budgets will be removed from your dashboard.
              </li>
              <li className="flex items-start gap-2 text-[11px] text-slate-500">
                <Check className="text-emerald-400 mt-0.5" size={14} />
                Admins will be notified of your departure.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-100"
          >
            Confirm & Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
