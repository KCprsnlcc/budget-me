"use client";

import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm mx-4 bg-white rounded-xl shadow-xl">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Delete Family Group?
          </h3>
          
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            All shared budgets, goals, and contributions will be lost. This action cannot be undone.
          </p>

          <div className="text-left mb-6">
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

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={confirmationText !== "DELETE"}
              className="flex-1 bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-100"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
