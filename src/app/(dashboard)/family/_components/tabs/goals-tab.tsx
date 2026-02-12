"use client";

import React, { useState } from "react";
import { ShieldCheck, Filter, MoreHorizontal, Calendar, Users, TrendingUp, TrendingDown, Flag, DollarSign, Eye, Edit, Plus, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { GOAL_STATUSES, GOAL_FILTERS } from "../constants";
import type { SharedGoal, GoalContribution } from "../types";
import { Stepper } from "../stepper";

interface GoalsTabProps {
  goals: SharedGoal[];
  onFilter: (filter: string) => void;
  activeFilter: string;
  onEditGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  onAddGoal?: () => void;
  onContributeGoal?: (goalId: string) => void;
  onViewGoal?: (goalId: string) => void;
  isLoading?: boolean;
}

export function GoalsTab({
  goals,
  onFilter,
  activeFilter,
  onEditGoal,
  onDeleteGoal,
  onAddGoal,
  onContributeGoal,
  onViewGoal,
  isLoading = false,
}: GoalsTabProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SharedGoal | null>(null);
  const [contributeStep, setContributeStep] = useState(1);
  const [contributeAmount, setContributeAmount] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewStep, setViewStep] = useState(1);

  const getGoalIcon = (status: string) => {
    switch (status) {
      case "on-track":
        return <ShieldCheck size={24} />;
      case "at-risk":
        return <Flag size={24} />;
      case "completed":
        return <TrendingUp size={24} />;
      case "paused":
        return <Calendar size={24} />;
      default:
        return <Flag size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "success";
      case "at-risk":
        return "warning";
      case "completed":
        return "info";
      case "paused":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "success";
      case "at-risk":
        return "warning";
      case "completed":
        return "success";
      case "paused":
        return "info";
      default:
        return "brand";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const calculateProgress = (saved: number, target: number) => {
    return Math.min((saved / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleContributeModalClose = () => {
    setContributeModalOpen(false);
    setContributeStep(1);
    setContributeAmount("");
    setSelectedGoal(null);
  };

  const handleContributeNext = () => {
    if (contributeStep >= 2) {
      // TODO: Implement actual contribution logic
      if (selectedGoal && onContributeGoal) {
        onContributeGoal(selectedGoal.id);
      }
      handleContributeModalClose();
      return;
    }
    setContributeStep((s) => s + 1);
  };

  const handleContributeBack = () => {
    if (contributeStep <= 1) return;
    setContributeStep((s) => s - 1);
  };

  const canContinueContribute =
    (contributeStep === 1 && contributeAmount !== "" && parseFloat(contributeAmount) > 0) ||
    contributeStep === 2;

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setViewStep(1);
    setSelectedGoal(null);
  };

  const handleViewNext = () => {
    if (viewStep >= 2) {
      handleViewModalClose();
      return;
    }
    setViewStep((s) => s + 1);
  };

  const handleViewBack = () => {
    if (viewStep <= 1) return;
    setViewStep((s) => s - 1);
  };

  const handleViewDetails = (goal: SharedGoal) => {
    setSelectedGoal(goal);
    setViewModalOpen(true);
  };

  const handleViewToContribute = () => {
    handleViewModalClose();
    setTimeout(() => {
      if (selectedGoal) {
        setContributeModalOpen(true);
      }
    }, 150);
  };

  const filteredGoals = goals.filter(goal => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return goal.status === "on-track" || goal.status === "at-risk";
    return goal.status === activeFilter;
  });

  if (isLoading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 border-t-transparent"></div>
        <span className="ml-2 text-sm text-slate-600">Loading goals...</span>
      </div>
    );
  }

  if (!isLoading && goals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center mx-auto mb-4">
          <Flag className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
        <p className="text-sm text-slate-500 mb-6">
          Start by creating your first family savings goal.
        </p>
        <Button onClick={onAddGoal}>
          <Flag size={16} className="mr-2" />
          Create Goal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Family Goals ({filteredGoals.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-light">Track and manage shared family savings objectives</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs"
            >
              <Filter size={14} />
              <span>
                {activeFilter === "all" ? "All" : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </span>
            </Button>
            {showFilters && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10 min-w-[120px]">
                {Object.values(GOAL_FILTERS).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      onFilter(filter);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-slate-50 transition-colors ${
                      activeFilter === filter ? "border-emerald-100 text-emerald-600" : "text-slate-600"
                    }`}
                  >
                    {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" onClick={onAddGoal}>
            <Flag size={14} className="mr-1" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const progress = calculateProgress(goal.saved, goal.target);
          const daysRemaining = getDaysRemaining(goal.targetDate);
          const remaining = goal.target - goal.saved;

          return (
            <Card
              key={goal.id}
              className="p-6 hover:shadow-md transition-all group"
            >
              {/* Goal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center text-slate-600 transition-colors group-hover:scale-110">
                    {getGoalIcon(goal.status)}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{goal.name}</h4>
                    <p className="text-[10px] text-slate-500">
                      Created by {goal.createdBy} • Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No date"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(goal.status) + " px-2.5 py-1"}>
                    {goal.status === "on-track" && "On Track"}
                    {goal.status === "at-risk" && "At Risk"}
                    {goal.status === "completed" && "Completed"}
                    {goal.status === "paused" && "Paused"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    <MoreHorizontal size={18} />
                  </Button>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Overall Progress</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(goal.saved)} / {formatCurrency(goal.target)} ({Math.round(progress)}%)
                  </span>
                </div>
                <ProgressBar
                  value={goal.saved}
                  max={goal.target}
                  color={getProgressColor(goal.status)}
                  className="h-2"
                />
                <div className="flex justify-between items-center border border-slate-100 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500">
                    {daysRemaining !== null
                      ? `${daysRemaining} days remaining until target date`
                      : "No deadline set"
                  }
                  </span>
                  <span className="text-[10px] font-medium text-slate-700">
                    {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No date"}
                  </span>
                </div>
              </div>

              {/* Member Contributions */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xs font-semibold text-slate-700">Member Contributions</h5>
                  <Button variant="ghost" size="sm" className="text-[10px] font-medium text-emerald-600 hover:underline">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {goal.contributions.slice(0, 3).map((contribution) => (
                    <div key={contribution.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-600">
                          {contribution.memberName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-slate-700">{contribution.memberName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {formatCurrency(contribution.amount)}
                        </span>
                        <span className="text-slate-400">
                          {new Date(contribution.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {goal.contributions.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" className="text-[10px] text-emerald-600 hover:underline">
                        +{goal.contributions.length - 3} more contributions
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button
                  size="sm"
                  className="text-xs py-1 px-2 flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGoal(goal);
                    setContributeModalOpen(true);
                  }}
                >
                  Contribute
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleViewDetails(goal)}>
                  View Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredGoals.length === 0 && goals.length > 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Filter className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Found</h3>
          <p className="text-sm text-slate-500 mb-6">
            No goals match the current filter: "{activeFilter}"
          </p>
          <Button variant="outline" onClick={() => onFilter("all")}>
            Clear Filter
          </Button>
        </div>
      )}
      {/* Contribute Goal Modal */}
      {selectedGoal && (
        <Modal open={contributeModalOpen} onClose={handleContributeModalClose} className="max-w-[520px]">
          {/* Header */}
          <ModalHeader onClose={handleContributeModalClose} className="px-5 py-3.5">
            <h3 className="text-sm font-semibold text-slate-900">Contribute to Goal</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Step {contributeStep} of 2
              </span>
            </div>
          </ModalHeader>

          {/* Stepper */}
          <Stepper 
            currentStep={contributeStep} 
            totalSteps={2} 
            labels={["Amount", "Review"]} 
          />

          {/* Body */}
          <ModalBody className="px-5 py-5">
            {/* STEP 1: Amount Selection */}
            {contributeStep === 1 && (
              <div className="space-y-4 animate-txn-in">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Contribution Amount</h4>
                  <p className="text-xs text-slate-500">How much would you like to contribute to {selectedGoal.name}?</p>
                </div>

                {/* Goal Summary */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">{selectedGoal.name}</h4>
                    <p className="text-xs text-slate-500">{Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target))}% complete</p>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Progress:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(selectedGoal.saved)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(selectedGoal.target)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Remaining:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(selectedGoal.target - selectedGoal.saved)}</span>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Contribution Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
                    <input
                      type="number"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      className="w-full pl-7 pr-4 py-3 text-lg font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                      placeholder="0.00"
                      min="0"
                      max={(selectedGoal.target - selectedGoal.saved).toString()}
                      step="0.01"
                    />
                  </div>
                  {parseFloat(contributeAmount) > (selectedGoal.target - selectedGoal.saved) && (
                    <p className="text-xs text-amber-600 mt-1">
                      Amount exceeds remaining goal target
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Quick amounts:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 100, 500].map((quickAmount, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setContributeAmount(quickAmount.toString())}
                        className="p-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all"
                      >
                        ₱{quickAmount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {contributeStep === 2 && (
              <div className="space-y-4 animate-txn-in">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Review Contribution</h4>
                  <p className="text-xs text-slate-500">Confirm your contribution details</p>
                </div>

                {/* Contribution Summary */}
                <div className="text-center py-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Contribution Amount</div>
                  <div className="text-3xl font-bold text-emerald-600">{formatCurrency(parseFloat(contributeAmount) || 0)}</div>
                  <div className="text-xs text-emerald-600/80 mt-1 font-medium">to {selectedGoal.name}</div>
                </div>

                {/* Progress Impact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Current Progress</div>
                    <div className="text-sm font-semibold text-slate-900">{Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target))}%</div>
                    <div className="text-xs text-slate-500">{formatCurrency(selectedGoal.saved)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-[0.05em] mb-2">New Progress</div>
                    <div className="text-sm font-semibold text-emerald-600">{Math.round(calculateProgress(selectedGoal.saved + (parseFloat(contributeAmount) || 0), selectedGoal.target))}%</div>
                    <div className="text-xs text-emerald-500">{formatCurrency(selectedGoal.saved + (parseFloat(contributeAmount) || 0))}</div>
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
              onClick={handleContributeBack}
              className={`transition-all ${contributeStep === 1 ? "invisible" : ""}`}
            >
              Back
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              onClick={handleContributeNext}
              disabled={!canContinueContribute}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {contributeStep === 2 ? "Contribute" : "Continue"}
            </Button>
          </ModalFooter>
        </Modal>
      )}
      {/* View Details Modal */}
      {selectedGoal && (
        <Modal open={viewModalOpen} onClose={handleViewModalClose} className="max-w-[520px]">
          {/* Header */}
          <ModalHeader onClose={handleViewModalClose} className="px-5 py-3.5">
            <h3 className="text-sm font-semibold text-slate-900">{selectedGoal.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Step {viewStep} of 2
              </span>
            </div>
          </ModalHeader>

          {/* Stepper */}
          <Stepper 
            currentStep={viewStep} 
            totalSteps={2} 
            labels={["Overview", "Analysis"]} 
          />

          {/* Body */}
          <ModalBody className="px-5 py-5">
            {/* STEP 1: Overview */}
            {viewStep === 1 && (
              <div className="space-y-4 animate-txn-in">
                <div className="text-center py-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Progress</div>
                  <div className="text-3xl font-bold text-emerald-600">{Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target))}%</div>
                  <div className="text-xs text-emerald-600/80 mt-1 font-medium">
                    {formatCurrency(selectedGoal.saved)} of {formatCurrency(selectedGoal.target)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-500">Goal Progress</span>
                      <span className="font-medium text-slate-900">{Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target))}%</span>
                    </div>
                    <ProgressBar value={selectedGoal.saved} max={selectedGoal.target} color="success" className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Status</div>
                      <div className="text-sm font-semibold text-slate-900">
                        <Badge variant={getStatusColor(selectedGoal.status)}>
                          {selectedGoal.status === "on-track" && "On Track"}
                          {selectedGoal.status === "at-risk" && "At Risk"}
                          {selectedGoal.status === "completed" && "Completed"}
                          {selectedGoal.status === "paused" && "Paused"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Members</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedGoal.members} members</div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Remaining</div>
                      <div className="text-sm font-semibold text-slate-900">{formatCurrency(selectedGoal.target - selectedGoal.saved)}</div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Days Left</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {getDaysRemaining(selectedGoal.targetDate) || "No deadline"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-start gap-3">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Goal Performance</div>
                    <div className="text-xs opacity-90">
                      You're {Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target))}% toward your goal with {getDaysRemaining(selectedGoal.targetDate) || "no deadline"} remaining.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Analysis */}
            {viewStep === 2 && (
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
                          <span className="text-xs font-bold text-slate-700">{Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target))}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-xs font-semibold text-slate-700">{formatCurrency(selectedGoal.target - selectedGoal.saved)}</div>
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
                        {calculateProgress(selectedGoal.saved, selectedGoal.target) > 80 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(100 - Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target)))}%
                      </div>
                      <div className="text-[9px] text-slate-500">vs target</div>
                    </div>
                  </div>
                </div>

                {/* Goal Details */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Goal Name</div>
                    <div className="text-sm font-semibold text-slate-900">{selectedGoal.name}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Created By</div>
                    <div className="text-sm font-semibold text-slate-900">{selectedGoal.createdBy}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Target Amount</div>
                    <div className="text-sm font-semibold text-slate-900">{formatCurrency(selectedGoal.target)}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Current Progress</div>
                    <div className="text-sm font-semibold text-slate-900">{formatCurrency(selectedGoal.saved)}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Target Date</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedGoal.targetDate ? new Date(selectedGoal.targetDate).toLocaleDateString() : "No deadline"}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.05em] mb-2">Status</div>
                    <div className="text-sm font-semibold text-slate-900 capitalize">{selectedGoal.status}</div>
                  </div>
                </div>

                {/* Member Contributions Summary */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-3">Member Contributions</h4>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs text-slate-600">Total Contributions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.round(calculateProgress(selectedGoal.saved, selectedGoal.target))}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{formatCurrency(selectedGoal.saved)}</span>
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
                          <span className="text-xs font-semibold text-slate-700">{formatCurrency(selectedGoal.target)}</span>
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
              onClick={handleViewBack}
              className={`transition-all ${viewStep === 1 ? "invisible" : ""}`}
            >
              <ArrowLeft size={14} className="mr-1" />
              Back
            </Button>
            <div className="flex gap-2">
              {onContributeGoal && selectedGoal.status !== "completed" && (
                <Button variant="outline" size="sm" onClick={handleViewToContribute}>
                  <Plus size={14} className="mr-1" />
                  Contribute
                </Button>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleViewNext}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {viewStep === 2 ? "Close" : "View Analysis"}
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
