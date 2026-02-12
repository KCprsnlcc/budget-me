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
  ShoppingCart,
  Edit,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { TransactionType } from "./types";

const STEPS = ["Overview", "Analysis"];

interface ViewTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionType | null;
  onEdit?: (tx: TransactionType) => void;
}

export function ViewTransactionModal({
  open,
  onClose,
  transaction,
  onEdit,
}: ViewTransactionModalProps) {
  const [step, setStep] = useState(1);

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  if (!transaction) return null;

  const isIncome = transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount).toFixed(2);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Transaction Details
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} />

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-6 animate-txn-in">
            {/* Amount Display */}
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Transaction Amount
              </div>
              <div
                className={`text-[32px] font-bold my-2 ${
                  isIncome ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {isIncome ? "+" : "-"}${absAmount}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase tracking-wider inline-block mt-2">
                {isIncome ? "Income" : "Expense"}
              </span>
            </div>

            {/* Transaction Details */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 space-y-0 divide-y divide-slate-100">
                <DetailRow label="Date & Time" value={transaction.date} />
                <DetailRow label="Account" value={transaction.account || "—"} />
                <DetailRow label="Category">
                  <Badge variant="success">{transaction.category}</Badge>
                </DetailRow>
                <DetailRow label="Status">
                  <Badge variant={transaction.status === "completed" ? "success" : "warning"}>
                    {transaction.status}
                  </Badge>
                </DetailRow>
                <DetailRow label="Description" value={transaction.name} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    handleClose();
                    onEdit(transaction);
                  }}
                >
                  <Edit size={14} /> Edit Transaction
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Analysis */}
        {step === 2 && (
          <div className="space-y-6 animate-txn-in">
            {/* Spending Insights */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                Spending Insights
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Category Avg
                  </div>
                  <div className="text-lg font-bold text-slate-900">$72.50</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    This transaction is{" "}
                    <span className={isIncome ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                      {isIncome ? "above" : "19% above"} avg
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Monthly Total
                  </div>
                  <div className="text-lg font-bold text-slate-900">$342.80</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    <span className="text-emerald-600 font-semibold">4 transactions</span> this month
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Transactions */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                Similar Transactions
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Whole Foods", date: "Oct 18, 2023", amount: "-$124.00" },
                  { name: "Trader Joe's", date: "Oct 15, 2023", amount: "-$45.50" },
                  { name: "Whole Foods", date: "Oct 8, 2023", amount: "-$67.89" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                        <ShoppingCart size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.date}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{item.amount}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-3">Monthly Trend</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                  <span>October</span>
                  <span>+$323.81 vs avg</span>
                </div>
                <div className="h-16 flex items-end justify-between gap-1">
                  {[75, 50, 66, 100, 60, 33].map((h, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-t-sm ${i === 3 ? "bg-emerald-500" : "bg-slate-300"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
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
            <>View Analysis <ArrowRight size={14} /></>
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
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
        {label}
      </span>
      {children ?? (
        <span className="text-[13px] font-semibold text-slate-700">{value}</span>
      )}
    </div>
  );
}
