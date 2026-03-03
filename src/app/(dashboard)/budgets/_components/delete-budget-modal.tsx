"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import type { BudgetType } from "./types";
import { formatCurrency } from "./constants";
import { deleteBudget } from "../_lib/budget-service";

interface DeleteBudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget: BudgetType | null;
  onSuccess?: () => void;
}

export function DeleteBudgetModal({
  open,
  onClose,
  budget,
  onSuccess,
}: DeleteBudgetModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setDeleteError(null);
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    if (!budget) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteBudget(budget.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [budget, handleClose, onSuccess]);

  if (!budget) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Delete Budget
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">Delete Budget?</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this budget? This action cannot be undone and all tracking data for
            this budget will be permanently lost.
          </p>

          {/* Budget Details */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-gray-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Budget Name</span>
                <span className="text-sm font-semibold text-gray-900">{budget.budget_name}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Amount</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(budget.amount)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Period</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">{budget.period}</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {deleteError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-4 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                <p className="text-[11px] leading-relaxed">{deleteError}</p>
              </div>
            </div>
          )}

          {/* Final Warning */}
          <div className="p-3 rounded-lg bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-6">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Irreversible Action</h4>
                <p className="text-[11px] leading-relaxed">
                  This action cannot be undone. All budget history and tracking will be permanently deleted.
                </p>
              </div>
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
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-2"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 ml-3"
        >
          {deleting ? (<><Loader2 size={14} className="animate-spin" /> Deleting...</>) : "Delete Budget"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
