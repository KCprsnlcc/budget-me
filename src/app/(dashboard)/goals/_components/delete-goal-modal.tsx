"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { GoalType } from "./types";
import { formatCurrency, formatDate, getGoalProgress } from "./constants";

interface DeleteGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalType | null;
}

export function DeleteGoalModal({ open, onClose, goal }: DeleteGoalModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = useCallback(() => {
    setIsDeleting(false);
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    if (!goal) return;
    
    setIsDeleting(true);
    
    try {
      // TODO: Implement actual goal deletion logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      handleClose();
    } catch (error) {
      console.error("Failed to delete goal:", error);
      setIsDeleting(false);
    }
  }, [goal, handleClose]);

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
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete}>
          Delete Goal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
