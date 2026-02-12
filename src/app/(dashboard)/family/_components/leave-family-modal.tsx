"use client";

import React from "react";
import { X, AlertTriangle, LogOut } from "lucide-react";
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
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-full text-amber-500 flex items-center justify-center mx-auto mb-6 border border-amber-200">
            <LogOut size={28} />
          </div>

          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Leave Family Group?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            You will lose access to all shared budgets, goals, and history. You'll need a new invitation to rejoin.
          </p>

          {/* Warning Details */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mx-auto max-w-sm">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <div className="text-left">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                  Are you sure you want to leave?
                </h4>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Your contributions to shared goals will remain visible, but shared budgets will be removed from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose}>
          <X size={14} /> Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleConfirm}>
          <LogOut size={14} /> Leave Family
        </Button>
      </ModalFooter>
    </Modal>
  );
}
