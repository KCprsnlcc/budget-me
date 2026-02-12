"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Trash2,
  Flag,
} from "lucide-react";
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
    <Modal open={open} onClose={handleClose} className="max-w-[400px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg text-red-600">
            <Trash2 size={18} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Delete Goal</h3>
        </div>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-5">
        <div className="space-y-4">
          {/* Warning Message */}
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 flex items-start gap-3">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">Permanent Action</div>
              <div className="text-xs opacity-90 mt-1">
                This action cannot be undone. All goal data and progress will be permanently deleted.
              </div>
            </div>
          </div>

          {/* Goal Summary */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg text-emerald-600">
                <Flag size={16} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">{goal.name}</h4>
                <p className="text-xs text-slate-500 capitalize">{goal.category} goal</p>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Progress:</span>
                <span className="font-medium text-slate-900">{progress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current:</span>
                <span className="font-medium text-slate-900">{formatCurrency(goal.current)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target:</span>
                <span className="font-medium text-slate-900">{formatCurrency(goal.target)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deadline:</span>
                <span className="font-medium text-slate-900">{formatDate(goal.deadline)}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">
              Are you sure you want to delete this goal?
            </p>
            <p className="text-xs text-slate-400">
              Type <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">delete</span> to confirm
            </p>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-500 hover:bg-red-600"
        >
          {isDeleting ? (
            <>Deleting...</>
          ) : (
            <>
              <Trash2 size={14} className="mr-1" />
              Delete Goal
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
