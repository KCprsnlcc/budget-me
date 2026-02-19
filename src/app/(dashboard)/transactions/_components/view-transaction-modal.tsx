"use client";

import { useState, useCallback, useEffect } from "react";
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
  Edit,
  Loader2,
  FileText,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { TransactionType } from "./types";
import { useAuth } from "@/components/auth/auth-context";
import { fetchSimilarTransactions, fetchCategoryStats } from "../_lib/transaction-service";

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
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Analysis data
  const [similar, setSimilar] = useState<{ description: string | null; date: string; amount: number; category_icon?: React.ComponentType<any> }[]>([]);
  const [stats, setStats] = useState<{ average: number; monthlyTotal: number; count: number } | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const reset = useCallback(() => {
    setStep(1);
    setSimilar([]);
    setStats(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Fetch analysis data when moving to step 2
  useEffect(() => {
    if (step !== 2 || !transaction || !user) return;
    const catId = transaction.expense_category_id ?? transaction.income_category_id;
    const now = new Date();
    setLoadingAnalysis(true);
    Promise.all([
      fetchSimilarTransactions(user.id, catId, transaction.type, transaction.id, 3),
      fetchCategoryStats(user.id, catId, transaction.type, now.getMonth() + 1, now.getFullYear()),
    ]).then(([sim, st]) => {
      setSimilar(sim);
      setStats(st);
    }).finally(() => setLoadingAnalysis(false));
  }, [step, transaction, user]);

  if (!transaction) return null;

  const isIncome = transaction.type === "income" || transaction.type === "cash_in";
  const absAmount = transaction.amount.toFixed(2);
  const catName = transaction.category_name ?? transaction.type;

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
                {isIncome ? "+" : "-"}₱{absAmount}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase tracking-wider inline-block mt-2">
                {isIncome ? "Income" : "Expense"}
              </span>
            </div>

            {/* Transaction Details */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 space-y-0 divide-y divide-slate-100">
                <DetailRow label="Date" value={new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
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
            {loadingAnalysis ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-emerald-500" />
                <span className="ml-2 text-sm text-slate-500">Loading insights...</span>
              </div>
            ) : (
              <>
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
                      <div className="text-lg font-bold text-slate-900">
                        ₱{stats?.average.toFixed(2) ?? "0.00"}
                      </div>
                      {stats && stats.average > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          This transaction is{" "}
                          <span className={transaction.amount > stats.average ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                            {transaction.amount > stats.average
                              ? `${(((transaction.amount - stats.average) / stats.average) * 100).toFixed(0)}% above`
                              : `${(((stats.average - transaction.amount) / stats.average) * 100).toFixed(0)}% below`} avg
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                        Monthly Total
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        ₱{stats?.monthlyTotal.toFixed(2) ?? "0.00"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        <span className="text-emerald-600 font-semibold">{stats?.count ?? 0} transactions</span> this month
                      </div>
                    </div>
                  </div>
                </div>

                {/* Similar Transactions */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-3">
                    Similar Transactions
                  </h3>
                  {similar.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No similar transactions found.</p>
                  ) : (
                    <div className="space-y-2">
                      {similar.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border border-slate-100">
                              {item.category_icon ? <item.category_icon size={16} /> : <FileText size={16} />}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{item.description ?? "\u2014"}</div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-slate-900">₱{item.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
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
