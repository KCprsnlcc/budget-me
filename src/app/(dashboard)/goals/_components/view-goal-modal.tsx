"use client";

import { useState, useCallback } from "react";
import { useFamily } from "../../family/_lib/use-family";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Edit,
  Plus,
  Trash2,
  Info,
  CheckCircle,
  Globe,
} from "lucide-react";
import { Stepper } from "./stepper";
import type { GoalType } from "./types";
import {
  GOAL_PRIORITIES,
  GOAL_CATEGORIES,
  formatCurrency,
  formatDate,
  getDaysRemaining,
  getGoalProgress
} from "./constants";
import { getGoalPermissions, canEditGoal as canEditGoalFn, canDeleteGoal as canDeleteGoalFn } from "../_lib/permissions";

const STEPS = ["Overview", "Analysis"];

interface ViewGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: GoalType | null;
  onEdit?: (goal: GoalType) => void;
  onContribute?: (goal: GoalType) => void;
  onDelete?: (goal: GoalType) => void;
}

export function ViewGoalModal({
  open,
  onClose,
  goal,
  onEdit,
  onContribute,
  onDelete,
}: ViewGoalModalProps) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { familyData, familyState, currentUserRole, isOwner, members } = useFamily();

  const reset = useCallback(() => {
    setStep(1);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleNext = useCallback(() => {
    if (step >= 2) {
      handleClose();
      return;
    }
    setStep((s) => s + 1);
  }, [step, handleClose]);

  const handleBack = useCallback(() => {
    if (step <= 1) return;
    setStep((s) => s - 1);
  }, [step]);

  const handleEditClick = useCallback(() => {
    if (goal && onEdit) {
      handleClose();
      setTimeout(() => {
        onEdit(goal);
      }, 150);
    }
  }, [goal, onEdit, handleClose]);

  const handleContributeClick = useCallback(() => {
    if (goal && onContribute) {
      handleClose();
      setTimeout(() => {
        onContribute(goal);
      }, 150);
    }
  }, [goal, onContribute, handleClose]);

  const handleDeleteClick = useCallback(() => {
    if (goal && onDelete) {
      handleClose();
      setTimeout(() => {
        onDelete(goal);
      }, 150);
    }
  }, [goal, onDelete, handleClose]);

  if (!goal) return null;

  // Compute permissions for this goal
  const permissions = getGoalPermissions(currentUserRole, isOwner, goal.user_id, user?.id);
  const canEdit = canEditGoalFn(goal, currentUserRole, isOwner, user?.id);
  const canDelete = canDeleteGoalFn(goal, currentUserRole, isOwner, user?.id);

  const progress = getGoalProgress(goal.current, goal.target);
  const remaining = goal.target - goal.current;
  const daysRemaining = getDaysRemaining(goal.deadline);
  const categoryInfo = GOAL_CATEGORIES.find(cat => cat.key === goal.category);
  const priorityInfo = GOAL_PRIORITIES.find(p => p.key === goal.priority);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <h3 className="text-sm font-semibold text-slate-900">{goal.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {step} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-5">
        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={step} />
        {/* STEP 1: Overview */}
        {step === 1 && (
          <div className="space-y-4 animate-txn-in">
            <div className="text-center py-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Progress</div>
              <div className="text-3xl font-bold text-emerald-600">{progress}%</div>
              <div className="text-xs text-emerald-600/80 mt-1 font-medium">
                {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">Goal Progress</span>
                  <span className="font-medium text-slate-900">{progress}%</span>
                </div>
                <ProgressBar value={goal.current} max={goal.target} color="success" className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Status</div>
                  <div className="text-sm font-semibold text-slate-900">
                    <Badge variant={goal.status === "completed" ? "success" : goal.status === "in_progress" ? "info" : "warning"} className="!bg-transparent">
                      {goal.status === "completed" ? "Completed" : goal.status === "in_progress" ? "In Progress" : "Overdue"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Priority</div>
                  <div className="text-sm font-semibold text-slate-900 capitalize">{goal.priority}</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Remaining</div>
                  <div className="text-sm font-semibold text-slate-900">{formatCurrency(remaining)}</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Days Left</div>
                  <div className="text-sm font-semibold text-slate-900">{daysRemaining} days</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-start gap-3">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Goal Performance</div>
                <div className="text-xs opacity-90">
                  You're {progress}% toward your goal with {daysRemaining} days remaining.
                </div>
              </div>
            </div>

            {/* Family Context Section */}
            {goal.isFamily && (
              <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
                <Users size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-emerald-800 mb-1.5">Family Goal</div>
                  <div className="space-y-1">
                    <div className="text-xs text-emerald-700">
                      Family: <span className="font-semibold">{familyData?.name || "Unknown"}</span>
                    </div>
                    <div className="text-xs text-emerald-700">
                      Your Role: <span className="font-semibold capitalize">{isOwner ? "Owner" : (currentUserRole || "N/A")}</span>
                    </div>
                  </div>
                  <div className="text-xs text-emerald-600/80 mt-2">
                    Shared with family members for collaborative tracking and contributions
                  </div>
                </div>
              </div>
            )}

            {/* Public Goal Context */}
            {goal.is_public && !goal.isFamily && (
              <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/50 flex items-start gap-3">
                <Globe size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-800 mb-1">Public Goal</div>
                  <div className="text-xs text-blue-600/80">
                    Visible to the public community for inspiration
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Analysis */}
        {step === 2 && (
          <div className="space-y-4 animate-txn-in">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Goal Analysis & Insights</h4>
              <p className="text-xs text-slate-500">Comprehensive goal performance and projections</p>
            </div>

            {/* Goal Performance Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 mb-2">Goal Utilization</div>
                <div className="flex items-center justify-center h-16">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-3 border-slate-200"></div>
                    <div
                      className="absolute inset-0 w-14 h-14 rounded-full border-3 border-emerald-500 border-t-transparent rotate-45"
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-700">{progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-slate-700">{formatCurrency(remaining)}</div>
                  <div className="text-[9px] text-slate-500">remaining</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 mb-2">Contribution Trend</div>
                <div className="h-16 flex items-end justify-center gap-1">
                  <div className="w-2 bg-slate-300 h-1/2 rounded-t-sm"></div>
                  <div className="w-2 bg-slate-300 h-2/3 rounded-t-sm"></div>
                  <div className="w-2 bg-emerald-500 h-3/4 rounded-t-sm"></div>
                  <div className="w-2 bg-amber-500 h-full rounded-t-sm"></div>
                  <div className="w-2 bg-slate-300 h-2/3 rounded-t-sm"></div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-1">
                    {progress > 80 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(progress - 100)}%
                  </div>
                  <div className="text-[9px] text-slate-500">vs target</div>
                </div>
              </div>
            </div>

            {/* Goal Details */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Goal Name</div>
                <div className="text-sm font-semibold text-slate-900">{goal.name}</div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Category</div>
                <div className="text-sm font-semibold text-slate-900">
                  {categoryInfo?.label || "Other"}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Target Amount</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(goal.target)}</div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Current Progress</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(goal.current)}</div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Monthly Contribution</div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(goal.monthlyContribution)}</div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Deadline</div>
                <div className="text-sm font-semibold text-slate-900">{formatDate(goal.deadline)}</div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Priority</div>
                <div className="text-sm font-semibold text-slate-900 capitalize">{goal.priority}</div>
              </div>

              {(goal.isFamily || goal.is_public) && (
                <div className={`p-4 rounded-lg border ${goal.isFamily ? 'border-emerald-100 text-emerald-700' : 'border-blue-100 text-blue-700'}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.05em] mb-2 text-slate-600">Goal Type</div>
                  <div className="text-sm font-semibold flex items-center gap-2 mb-3">
                    {goal.isFamily ? (
                      <>
                        <Users size={14} className="text-emerald-600" />
                        <span className="text-emerald-700">Family Goal</span>
                      </>
                    ) : (
                      <>
                        <Globe size={14} className="text-blue-600" />
                        <span className="text-blue-700">Public Goal</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs mt-3 pt-2 border-t border-emerald-200/50 opacity-90">
                    {goal.isFamily ? (
                      <>Shared with family members for collaborative tracking and contributions</>
                    ) : (
                      <>Visible to the public community for inspiration</>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Projected Completion */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-3">Projected Completion</h4>
              <div className="p-3 rounded-lg border border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-slate-600">Current Rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{formatCurrency(goal.current)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-slate-600">Target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{formatCurrency(goal.target)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className={cn("transition-all", step === 1 ? "invisible" : "")}
        >
          <ArrowLeft size={14} className="mr-1" />
          Back
        </Button>
        <div className="flex gap-2">
          {/* Action buttons removed per user request */}
        </div>
        <Button
          size="sm"
          onClick={handleNext}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {step === 2 ? "Close" : "View Analysis"}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </ModalFooter>
    </Modal>
  );
}
