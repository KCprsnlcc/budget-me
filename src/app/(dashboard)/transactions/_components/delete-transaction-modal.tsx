"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, TrendingUp } from "lucide-react";
import type { TransactionType } from "./types";
import { deleteTransaction, fetchAccounts } from "../_lib/transaction-service";
import { useAuth } from "@/components/auth/auth-context";
import { useEffect } from "react";

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
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const { user } = useAuth();

  const handleClose = useCallback(() => {
    setDeleteError(null);
    setAccountBalance(null);
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(async () => {
    if (!transaction) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteTransaction(
      transaction.id, 
      transaction.budget_id ?? undefined,
      transaction.goal_id ?? undefined
    );
    setDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    handleClose();
    onSuccess?.();
  }, [transaction, handleClose, onSuccess]);

  // Fetch account balance when modal opens
  useEffect(() => {
    if (!open || !transaction || !user) return;
    
    const fetchAccountBalance = async () => {
      const accounts = await fetchAccounts(user.id);
      const account = accounts.find(a => a.id === transaction.account_id);
      if (account) {
        setAccountBalance(account.balance);
      }
    };
    
    fetchAccountBalance();
  }, [open, transaction, user]);

  if (!transaction) return null;

  const isIncome = transaction.type === "income" || transaction.type === "cash_in";
  const absAmount = transaction.amount.toFixed(2);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Delete Transaction
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">Delete Transaction?</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this transaction? This action cannot be undone and will permanently remove the transaction from your records.
          </p>

          {/* Transaction Details */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-gray-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Amount</span>
                <span className="text-sm font-bold text-gray-900">
                  {isIncome ? "+" : "-"}₱{absAmount}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Description</span>
                <span className="text-sm font-semibold text-gray-700">{transaction.description ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Date</span>
                <span className="text-sm font-semibold text-gray-700">
                  {new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {accountBalance !== null && (
                <>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Current Balance</span>
                    <span className="text-sm font-semibold text-gray-700">₱{accountBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Balance After Delete</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₱{(accountBalance + (isIncome ? -transaction.amount : transaction.amount)).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Budget Restoration Notice */}
          {transaction.type === "expense" && transaction.budget_id && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-4 items-start">
              <TrendingUp size={16} className="flex-shrink-0 mt-px text-emerald-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Budget Will Be Restored</h4>
                <p className="text-[11px] leading-relaxed">
                  ₱{absAmount} will be restored from your budget progress when this expense is deleted.
                </p>
              </div>
            </div>
          )}

          {/* Goal Progress Restoration Notice */}
          {transaction.goal_id && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-4 items-start">
              <TrendingUp size={16} className="flex-shrink-0 mt-px text-blue-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Goal Progress Will Be Updated</h4>
                <p className="text-[11px] leading-relaxed">
                  ₱{absAmount} will be removed from your goal progress and contribution history when this transaction is deleted.
                </p>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {deleteError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-4 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                <p className="text-[11px] leading-relaxed">{deleteError}</p>
              </div>
            </div>
          )}

          {/* Final Warning */}
          <div className="p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-6">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Irreversible Action</h4>
                <p className="text-[11px] leading-relaxed">
                  This transaction will be permanently deleted and cannot be recovered.
                </p>
              </div>
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
