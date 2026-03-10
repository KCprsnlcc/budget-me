"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  BarChart3,
  Brain,
  TrendingUp,
  MessageSquare,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminAIUsage } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminAIUsageModalProps {
  open: boolean;
  onClose: () => void;
  usage: AdminAIUsage | null;
}

export function ViewAdminAIUsageModal({
  open,
  onClose,
  usage,
}: ViewAdminAIUsageModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Helper function to convert usage user data to Supabase User format for UserAvatar
  const createMockUser = (usage: AdminAIUsage): SupabaseUser => {
    return {
      id: usage.user_id,
      email: usage.user_email || "",
      user_metadata: {
        full_name: usage.user_name,
        avatar_url: usage.user_avatar,
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: usage.created_at,
    } as SupabaseUser;
  };

  if (!usage) return null;

  const isAtLimit = usage.total_used >= 25;
  const isHigh = usage.total_used >= 16 && usage.total_used < 25;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI Usage Details
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />

      {/* Body */}
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {/* Usage Header */}
            <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
              <div className="flex justify-center mb-3">
                <UserAvatar 
                  user={createMockUser(usage)} 
                  size="xl"
                  className="ring-2 ring-white shadow-sm"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{usage.user_name || "No Name"}</h3>
              <p className="text-sm text-slate-500 mb-3">{usage.user_email || "Unknown User"}</p>
              <div className="text-[24px] font-bold my-2 text-slate-900">
                {usage.total_used} / 25 AI Credits
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-xs font-semibold ${
                  isAtLimit ? "text-red-500" : isHigh ? "text-amber-500" : "text-emerald-500"
                }`}>
                  {isAtLimit ? "At Limit" : isHigh ? "High Usage" : "Normal Usage"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-600">
                  {format(new Date(usage.usage_date + "T00:00:00"), "MMM dd, yyyy")}
                </span>
              </div>
            </div>

            {/* AI Features Breakdown */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">AI Features Usage</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow 
                    label="Predictions" 
                    value={usage.predictions_used.toString()} 
                    icon={Brain} 
                  />
                  <DetailRow 
                    label="Insights" 
                    value={usage.insights_used.toString()} 
                    icon={TrendingUp} 
                  />
                  <DetailRow 
                    label="Chatbot" 
                    value={usage.chatbot_used.toString()} 
                    icon={MessageSquare} 
                  />
                  <DetailRow 
                    label="Total Usage" 
                    value={`${usage.total_used} / 25`} 
                    icon={BarChart3} 
                  />
                </div>
              </div>
            </div>

            {/* Usage Information */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Usage Information</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow 
                    label="Date" 
                    value={format(new Date(usage.usage_date + "T00:00:00"), "MMM dd, yyyy")} 
                    icon={Calendar} 
                  />
                  <DetailRow 
                    label="Status" 
                    value={isAtLimit ? "At Limit" : isHigh ? "High Usage" : "Normal"} 
                    icon={Activity} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Analysis */}
        {step === 2 && (
          <div className="space-y-6 animate-txn-in">
            {/* User Information */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                User Information
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow 
                    label="Email" 
                    value={usage.user_email || "Unknown"} 
                    icon={User} 
                  />
                  <DetailRow 
                    label="Name" 
                    value={usage.user_name || "—"} 
                    icon={User} 
                  />
                  <DetailRow 
                    label="User ID" 
                    value={usage.user_id} 
                    icon={User} 
                  />
                </div>
              </div>
            </div>

            {/* Usage Metadata */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                Usage Metadata
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                      <BarChart3 size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Usage Status</div>
                      <div className="text-[10px] text-slate-400">
                        {isAtLimit ? "User has reached daily limit" : isHigh ? "High usage detected" : "Normal usage level"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                      <Clock size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Created</div>
                      <div className="text-[10px] text-slate-400">
                        {format(new Date(usage.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                      <RefreshCw size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Last Updated</div>
                      <div className="text-[10px] text-slate-400">
                        {format(new Date(usage.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Record ID */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                Record ID
              </h3>
              <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                  {usage.id}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
            <ArrowLeft size={14} /> Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          size="sm"
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else {
              setStep(2);
            }
          }}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 2 ? (
            <>Back to Overview <ArrowLeft size={14} /></>
          ) : (
            <>View Analysis <ArrowRight size={14} /></>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1.5">
        <Icon size={12} className="text-slate-400" />
        {label}
      </span>
      <span className="text-[13px] font-semibold text-slate-700">{value}</span>
    </div>
  );
}
