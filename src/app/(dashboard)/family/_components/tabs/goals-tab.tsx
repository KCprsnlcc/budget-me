"use client";

import React, { useState } from "react";
import { ShieldCheck, Filter, MoreHorizontal, Calendar, TrendingUp, TrendingDown, Flag, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { UserAvatar } from "@/components/shared/user-avatar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { GOAL_FILTERS } from "../constants";
import type { SharedGoal } from "../types";

// Import the consistent goal modals
import { AddGoalModal } from "@/app/(dashboard)/goals/_components/add-goal-modal";
import { ContributeGoalModal } from "@/app/(dashboard)/goals/_components/contribute-goal-modal";
import { ViewGoalModal } from "@/app/(dashboard)/goals/_components/view-goal-modal";
import { EditGoalModal } from "@/app/(dashboard)/goals/_components/edit-goal-modal";
import { DeleteGoalModal } from "@/app/(dashboard)/goals/_components/delete-goal-modal";

// Import types for the modals
import type { GoalType } from "@/app/(dashboard)/goals/_components/types";

interface GoalsTabProps {
  goals: SharedGoal[];
  onFilter: (filter: string) => void;
  activeFilter: string;
  onEditGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  onAddGoal?: () => void;
  onContributeGoal?: (goalId: string, amount: number) => void;
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
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedGoal, setSelectedGoal] = useState<GoalType | SharedGoal | null>(null);

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

  // Convert SharedGoal to GoalType for modals
  const convertToGoalType = (sharedGoal: SharedGoal): GoalType => {
    // Map SharedGoal status to GoalStatus
    const statusMap: Record<string, "in_progress" | "completed" | "overdue" | "behind"> = {
      "on-track": "in_progress",
      "at-risk": "behind", 
      "completed": "completed",
      "paused": "in_progress"
    };

    return {
      id: sharedGoal.id,
      user_id: "", // We don't have the creator ID in SharedGoal, but it's not needed for the modals
      name: sharedGoal.name,
      description: null, // Default description since not in SharedGoal
      target: sharedGoal.target,
      current: sharedGoal.saved,
      priority: "medium", // Default priority since not in SharedGoal
      status: statusMap[sharedGoal.status] || "in_progress",
      category: "general", // Default category since not in SharedGoal
      deadline: sharedGoal.targetDate || new Date().toISOString().split('T')[0],
      monthlyContribution: 0, // Default since not in SharedGoal
      isFamily: true, // These are family goals
      is_public: false, // Default since not in SharedGoal
      family_id: null, // Not available in SharedGoal but not critical
      notes: null, // Default since not in SharedGoal
      created_at: sharedGoal.createdAt,
      updated_at: sharedGoal.createdAt, // Use createdAt as fallback
    };
  };

  // Modal handlers
  const handleAddGoal = () => {
    setAddModalOpen(true);
  };

  const handleContributeGoal = (goal: SharedGoal) => {
    setSelectedGoal(convertToGoalType(goal));
    setContributeModalOpen(true);
  };

  const handleViewGoal = (goal: SharedGoal) => {
    setSelectedGoal(convertToGoalType(goal));
    setViewModalOpen(true);
  };

  const handleEditGoal = (goal: SharedGoal) => {
    setSelectedGoal(convertToGoalType(goal));
    setEditModalOpen(true);
  };

  const handleDeleteGoal = (goal: SharedGoal) => {
    setSelectedGoal(convertToGoalType(goal));
    setDeleteModalOpen(true);
  };

  const filteredGoals = goals.filter(goal => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return goal.status === "on-track" || goal.status === "at-risk";
    return goal.status === activeFilter;
  });

  // Calculate overall family goals progress
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const overallProgressPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  
  // Determine overall status based on progress percentage
  const getOverallStatus = () => {
    if (overallProgressPercentage >= 75) return { text: "On Track", variant: "success" as const };
    if (overallProgressPercentage >= 50) return { text: "Good Progress", variant: "warning" as const };
    return { text: "Needs Attention", variant: "danger" as const };
  };
  
  const overallStatus = getOverallStatus();

  if (isLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton width={150} height={16} className="mb-2" />
              <Skeleton width={250} height={12} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width={80} height={32} borderRadius={6} />
              <Skeleton width={90} height={32} borderRadius={6} />
            </div>
          </div>

          {/* Goals Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                {/* Goal Header Skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton width={40} height={40} borderRadius="50%" />
                    <div>
                      <Skeleton width={120} height={16} className="mb-1" />
                      <Skeleton width={150} height={10} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton width={70} height={20} borderRadius={10} />
                    <Skeleton width={24} height={24} borderRadius={6} />
                  </div>
                </div>

                {/* Progress Section Skeleton */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <Skeleton width={80} height={12} />
                    <Skeleton width={150} height={12} />
                  </div>
                  <Skeleton height={8} borderRadius={4} />
                  <div className="border border-slate-100 p-2 rounded-lg flex justify-between">
                    <Skeleton width={120} height={10} />
                    <Skeleton width={80} height={10} />
                  </div>
                </div>

                {/* Member Contributions Skeleton */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton width={100} height={12} />
                    <Skeleton width={50} height={10} />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Skeleton width={24} height={24} borderRadius="50%" />
                          <Skeleton width={80} height={10} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton width={60} height={10} />
                          <Skeleton width={50} height={10} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Skeleton */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Skeleton width="50%" height={28} borderRadius={6} />
                  <Skeleton width="50%" height={28} borderRadius={6} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!isLoading && goals.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <Flag className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
          <p className="text-sm text-slate-500 mb-6">
            Start by creating your first family savings goal.
          </p>
          <Button onClick={handleAddGoal}>
            <Flag size={16} className="mr-2" />
            Create Goal
          </Button>
          <div className="text-xs text-slate-400 mt-4">
            Set shared financial objectives that your family can work towards together.
          </div>
        </div>

        {/* Add Goal Modal */}
        <AddGoalModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false);
            onAddGoal?.();
          }}
        />
      </>
    );
  }

  if (!isLoading && filteredGoals.length === 0 && goals.length > 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Filter className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Goals</h3>
        <p className="text-sm text-slate-500 mb-6">
          There are no goals with status "{activeFilter}".
        </p>
        <Button variant="outline" onClick={() => onFilter("all")}>
          <Filter size={14} className="mr-2" />
          Show All Goals
        </Button>
      </div>
    );
  }

  return (
    <>
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
                      className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-slate-50 transition-colors ${activeFilter === filter ? "border-emerald-100 text-emerald-600" : "text-slate-600"
                        }`}
                    >
                      {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button size="sm" onClick={handleAddGoal}>
              <Flag size={14} className="mr-1" />
              Add Goal
            </Button>
          </div>
        </div>

        {/* Overall Goal Progress */}
        <Card className="p-6 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Overall Family Goal Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your family has saved {overallProgressPercentage}% of your total goal targets.</p>
            </div>
            <Badge variant={overallStatus.variant}>
              {overallStatus.text}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Total Progress</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(totalSaved)} / {formatCurrency(totalTarget)} ({overallProgressPercentage}%)
              </span>
            </div>
            <ProgressBar
              value={totalSaved}
              max={totalTarget}
              color={overallStatus.variant === "success" ? "success" : overallStatus.variant === "warning" ? "warning" : "danger"}
              className="h-2"
            />
          </div>
        </Card>

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
                    {/* Creator avatar - use existing creatorAvatar if available, otherwise show goal icon */}
                    {goal.creatorAvatar ? (
                      <img
                        src={goal.creatorAvatar}
                        alt={goal.createdBy}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-slate-600 transition-colors group-hover:scale-110">
                        {getGoalIcon(goal.status)}
                      </div>
                    )}
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={() => handleDeleteGoal(goal)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
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

                {/* Member Contributions with Avatar Fetching */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-semibold text-slate-700">Member Contributions</h5>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] font-medium text-emerald-600 hover:underline"
                      onClick={() => handleViewGoal(goal)}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {goal.contributions.slice(0, 3).map((contribution) => (
                      <div key={contribution.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {/* Avatar fetching for contributors */}
                          {contribution.memberId ? (
                            <UserAvatar 
                              user={{ id: contribution.memberId } as any} 
                              size="sm"
                            />
                          ) : contribution.memberAvatar ? (
                            <img
                              src={contribution.memberAvatar}
                              alt={contribution.memberName}
                              className="w-6 h-6 rounded-full object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-medium text-slate-600">
                              {contribution.memberName.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[10px] text-emerald-600 hover:underline"
                          onClick={() => handleViewGoal(goal)}
                        >
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
                    onClick={() => handleContributeGoal(goal)}
                    disabled={goal.status === "completed"}
                  >
                    Contribute
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => handleViewGoal(goal)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Consistent Goal Modals */}
      <AddGoalModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          onAddGoal?.();
        }}
      />

      <ContributeGoalModal
        open={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        goal={selectedGoal as GoalType}
        onSuccess={() => {
          setContributeModalOpen(false);
          if (selectedGoal && onContributeGoal) {
            // This will be handled by the modal itself
          }
        }}
      />

      <ViewGoalModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        goal={selectedGoal as GoalType}
        onEdit={() => {
          setViewModalOpen(false);
          if (selectedGoal) {
            handleEditGoal(selectedGoal as SharedGoal);
          }
        }}
        onDelete={() => {
          setViewModalOpen(false);
          if (selectedGoal) {
            handleDeleteGoal(selectedGoal as SharedGoal);
          }
        }}
        onContribute={() => {
          setViewModalOpen(false);
          if (selectedGoal) {
            handleContributeGoal(selectedGoal as SharedGoal);
          }
        }}
      />

      <EditGoalModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        goal={selectedGoal as GoalType}
        onSuccess={() => {
          setEditModalOpen(false);
          onEditGoal?.(selectedGoal?.id || "");
        }}
      />

      <DeleteGoalModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        goal={selectedGoal as GoalType}
        onSuccess={() => {
          setDeleteModalOpen(false);
          onDeleteGoal?.(selectedGoal?.id || "");
        }}
      />
    </>
  );
}
