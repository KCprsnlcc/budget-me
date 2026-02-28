"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import type { FamilyMember } from "./types";

interface RemoveMemberModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (memberId: string) => Promise<{ error: string | null }>;
  member: FamilyMember | null;
}

export function RemoveMemberModal({ 
  open, 
  onClose, 
  onConfirm, 
  member 
}: RemoveMemberModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleClose = () => {
    setConfirmationText("");
    setSubmitError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (confirmationText !== "REMOVE" || !member) return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    const result = await onConfirm(member.id);
    
    setSubmitting(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    
    handleClose();
  };

  if (!open || !member) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Remove Family Member
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Warning Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Remove Member?</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Are you sure you want to remove <span className="font-semibold">{member.name}</span> from the family group? They will lose access to all shared features.
          </p>

          {/* Member Details */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Member</span>
                <div className="flex items-center gap-2">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                      {member.initials}
                    </div>
                  )}
                  <span className="text-sm font-bold text-slate-900">{member.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Role</span>
                <span className={`text-sm font-semibold ${
                  member.role === "Owner" ? "text-emerald-600" :
                  member.role === "Admin" ? "text-blue-600" :
                  member.role === "Member" ? "text-purple-600" :
                  "text-slate-600"
                }`}>{member.role}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Action</span>
                <span className="text-sm font-semibold text-rose-600">Remove from Family</span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="text-left mb-6 max-w-sm mx-auto mt-6">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Type <span className="font-bold text-rose-600">REMOVE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              placeholder="REMOVE"
            />
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 mx-auto max-w-sm mt-4">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                <p className="text-[11px] leading-relaxed opacity-85">{submitError}</p>
              </div>
            </div>
          )}

          {/* Final Warning */}
          <div className="p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 mx-auto max-w-sm mt-6">
            <div>
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
              <p className="text-[11px] leading-relaxed opacity-85">
                This member will be removed from the family. Their contributions to goals will remain, but they can be re-invited later if needed.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1" 
          onClick={handleConfirm}
          disabled={confirmationText !== "REMOVE" || submitting}
        >
          {submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Removing...</>) : ("Remove Member")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
