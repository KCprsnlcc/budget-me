"use client";

import { useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface ClearChatModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ClearChatModal({ open, onClose, onConfirm, isLoading = false }: ClearChatModalProps) {
  const handleClose = useCallback(() => {
    if (isLoading) return;
    onClose();
  }, [onClose, isLoading]);

  const handleConfirm = useCallback(() => {
    if (isLoading) return;
    onConfirm();
  }, [onConfirm, isLoading]);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Clear Conversation
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">Clear Conversation?</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to clear this conversation? This action cannot be undone and all messages will be permanently deleted.
          </p>

          {/* Final Warning */}
          <div className="p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 mx-auto max-w-sm mt-6">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Irreversible Action</h4>
                <p className="text-[11px] leading-relaxed">
                  This conversation will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Clearing...
            </>
          ) : (
            "Clear Chat"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
