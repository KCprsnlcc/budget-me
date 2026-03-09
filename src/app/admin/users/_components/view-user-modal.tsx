"use client";

import { useState, useCallback, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { User } from "../_lib/types";
import { 
  Mail, Phone, Clock,
  ArrowLeft, ArrowRight, Loader2, Activity, TrendingUp, Shield
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
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Mock analysis data - in a real app, this would come from an API
  const [activityStats, setActivityStats] = useState({
    totalLogins: 0,
    lastActive: null as string | null,
    accountAge: 0,
    activityScore: 0,
  });

  const reset = useCallback(() => {
    setStep(1);
    setActivityStats({
      totalLogins: 0,
      lastActive: null,
      accountAge: 0,
      activityScore: 0,
    });
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Helper function to convert User to Supabase User format for UserAvatar
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

  // Fetch analysis data when moving to step 2
  useEffect(() => {
    if (step !== 2 || !user) return;
    
    setLoadingAnalysis(true);
    
    // Simulate API call - replace with actual API call
    setTimeout(() => {
      const createdDate = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      setActivityStats({
        totalLogins: Math.floor(Math.random() * 100) + 10,
        lastActive: user.last_login || user.created_at,
        accountAge: daysSinceCreation,
        activityScore: user.is_active ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30) + 10,
      });
      
      setLoadingAnalysis(false);
    }, 500);
  }, [step, user]);

  if (!user) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
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

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />
      
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {/* User Header */}
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
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs font-medium text-slate-600">
                  {user.is_active ? "Active" : "Inactive"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-600">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Contact Information</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow label="Email" value={user.email} icon={Mail} />
                  <DetailRow label="Phone" value={user.phone || "Not provided"} icon={Phone} />
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Account Status</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
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

        {/* STEP 2: Analysis */}
        {step === 2 && (
          <div className="space-y-6 animate-txn-in">
            {loadingAnalysis ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-emerald-500" />
                <span className="ml-2 text-sm text-slate-500">Loading insights...</span>
              </div>
            ) : (
              <>
                {/* Activity Insights */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                    Activity Insights
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Total Logins
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {activityStats.totalLogins}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Since account creation
                      </div>
                    </div>
                    <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Account Age
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {activityStats.accountAge} days
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Member since {format(new Date(user.created_at), "MMM yyyy")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Score */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                    Activity Score
                  </h3>
                  <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-emerald-500" />
                        <span className="text-sm font-semibold text-slate-900">Engagement Level</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900">{activityStats.activityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          activityStats.activityScore >= 70 
                            ? "bg-emerald-500" 
                            : activityStats.activityScore >= 40 
                            ? "bg-amber-500" 
                            : "bg-red-500"
                        }`}
                        style={{ width: `${activityStats.activityScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      {activityStats.activityScore >= 70 
                        ? "Highly active user with regular engagement" 
                        : activityStats.activityScore >= 40 
                        ? "Moderately active user" 
                        : "Low activity - may need re-engagement"}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                          <Clock size={16} className="text-slate-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Last Login</div>
                          <div className="text-[10px] text-slate-400">
                            {activityStats.lastActive 
                              ? format(new Date(activityStats.lastActive), "MMM dd, yyyy 'at' h:mm a")
                              : "Never"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                          <TrendingUp size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Account Status</div>
                          <div className="text-[10px] text-slate-400">
                            {user.is_active ? "Active and in good standing" : "Inactive - requires attention"}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions & Access */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                    Permissions & Access
                  </h3>
                  <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield size={16} className={
                        user.role === "admin" 
                          ? "text-purple-600" 
                          : user.role === "moderator"
                          ? "text-blue-600"
                          : "text-slate-600"
                      } />
                      <span className="text-sm font-semibold text-slate-900">
                        {user.role === "admin" 
                          ? "Administrator" 
                          : user.role === "moderator"
                          ? "Moderator"
                          : "Standard User"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {user.role === "admin" 
                        ? "Full system access with administrative privileges. Can manage users, settings, and all system features." 
                        : user.role === "moderator"
                        ? "Elevated permissions for content moderation and user management. Limited administrative access."
                        : "Standard user access with basic permissions. Can manage own account and access standard features."}
                    </p>
                  </div>
                </div>
              </>
            )}
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
