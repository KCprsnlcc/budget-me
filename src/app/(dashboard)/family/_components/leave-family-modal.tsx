"use client";

import React, { useState } from "react";
import { X, AlertTriangle, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";

interface LeaveFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<{ error: string | null }>;
}

export function LeaveFamilyModal({ open, onClose, onConfirm }: LeaveFamilyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleClose = () => {
    setSubmitting(false);
    setSubmitError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      setSubmitting(true);
      setSubmitError(null);
      const result = await onConfirm();
      setSubmitting(false);
      if (result?.error) {
        setSubmitError(result.error);
        return;
      }
    }
    handleClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Leave Family Group
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Leave Family Group?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to leave this family group? You will lose access to all shared budgets, goals, and history. You'll need a new invitation to rejoin.
          </p>

          {/* Family Details */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Action</span>
                <span className="text-sm font-bold text-slate-900">Leave Family Group</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Impact</span>
                <span className="text-sm font-semibold text-rose-600">Loss of Access</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Rejoin Required</span>
                <span className="text-sm font-semibold text-slate-700">New Invitation Needed</span>
              </div>
            </div>
          </div>

          {/* Final Warning */}
          <div className="p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 mx-auto max-w-sm mt-6">
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
              <p className="text-[11px] leading-relaxed opacity-85">
                Your contributions to shared goals will remain visible, but shared budgets will be removed from your dashboard.
              </p>
            </div>
          </div>

          {submitError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 items-start mx-auto max-w-sm mt-4">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                <p className="text-[11px] leading-relaxed opacity-85">{submitError}</p>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleConfirm} disabled={submitting}>
          {submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Leaving...</>) : (<>Leave Family</>)}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
