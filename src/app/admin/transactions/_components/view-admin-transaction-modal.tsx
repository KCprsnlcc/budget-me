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
} from "lucide-react";
import { Stepper } from "./stepper";
import type { AdminTransaction } from "../_lib/types";

const STEPS = ["Overview", "User Info"];

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

  if (!transaction) return null;

  const isIncome = transaction.type === "income" || transaction.type === "cash_in";
  const absAmount = transaction.amount.toFixed(2);
  const catName = transaction.category_name ?? transaction.type;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Transaction Details
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
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
            {/* Amount Display */}
            <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Transaction Amount
              </div>
              <div
                className={`text-[32px] font-bold my-2 ${
                  isIncome ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isIncome ? "+" : "-"}₱{absAmount}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-white text-gray-500 uppercase tracking-wider inline-block mt-2 border border-gray-100">
                {isIncome ? "Income" : "Expense"}
              </span>
            </div>

            {/* Transaction Details */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 space-y-0 divide-y divide-gray-100">
                <DetailRow label="Date" value={new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                <DetailRow label="User" value={transaction.user_email ?? "Unknown User"} />
                <DetailRow label="Account" value={transaction.account_name ? `${transaction.account_name}${transaction.account_number_masked ? ` ${transaction.account_number_masked}` : ""}` : "\u2014"} />
                <DetailRow label="Category">
                  <Badge variant={isIncome ? "info" : "success"}>{catName}</Badge>
                </DetailRow>
                <DetailRow label="Status">
                  <Badge variant={transaction.status === "completed" ? "success" : "warning"}>
                    {transaction.status}
                  </Badge>
                </DetailRow>
                <DetailRow label="Description" value={transaction.description ?? "\u2014"} />
                {transaction.notes && (
                  <DetailRow label="Notes" value={transaction.notes} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: User Info */}
        {step === 2 && (
          <div className="space-y-6 animate-txn-in">
            {/* User Information */}
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-3">
                User Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-gray-100">
                  {transaction.user_avatar && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Avatar</span>
                      <img 
                        src={transaction.user_avatar} 
                        alt={transaction.user_name || transaction.user_email || "User"} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                      />
                    </div>
                  )}
                  <DetailRow label="Email" value={transaction.user_email ?? "Unknown"} />
                  <DetailRow label="Name" value={transaction.user_name ?? "—"} />
                  <DetailRow label="User ID" value={transaction.user_id} />
                </div>
              </div>
            </div>

            {/* Transaction Metadata */}
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-3">
                Transaction Metadata
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-gray-100">
                  <DetailRow label="Transaction ID" value={transaction.id} />
                  <DetailRow label="Created At" value={new Date(transaction.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                  <DetailRow label="Updated At" value={new Date(transaction.updated_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                  <DetailRow label="Recurring">
                    <Badge variant={transaction.is_recurring ? "info" : "neutral"}>
                      {transaction.is_recurring ? "Yes" : "No"}
                    </Badge>
                  </DetailRow>
                </div>
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
            <>View User Info <ArrowRight size={14} /></>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
        {label}
      </span>
      {children ?? (
        <span className="text-[13px] font-semibold text-gray-700">{value}</span>
      )}
    </div>
  );
}
