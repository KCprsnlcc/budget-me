"use client";

import { useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

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
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Clear Conversation
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-full text-rose-500 flex items-center justify-center mx-auto mb-6 border border-rose-200">
            <Trash2 size={28} />
          </div>

          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Clear Conversation?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to clear this conversation? This action cannot be undone and all messages will be permanently deleted.
          </p>

          {/* Final Warning */}
          <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 items-start mx-auto max-w-sm mt-6 text-left">
            <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
              <p className="text-[11px] leading-relaxed opacity-85">
                This conversation will be permanently deleted and cannot be recovered.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1 hover:bg-transparent" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1 hover:bg-red-500" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin mr-2" />
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
