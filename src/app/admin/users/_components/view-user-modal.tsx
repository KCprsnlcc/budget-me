"use client";

import { useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { User } from "../_lib/types";
import { 
  Mail, Phone, Clock, RefreshCw,
  ArrowLeft, ArrowRight, User as UserIcon, Shield
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface ViewUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
}

const STEPS = ["Overview", "Analysis"];

export function ViewUserModal({ open, onClose, user, onEdit }: ViewUserModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const createMockUser = (user: User): SupabaseUser => {
    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.full_name,
        avatar_url: undefined,
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: user.created_at,
    } as SupabaseUser;
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            User Details
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 2
          </span>
        </div>
      </ModalHeader>

      {}
      <Stepper steps={STEPS} currentStep={step} />
      
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {}
            <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
              <div className="flex justify-center mb-3">
                <UserAvatar 
                  user={createMockUser(user)} 
                  size="xl"
                  className="ring-2 ring-white shadow-sm"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{user.full_name || "No Name"}</h3>
              <p className="text-sm text-slate-500 mb-3">{user.email}</p>
              <div className="text-[24px] font-bold my-2 text-slate-900">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} User
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-xs font-semibold ${user.is_active ? "text-emerald-500" : "text-red-500"}`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-600">
                  Member since {format(new Date(user.created_at), "MMM yyyy")}
                </span>
              </div>
            </div>

            {}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Contact Information</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow label="Email" value={user.email} icon={Mail} />
                  <DetailRow label="Phone" value={user.phone || "Not provided"} icon={Phone} />
                  <DetailRow label="Full Name" value={user.full_name || "Not provided"} icon={UserIcon} />
                </div>
              </div>
            </div>

            {}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Account Information</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow 
                    label="Role" 
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                    icon={Shield} 
                  />
                  <DetailRow 
                    label="Status" 
                    value={user.is_active ? "Active" : "Inactive"} 
                    icon={UserIcon} 
                  />
                  <DetailRow 
                    label="Created" 
                    value={format(new Date(user.created_at), "MMM dd, yyyy")} 
                    icon={Clock} 
                  />
                  <DetailRow 
                    label="Last Login" 
                    value={user.last_login ? format(new Date(user.last_login), "MMM dd, yyyy") : "Never"} 
                    icon={Clock} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {step === 2 && (
          <div className="space-y-6 animate-txn-in">
            {}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                User Information
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow
                    label="Email"
                    value={user.email}
                    icon={Mail}
                  />
                  <DetailRow
                    label="Full Name"
                    value={user.full_name || "—"}
                    icon={UserIcon}
                  />
                  <DetailRow
                    label="Phone"
                    value={user.phone || "—"}
                    icon={Phone}
                  />
                  <DetailRow
                    label="User ID"
                    value={user.id}
                    icon={UserIcon}
                  />
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                User Metadata
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                      <Shield size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Role</div>
                      <div className="text-[10px] text-slate-400">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)} permissions
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
                        {format(new Date(user.created_at), "MMM dd, yyyy 'at' h:mm a")}
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
                      <div className="text-sm font-semibold text-slate-900">Last Login</div>
                      <div className="text-[10px] text-slate-400">
                        {user.last_login ? format(new Date(user.last_login), "MMM dd, yyyy 'at' h:mm a") : "Never logged in"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                User ID
              </h3>
              <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

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
