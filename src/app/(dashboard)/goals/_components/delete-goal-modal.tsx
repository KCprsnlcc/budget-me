"use client";

import { useState, useCallback } from "react";
import { deleteGoal } from "../_lib/goal-service";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import type { GoalType } from "./types";
import { formatCurrency, formatDate, getGoalProgress } from "./constants";

interface DeleteGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalType | null;
  onSuccess?: () => void;
  onDelete?: (goalId: string) => Promise<{ error: string | null }>;
}

export function DeleteGoalModal({ open, onClose, goal, onSuccess, onDelete }: DeleteGoalModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setIsDeleting(false);
    setDeleteError(null);
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    if (!goal) return;
    setIsDeleting(true);
    setDeleteError(null);
    
    // Use onDelete if provided (for family goals with activity logging)
    // Otherwise use the default service function
    const { error } = onDelete 
      ? await onDelete(goal.id)
      : await deleteGoal(goal.id);
    
    setIsDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [goal, handleClose, onSuccess, onDelete]);

  if (!goal) return null;

  const progress = getGoalProgress(goal.current, goal.target);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Delete Goal
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete Goal?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this goal? This action cannot be undone and will permanently remove the goal and all associated progress from your records.
          </p>

          {/* Goal Details */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Goal Name</span>
                <span className="text-sm font-bold text-slate-900">{goal.name}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Category</span>
                <span className="text-sm font-semibold text-slate-700 capitalize">{goal.category}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Progress</span>
                <span className="text-sm font-bold text-slate-900">{progress}%</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Current Amount</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(goal.current)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Target Amount</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(goal.target)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Deadline</span>
                <span className="text-sm font-semibold text-slate-700">{formatDate(goal.deadline)}</span>
              </div>
            </div>
          </div>
          {/* Error Notice */}
          {deleteError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 mx-auto max-w-sm mt-4 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                <p className="text-[11px] leading-relaxed opacity-85">{deleteError}</p>
              </div>
            </div>
          )}

          {/* Final Warning */}
          <div className="p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 mx-auto max-w-sm mt-6">
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
              <p className="text-[11px] leading-relaxed opacity-85">
                This goal and all associated progress will be permanently deleted and cannot be recovered.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (<><Loader2 size={14} className="animate-spin" /> Deleting...</>) : "Delete Goal"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
