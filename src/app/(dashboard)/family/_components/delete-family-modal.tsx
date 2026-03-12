"use client";

import React, { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
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
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Delete Family Group
        </span>
      </ModalHeader>

      <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
        <div className="text-center animate-txn-in">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete Family Group?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this family group? All shared budgets, goals, and contributions will be lost. This action cannot be undone.
          </p>

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
          <div className="p-3 rounded-lg text-xs bg-white border border-gray-200 mx-auto max-w-sm mt-6">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Irreversible Action</h4>
                <p className="text-[11px] leading-relaxed text-gray-700">
                  This family group and all associated data will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky bottom-0 bg-white z-10 lg:static">
        <button
          onClick={handleClose}
          disabled={submitting}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirmationText !== "DELETE" || submitting}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </>
          ) : (
            "Delete Family"
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
