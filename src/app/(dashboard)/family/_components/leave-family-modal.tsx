"use client";

import React, { useState } from "react";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import type { FamilyMember } from "./types";

interface LeaveFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId?: string) => Promise<{ error: string | null }>;
  familyMembers: FamilyMember[];
  currentUserId: string;
  currentUserRole: string;
}

export function LeaveFamilyModal({ 
  open, 
  onClose, 
  onConfirm, 
  familyMembers, 
  currentUserId,
  currentUserRole 
}: LeaveFamilyModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [selectedSuccessorId, setSelectedSuccessorId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showTransferStep, setShowTransferStep] = useState(false);

  const isOwner = currentUserRole === "Owner";
  
  const eligibleSuccessors = familyMembers.filter(member => 
    member.id !== currentUserId && 
    member.id !== familyMembers.find(m => m.role === "Owner")?.id && 
    member.status === "active"
  );

  const handleClose = () => {
    setConfirmationText("");
    setSelectedSuccessorId("");
    setSubmitError(null);
    setShowTransferStep(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (confirmationText !== "LEAVE") return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    const result = await onConfirm(isOwner ? selectedSuccessorId : undefined);
    
    setSubmitting(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    
    handleClose();
  };

  const handleProceedToTransfer = () => {
    if (selectedSuccessorId) {
      setShowTransferStep(true);
    }
  };

  if (!open) return null;

  const selectedSuccessor = eligibleSuccessors.find(m => m.id === selectedSuccessorId);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Leave Family Group
        </span>
      </ModalHeader>

      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            {isOwner ? "Transfer & Leave Family?" : "Leave Family Group?"}
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            {isOwner 
              ? "As the owner, you must transfer ownership before leaving. You will become an Admin first, then leave the family."
              : "Are you sure you want to leave this family group? You will lose access to all shared budgets, goals, and history."
            }
          </p>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Action</span>
                <span className="text-sm font-bold text-slate-900">Leave Family Group</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Impact</span>
                <span className="text-sm font-semibold text-rose-600">
                  {isOwner ? "Transfer + Leave" : "Loss of Access"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Rejoin Required</span>
                <span className="text-sm font-semibold text-slate-700">New Invitation Needed</span>
              </div>
            </div>
          </div>

          {isOwner && !showTransferStep && (
            <div className="mt-6 max-w-sm mx-auto">
              <label className="block text-xs font-medium text-slate-700 mb-3 text-left">
                Select New Owner *
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
                {eligibleSuccessors.length > 0 ? (
                  eligibleSuccessors.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedSuccessorId(member.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-left ${
                        selectedSuccessorId === member.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                            {member.initials}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4">No eligible members found</p>
                )}
              </div>
              {selectedSuccessorId && (
                <Button 
                  onClick={handleProceedToTransfer}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue with {selectedSuccessor?.name}
                </Button>
              )}
            </div>
          )}

          {(!isOwner || showTransferStep) && (
            <div className="text-left mb-6 max-w-sm mx-auto mt-6">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Type <span className="font-bold text-rose-600">LEAVE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                placeholder="LEAVE"
              />
              {isOwner && selectedSuccessor && (
                <p className="text-xs text-slate-500 mt-2">
                  Ownership will transfer to <span className="font-medium">{selectedSuccessor.name}</span>
                </p>
              )}
            </div>
          )}

          {submitError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 mx-auto max-w-sm mt-4">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                <p className="text-[11px] leading-relaxed opacity-85">{submitError}</p>
              </div>
            </div>
          )}

          {(!isOwner || showTransferStep) && (
            <div className="p-3 rounded-lg text-xs bg-amber-50 border border-amber-100 text-amber-900 mx-auto max-w-sm mt-6">
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Irreversible Action</h4>
                <p className="text-[11px] leading-relaxed opacity-85">
                  This action cannot be undone. {isOwner 
                    ? "You will become Admin, then leave the family. Only the new owner can invite you back."
                    : "You'll need a new invitation to rejoin."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        {(!isOwner || showTransferStep) && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1" 
            onClick={handleConfirm}
            disabled={confirmationText !== "LEAVE" || submitting || (isOwner && !selectedSuccessorId)}
          >
            {submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Leaving...</>) : ("Leave Family")}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
