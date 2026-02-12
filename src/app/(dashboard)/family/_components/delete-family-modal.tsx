"use client";

import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
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
  onConfirm?: () => void;
}

export function DeleteFamilyModal({ open, onClose, onConfirm }: DeleteFamilyModalProps) {
  const [confirmationText, setConfirmationText] = useState("");

  const handleClose = () => {
    setConfirmationText("");
    onClose();
  };

  const handleConfirm = () => {
    if (confirmationText === "DELETE") {
      console.log("Deleting family group");
      if (onConfirm) {
        onConfirm();
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
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-full text-rose-500 flex items-center justify-center mx-auto mb-6 border border-rose-200">
            <Trash2 size={28} />
          </div>

          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete Family Group?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            All shared budgets, goals, and contributions will be lost. This action cannot be undone.
          </p>

          {/* Confirmation Input */}
          <div className="text-left mb-6 max-w-sm mx-auto">
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
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose}>
          <X size={14} /> Cancel
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1" 
          onClick={handleConfirm}
          disabled={confirmationText !== "DELETE"}
        >
          <Trash2 size={14} /> Delete Family
        </Button>
      </ModalFooter>
    </Modal>
  );
}
