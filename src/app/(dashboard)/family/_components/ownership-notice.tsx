"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";
import type { Family } from "./types";

interface OwnershipNoticeProps {
  familyData: Family | null;
  onTransferOwnership: () => void;
  onLeaveFamily: () => void;
}

export function OwnershipNotice({ 
  familyData, 
  onTransferOwnership, 
  onLeaveFamily 
}: OwnershipNoticeProps) {
  return (
    <Card className="p-6 mb-8 border-slate-200/60">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Ownership Notice</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              As a family owner, you cannot join other families. To join another family, you must first transfer ownership of{" "}
              <span className="font-medium text-slate-800">{familyData?.name || "your family"}</span>{" "}
              or leave the family entirely.
            </p>
          </div>

          <div className="p-4">
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-slate-800 mb-1">Available Options:</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200/50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-slate-700">Transfer Ownership</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Assign ownership to another family member and stay as admin/member
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onTransferOwnership}
                    className="text-xs text-slate-400 hover:text-emerald-600 hover:bg-transparent transition-colors flex items-center gap-1"
                  >
                    <ArrowRight size={14} />
                    Transfer
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200/50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-slate-700">Leave Family</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Permanently leave this family and join or create another one
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onLeaveFamily}
                    className="text-xs text-slate-400 hover:text-red-600 hover:bg-transparent transition-colors flex items-center gap-1"
                  >
                    <LogOut size={14} />
                    Leave
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-medium">Note:</span> Family owners have full administrative privileges and are responsible for managing the family. 
              These restrictions ensure proper family governance and prevent conflicts of interest.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
