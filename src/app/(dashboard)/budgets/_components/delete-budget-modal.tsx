"use client";

import { useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, X } from "lucide-react";
import type { BudgetType } from "./types";
import { formatCurrency } from "./constants";

interface DeleteBudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetType | null;
}

export function DeleteBudgetModal({
  open,
  onClose,
  budget,
}: DeleteBudgetModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    // TODO: Implement actual delete logic
    handleClose();
  }, [handleClose]);

  if (!budget) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Delete Budget
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
            <Trash2 size={28} />
          </div>

          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete Budget?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this budget? This action cannot be undone and all tracking data for
            this budget will be permanently lost.
          </p>

          {/* Budget Details */}
          <div className="mx-auto max-w-sm space-y-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Budget to Delete</div>
              <div className="text-sm font-semibold text-slate-900">{budget.name}</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Current Amount</div>
              <div className="text-sm font-semibold text-slate-900">{formatCurrency(budget.amount)}</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Period</div>
              <div className="text-sm font-semibold text-slate-900 capitalize">{budget.period}</div>
            </div>
          </div>

          {/* Final Warning */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-start gap-3 mx-auto max-w-sm mt-6">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
              <p className="text-[11px] leading-relaxed opacity-85">
                This action cannot be undone. All budget history and tracking will be permanently deleted.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClose}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <X size={14} />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 ml-3"
        >
          <Trash2 size={14} />
          Delete Budget
        </Button>
      </ModalFooter>
    </Modal>
  );
}
