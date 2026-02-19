"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";

interface DeleteFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<{ error: string | null }>;
}

export function DeleteFamilyModal({ open, onClose, onConfirm }: DeleteFamilyModalProps) {
  const [confirmationText, setConfirmationText] = useState("");

  const handleClose = () => {
    setConfirmationText("");
    onClose();
  };

  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (confirmationText === "DELETE") {
      if (onConfirm) {
        setSubmitting(true);
        const result = await onConfirm();
        setSubmitting(false);
        if (result?.error) return;
      }
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Delete Family Group
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete Family Group?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this family group? All shared budgets, goals, and contributions will be lost. This action cannot be undone.
          </p>

          {/* Family Details */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Action</span>
                <span className="text-sm font-bold text-slate-900">Delete Family Group</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Impact</span>
                <span className="text-sm font-semibold text-rose-600">Permanent Data Loss</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Affected Data</span>
                <span className="text-sm font-semibold text-slate-700">Budgets, Goals, Contributions</span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="text-left mb-6 max-w-sm mx-auto mt-6">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Type <span className="font-bold text-rose-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              placeholder="DELETE"
            />
          </div>
          {/* Final Warning */}
          <div className="p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 mx-auto max-w-sm mt-6">
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
              <p className="text-[11px] leading-relaxed opacity-85">
                This family group and all associated data will be permanently deleted and cannot be recovered.
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
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1" 
          onClick={handleConfirm}
          disabled={confirmationText !== "DELETE"}
        >
          Delete Family
        </Button>
      </ModalFooter>
    </Modal>
  );
}
