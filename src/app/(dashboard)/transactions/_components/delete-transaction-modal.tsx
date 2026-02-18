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
import type { TransactionType } from "./types";
import { deleteTransaction } from "../_lib/transaction-service";

interface DeleteTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionType | null;
  onSuccess?: () => void;
}

export function DeleteTransactionModal({
  open,
  onClose,
  transaction,
  onSuccess,
}: DeleteTransactionModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setDeleteError(null);
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    if (!transaction) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteTransaction(transaction.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [transaction, handleClose, onSuccess]);

  if (!transaction) return null;

  const isIncome = transaction.type === "income" || transaction.type === "cash_in";
  const absAmount = transaction.amount.toFixed(2);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Delete Transaction
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete Transaction?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this transaction? This action cannot be undone and will permanently remove the transaction from your records.
          </p>

          {/* Transaction Details */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Amount</span>
                <span className="text-sm font-bold text-slate-900">
                  {isIncome ? "+" : "-"}${absAmount}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Description</span>
                <span className="text-sm font-semibold text-slate-700">{transaction.description ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Date</span>
                <span className="text-sm font-semibold text-slate-700">
                  {new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
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
                This transaction will be permanently deleted and cannot be recovered.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} disabled={deleting}>
          {deleting ? (<><Loader2 size={14} className="animate-spin" /> Deleting...</>) : "Delete Transaction"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
