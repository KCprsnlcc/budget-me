"use client";

import { useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, X } from "lucide-react";
import type { TransactionType } from "./types";

interface DeleteTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionType | null;
}

export function DeleteTransactionModal({
  open,
  onClose,
  transaction,
}: DeleteTransactionModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    // TODO: wire up actual delete logic
    handleClose();
  }, [handleClose]);

  if (!transaction) return null;

  const isIncome = transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount).toFixed(2);

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
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-full text-rose-500 flex items-center justify-center mx-auto mb-6 border border-rose-200">
            <Trash2 size={28} />
          </div>

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
                <span className="text-sm font-semibold text-slate-700">{transaction.name}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Date</span>
                <span className="text-sm font-semibold text-slate-700">{transaction.date}</span>
              </div>
            </div>
          </div>

          {/* Final Warning */}
          <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 items-start mx-auto max-w-sm mt-6 text-left">
            <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
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
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose}>
          <X size={14} /> Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete}>
          <Trash2 size={14} /> Delete Transaction
        </Button>
      </ModalFooter>
    </Modal>
  );
}
