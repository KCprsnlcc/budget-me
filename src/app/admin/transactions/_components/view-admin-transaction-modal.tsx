"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  CreditCard,
  Tag,
  FileText,
  Clock,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { Stepper } from "./stepper";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { AdminTransaction } from "../_lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const STEPS = ["Overview", "Analysis"];

interface ViewAdminTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: AdminTransaction | null;
}

export function ViewAdminTransactionModal({
  open,
  onClose,
  transaction,
}: ViewAdminTransactionModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const createMockUser = (transaction: AdminTransaction): SupabaseUser => {
    return {
      id: transaction.user_id,
      email: transaction.user_email || "",
      user_metadata: {
        full_name: transaction.user_name,
        avatar_url: transaction.user_avatar,
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: transaction.created_at,
    } as SupabaseUser;
  };

  if (!transaction) return null;

  const isIncome = transaction.type === "income" || transaction.type === "cash_in";
  const absAmount = transaction.amount.toFixed(2);
  const catName = transaction.category_name ?? (transaction.type === "contribution" ? "Contribution" : transaction.type);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Transaction Details
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 2
          </span>
        </div>
      </ModalHeader>

      {}
      <Stepper steps={STEPS} currentStep={step} />

      {}
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {}
            <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
              <div className="flex justify-center mb-3">
                <UserAvatar 
                  user={createMockUser(transaction)} 
                  size="xl"
                  className="ring-2 ring-white shadow-sm"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{transaction.user_name || "No Name"}</h3>
              <p className="text-sm text-slate-500 mb-3">{transaction.user_email || "Unknown User"}</p>
              <div
                className={`text-[32px] font-bold my-2 ${
                  isIncome ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isIncome ? "+" : "-"}₱{absAmount}
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs font-medium text-slate-600">
                  {isIncome ? "Income" : "Expense"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-600">
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
            </div>

            {}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Transaction Information</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow 
                    label="Date" 
                    value={format(new Date(transaction.date + "T00:00:00"), "MMM dd, yyyy")} 
                    icon={Calendar} 
                  />
                  <DetailRow 
                    label="Category" 
                    value={catName}
                    icon={Tag} 
                  />
                  <DetailRow 
                    label="Account" 
                    value={transaction.account_name ? `${transaction.account_name}${transaction.account_number_masked ? ` ${transaction.account_number_masked}` : ""}` : "—"} 
                    icon={CreditCard} 
                  />
                  <DetailRow 
                    label="Description" 
                    value={transaction.description || "—"} 
                    icon={FileText} 
                  />
                  {transaction.notes && (
                    <DetailRow 
                      label="Notes" 
                      value={transaction.notes} 
                      icon={FileText} 
                    />
                  )}
                </div>
              </div>
            </div>

            {}
            <div>
              <h4 className="text-[11px] font-semibold text-slate-700 mb-3 uppercase tracking-[0.04em]">Transaction Status</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <DetailRow 
                    label="Status" 
                    value={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    icon={Clock} 
                  />
                  <DetailRow 
                    label="Recurring" 
                    value={transaction.is_recurring ? "Yes" : "No"}
                    icon={TrendingUp} 
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
                    value={transaction.user_email || "Unknown"} 
                    icon={User} 
                  />
                  <DetailRow 
                    label="Name" 
                    value={transaction.user_name || "—"} 
                    icon={User} 
                  />
                  <DetailRow 
                    label="User ID" 
                    value={transaction.user_id} 
                    icon={User} 
                  />
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                Transaction Metadata
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                      <Clock size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Created</div>
                      <div className="text-[10px] text-slate-400">
                        {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' h:mm a")}
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
                      <div className="text-sm font-semibold text-slate-900">Last Updated</div>
                      <div className="text-[10px] text-slate-400">
                        {format(new Date(transaction.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F9FAFB]/50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 bg-white">
                      <DollarSign size={16} className={isIncome ? "text-emerald-600" : "text-red-600"} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Transaction Type</div>
                      <div className="text-[10px] text-slate-400">
                        {isIncome ? "Income transaction" : "Expense transaction"}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {isIncome ? "Income" : "Expense"}
                  </span>
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                Transaction ID
              </h3>
              <div className="bg-[#F9FAFB]/50 rounded-lg p-4 border border-slate-100">
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono break-all">
                  {transaction.id}
                </p>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      {}
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
