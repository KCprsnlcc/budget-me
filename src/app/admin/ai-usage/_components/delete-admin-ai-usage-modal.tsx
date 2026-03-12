"use client";

import { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAdminAIUsage } from "../_lib/admin-ai-usage-service";
import type { AdminAIUsage } from "../_lib/types";

interface DeleteAdminAIUsageModalProps {
  open: boolean;
  onClose: () => void;
  usage: AdminAIUsage | null;
  onSuccess: () => void;
}

export function DeleteAdminAIUsageModal({
  open,
  onClose,
  usage,
  onSuccess,
}: DeleteAdminAIUsageModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!usage) return;

    try {
      setLoading(true);
      const { error } = await deleteAdminAIUsage(usage.id);

      if (error) throw new Error(error);

      toast.success("AI usage record deleted successfully");
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete AI usage record");
    } finally {
      setLoading(false);
    }
  };

  if (!usage) return null;

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <ModalHeader onClose={onClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Delete AI Usage Record
        </span>
      </ModalHeader>

      <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
        <div className="text-center animate-txn-in">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Delete AI Usage Record?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to delete this AI usage record for{" "}
            <span className="font-semibold text-slate-700">{usage.user_email}</span> on{" "}
            <span className="font-semibold text-slate-700">{usage.usage_date}</span>?
          </p>

          {}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Total Used</span>
                <span className="text-sm font-bold text-slate-900">{usage.total_used} / 25</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Date</span>
                <span className="text-sm font-semibold text-slate-700">{usage.usage_date}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Predictions</span>
                <span className="text-sm font-semibold text-slate-700">{usage.predictions_used}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Insights</span>
                <span className="text-sm font-semibold text-slate-700">{usage.insights_used}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Chatbot</span>
                <span className="text-sm font-semibold text-slate-700">{usage.chatbot_used}</span>
              </div>
            </div>
          </div>

          {}
          <div className="p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 mx-auto max-w-sm mt-6">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">Irreversible Action</h4>
                <p className="text-[11px] leading-relaxed">
                  This AI usage record will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Record"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
