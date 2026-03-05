"use client";

import { useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
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

  const handleDelete = useCallback(async () => {
    if (account) {
      onDelete(account.id);
    }
    handleClose();
  }, [account, onDelete, handleClose]);

  if (!account) return null;

  return (
    <Modal open={open} onClose={handleClose} className="w-[95vw] sm:w-[90vw] max-w-[500px]">
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Delete Account</span>
        </ModalHeader>

        {/* Body */}
        <ModalBody className="bg-[#F9FAFB]/30 p-4 sm:p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center animate-in fade-in duration-300">
              {/* Warning Icon */}
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              {/* Warning Message */}
              <h2 className="text-xl font-bold text-gray-900 mb-3">Delete Account?</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete this account? This action cannot be undone and will permanently remove the account and all associated transactions from your records.
              </p>

              {/* Account Details */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 space-y-0 divide-y divide-gray-100">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Name</span>
                    <span className="text-sm font-bold text-gray-900">{account.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Type</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Balance</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₱{account.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Warning */}
              <div className="p-3 rounded-lg text-xs bg-red-50 border border-red-200 text-red-800 mt-6">
                <div className="flex gap-2.5 items-start">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
                  <div className="text-left">
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-0.5">Irreversible Action</h4>
                    <p className="text-xs leading-relaxed">
                      This account and all associated transactions will be permanently deleted and cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="flex justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-100">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 ml-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm bg-red-500 hover:bg-red-600 text-white"
          >
            Delete Account
          </button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
