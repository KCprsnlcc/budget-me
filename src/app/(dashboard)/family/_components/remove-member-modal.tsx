"use client";

import React, { useState, useCallback } from "react";
import { Trash2, Users, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleClose = () => {
    setSubmitting(false);
    setSubmitError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (onConfirm && member) {
      setSubmitting(true);
      setSubmitError(null);
      const result = await onConfirm(member.id);
      setSubmitting(false);
      if (result.error) {
        setSubmitError(result.error);
        return;
      }
    }
    handleClose();
  };

  if (!open || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl border-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Trash2 className="text-rose-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Remove Member</h2>
              <p className="text-xs text-slate-500">Remove from family group</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            <span className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</span>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Member Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm border ${
                    member.role === "Owner"
                      ? "border-emerald-100 text-emerald-700"
                      : member.role === "Admin"
                        ? "border-blue-100 text-blue-700"
                        : member.role === "Member"
                          ? "border-purple-100 text-purple-700"
                          : "border-slate-100 text-slate-700"
                  }`}
                >
                  {member.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    member.role === "Owner"
                      ? "bg-emerald-100 text-emerald-700"
                      : member.role === "Admin"
                        ? "bg-blue-100 text-blue-700"
                        : member.role === "Member"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-700"
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="text-rose-600 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-sm font-medium text-rose-900">Warning</h4>
                  <p className="text-xs text-rose-700 mt-1">
                    This action will permanently remove <span className="font-medium">{member.name}</span> from the family group.
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-rose-700">
                    <li>• They will lose access to shared family features</li>
                    <li>• Their contributions to family goals will remain</li>
                    <li>• They can be re-invited later if needed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to remove <span className="font-medium">{member.name}</span> from the family?
              </p>
            </div>
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                <p className="text-[11px] leading-relaxed opacity-85">{submitError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex items-center gap-2"
          >
            {submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Removing...</>) : (<> <Trash2 size={16} /> Remove Member</>)}
          </Button>
        </div>
      </Card>
    </div>
  );
}
