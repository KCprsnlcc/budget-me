"use client";

import { useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Account } from "./types";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onDelete: (accountId: string) => void;
}

export function DeleteAccountModal({ open, onClose, account, onDelete }: DeleteAccountModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    if (account) {
      onDelete(account.id);
    }
    handleClose();
  }, [account, onDelete, handleClose]);

  if (!account) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Delete Account
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete Account?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this account? This action cannot be undone and will permanently remove the account and all associated transactions from your records.
          </p>

          {/* Account Details */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Account Name</span>
                <span className="text-sm font-bold text-slate-900">{account.name}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Account Type</span>
                <span className="text-sm font-semibold text-slate-700">
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Current Balance</span>
                <span className="text-sm font-bold text-slate-900">
                  ₱{account.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Transactions</span>
                <span className="text-sm font-semibold text-rose-600">Multiple</span>
              </div>
            </div>
          </div>

          {/* Final Warning */}
          <div className="p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 mx-auto max-w-sm mt-6">
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
              <p className="text-[11px] leading-relaxed opacity-85">
                This account and all associated transactions will be permanently deleted and cannot be recovered.
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
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete}>
          Delete Account
        </Button>
      </ModalFooter>
    </Modal>
  );
}
