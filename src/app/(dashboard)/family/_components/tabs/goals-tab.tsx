"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Filter, MoreHorizontal, Calendar, TrendingUp, TrendingDown, Flag, Plus, Edit, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { UserAvatar } from "@/components/shared/user-avatar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { GOAL_FILTERS } from "../constants";
import type { SharedGoal } from "../types";

import { AddGoalModal } from "@/app/(dashboard)/goals/_components/add-goal-modal";
import { ContributeGoalModal } from "@/app/(dashboard)/goals/_components/contribute-goal-modal";
import { ViewGoalModal } from "@/app/(dashboard)/goals/_components/view-goal-modal";
import { EditGoalModal } from "@/app/(dashboard)/goals/_components/edit-goal-modal";
import { DeleteGoalModal } from "@/app/(dashboard)/goals/_components/delete-goal-modal";

import type { GoalType } from "@/app/(dashboard)/goals/_components/types";

import { getGoalPermissions, type FamilyRoleFromHook } from "@/app/(dashboard)/goals/_lib/permissions";

interface GoalsTabProps {
  goals: SharedGoal[];
  onFilter: (filter: string) => void;
  activeFilter: string;
  onEditGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => Promise<{ error: string | null }>;
  onAddGoal?: () => void;
  onContributeGoal?: (goalId: string, amount: number) => Promise<{ error: string | null }>;
  onViewGoal?: (goalId: string) => void;
  isLoading?: boolean;
  onRefreshGoals?: () => Promise<void>;
  currentUserRole?: FamilyRoleFromHook;
  isOwner?: boolean;
  currentUserId?: string;
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
  onRefreshGoals,
  currentUserRole,
  isOwner = false,
  currentUserId,
}: GoalsTabProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [isGoalOperationLoading, setIsGoalOperationLoading] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedGoal, setSelectedGoal] = useState<GoalType | SharedGoal | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };

    if (exportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [exportDropdownOpen]);

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

  const convertToGoalType = (sharedGoal: SharedGoal): GoalType => {
    const statusMap: Record<string, "in_progress" | "completed" | "overdue" | "behind"> = {
      "on-track": "in_progress",
      "at-risk": "behind", 
      "completed": "completed",
      "paused": "in_progress"
    };

    return {
      id: sharedGoal.id,
      user_id: "",
      name: sharedGoal.name,
      description: null,
      target: sharedGoal.target,
      current: sharedGoal.saved,
      priority: "medium",
      status: statusMap[sharedGoal.status] || "in_progress",
      category: "general",
      deadline: sharedGoal.targetDate || new Date().toISOString().split('T')[0],
      monthlyContribution: 0,
      isFamily: true,
      is_public: false,
      family_id: null,
      notes: null,
      created_at: sharedGoal.createdAt,
      updated_at: sharedGoal.createdAt,
    };
  };

  const handleAddGoal = async () => {
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

  const handleRefreshGoals = async () => {
    console.log('handleRefreshGoals called');
    if (onRefreshGoals) {
      console.log('Setting loading to true');
      setIsGoalOperationLoading(true);
      try {
        console.log('Calling onRefreshGoals');
        await onRefreshGoals();
        console.log('onRefreshGoals completed');
      } finally {
        console.log('Setting loading to false');
        setIsGoalOperationLoading(false);
      }
    } else {
      console.log('onRefreshGoals is undefined');
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return goal.status === "on-track" || goal.status === "at-risk";
    return goal.status === activeFilter;
  });

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const overallProgressPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  
  const getOverallStatus = () => {
    if (overallProgressPercentage >= 75) return { text: "On Track", variant: "success" as const };
    if (overallProgressPercentage >= 50) return { text: "Good Progress", variant: "warning" as const };
    return { text: "Needs Attention", variant: "danger" as const };
  };
  
  const overallStatus = getOverallStatus();

  const permissions = getGoalPermissions(currentUserRole || 'Viewer', isOwner, undefined, currentUserId);

  if (isLoading || isGoalOperationLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <Skeleton width={120} height={14} className="mb-2 sm:w-[150px] sm:h-4" />
              <Skeleton width={180} height={10} className="sm:w-[250px] sm:h-3" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton width={70} height={28} borderRadius={6} className="flex-1 sm:flex-none sm:w-20 sm:h-8" />
              <Skeleton width={80} height={28} borderRadius={6} className="flex-1 sm:flex-none sm:w-24 sm:h-8" />
            </div>
          </div>

          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
              <div>
                <Skeleton width={140} height={14} className="mb-2 sm:w-[200px] sm:h-4" />
                <Skeleton width={200} height={10} className="sm:w-[300px] sm:h-3" />
              </div>
              <Skeleton width={60} height={18} borderRadius={10} className="sm:w-20 sm:h-5" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton width={60} height={10} className="sm:w-20 sm:h-3" />
                <Skeleton width={120} height={10} className="sm:w-[150px] sm:h-3" />
              </div>
              <Skeleton height={6} borderRadius={4} className="sm:h-2" />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Skeleton width={32} height={32} borderRadius="50%" className="sm:w-10 sm:h-10" />
                    <div>
                      <Skeleton width={100} height={14} className="mb-1 sm:w-[120px] sm:h-4" />
                      <Skeleton width={120} height={10} className="sm:w-[150px] sm:h-3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton width={50} height={16} borderRadius={10} className="sm:w-[70px] sm:h-5" />
                    <Skeleton width={20} height={20} borderRadius={6} className="sm:w-6 sm:h-6" />
                  </div>
                </div>

                <div className="space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between">
                    <Skeleton width={60} height={10} className="sm:w-20 sm:h-3" />
                    <Skeleton width={120} height={10} className="sm:w-[150px] sm:h-3" />
                  </div>
                  <Skeleton height={6} borderRadius={4} className="sm:h-2" />
                  <div className="border border-slate-100 p-2 rounded-lg flex justify-between">
                    <Skeleton width={100} height={8} className="sm:w-[120px] sm:h-3" />
                    <Skeleton width={60} height={8} className="sm:w-20 sm:h-3" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <Skeleton width={80} height={10} className="sm:w-[100px] sm:h-3" />
                    <Skeleton width={40} height={8} className="sm:w-12 sm:h-3" />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Skeleton width={20} height={20} borderRadius="50%" className="sm:w-6 sm:h-6" />
                          <Skeleton width={60} height={8} className="sm:w-20 sm:h-3" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton width={40} height={8} className="sm:w-16 sm:h-3" />
                          <Skeleton width={40} height={8} className="sm:w-12 sm:h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <Skeleton width="50%" height={24} borderRadius={6} className="sm:h-7" />
                  <Skeleton width="50%" height={24} borderRadius={6} className="sm:h-7" />
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
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <Flag className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
            {permissions.canAdd 
              ? "Start by creating your first family savings goal."
              : "No family goals have been created yet."}
          </p>
          {permissions.canAdd && (
            <Button onClick={handleAddGoal} size="sm" className="h-8 sm:h-9">
              <Flag size={14} className="mr-1 sm:w-4 sm:h-4" />
              Create Goal
            </Button>
          )}
          <div className="text-[10px] sm:text-xs text-slate-400 mt-4">
            {permissions.canAdd 
              ? "Set shared financial objectives that your family can work towards together."
              : "Only owners and admins can create family goals."}
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
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Filter className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" size={32} />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Goals</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
          There are no goals with status "{activeFilter}".
        </p>
        <Button variant="outline" onClick={() => onFilter("all")} size="sm" className="h-8 sm:h-9">
          <Filter size={14} className="mr-1 sm:w-4 sm:h-4" />
          Show All Goals
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Family Goals ({filteredGoals.length})
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Track and manage shared family savings objectives</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none" ref={exportDropdownRef}>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto flex items-center gap-1.5 text-xs h-8"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              >
                <Download size={14} className="sm:mr-0.5" />
                <span className="hidden sm:inline">Export</span>
                <MoreHorizontal size={12} className="ml-0.5" />
              </Button>
              {/* Dropdown */}
              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 z-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setExportDropdownOpen(false);
                    }}
                  >
                    <span className="text-rose-500 mr-2">PDF</span> Export as PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setExportDropdownOpen(false);
                    }}
                  >
                    <span className="text-emerald-500 mr-2">CSV</span> Export as CSV
                  </Button>
                </div>
              )}
            </div>
            <div className="relative flex-1 sm:flex-none">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto flex items-center gap-1.5 text-xs h-8"
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
            {permissions.canAdd && (
              <Button size="sm" onClick={handleAddGoal} className="h-8 text-xs flex-shrink-0">
                <Flag size={14} className="mr-1" />
                <span className="hidden sm:inline">Add</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
          </div>
        </div>

        {/* Overall Goal Progress */}
        <Card className="p-4 sm:p-6 hover:shadow-md transition-all group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Overall Family Goal Progress</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Your family has saved {overallProgressPercentage}% of your total goal targets.</p>
            </div>
            <span className={`text-[10px] sm:text-xs ${
              overallStatus.variant === "success" ? "text-emerald-600" :
              overallStatus.variant === "warning" ? "text-amber-600" :
              "text-rose-600"
            }`}>
              {overallStatus.text}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-slate-500 font-medium">Total Progress</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(totalSaved)} / {formatCurrency(totalTarget)} ({overallProgressPercentage}%)
              </span>
            </div>
            <ProgressBar
              value={totalSaved}
              max={totalTarget}
              color={overallStatus.variant === "success" ? "success" : overallStatus.variant === "warning" ? "warning" : "danger"}
              className="h-1.5 sm:h-2"
            />
          </div>
        </Card>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal.saved, goal.target);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const remaining = goal.target - goal.saved;

            return (
              <Card
                key={goal.id}
                className="p-4 sm:p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {goal.creatorAvatar ? (
                      <img
                        src={goal.creatorAvatar}
                        alt={goal.createdBy}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-slate-600 transition-colors group-hover:scale-110">
                        {getGoalIcon(goal.status)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{goal.name}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                        Created by {goal.createdBy} • Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] sm:text-xs ${
                      goal.status === "on-track" ? "text-emerald-600" :
                      goal.status === "at-risk" ? "text-amber-600" :
                      goal.status === "completed" ? "text-blue-600" :
                      "text-slate-600"
                    }`}>
                      {goal.status === "on-track" && "On Track"}
                      {goal.status === "at-risk" && "At Risk"}
                      {goal.status === "completed" && "Completed"}
                      {goal.status === "paused" && "Paused"}
                    </span>
                    {(permissions.canEdit || permissions.canDelete) && (
                      <div className="flex items-center gap-1">
                        {permissions.canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-lg h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        )}
                        {permissions.canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 rounded-lg h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleDeleteGoal(goal)}
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-[10px] sm:text-xs">
                    <span className="text-slate-500 font-medium">Overall Progress</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(goal.saved)} / {formatCurrency(goal.target)} ({Math.round(progress)}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={goal.saved}
                    max={goal.target}
                    color={getProgressColor(goal.status)}
                    className="h-1.5 sm:h-2"
                  />
                  <div className="flex justify-between items-center border border-slate-100 p-1.5 sm:p-2 rounded-lg">
                    <span className="text-[10px] sm:text-xs text-slate-500 truncate mr-2">
                      {daysRemaining !== null
                        ? `${daysRemaining} days remaining until target date`
                        : "No deadline set"
                      }
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-700 shrink-0">
                      {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No date"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h5 className="text-[10px] sm:text-xs font-semibold text-slate-700">Member Contributions</h5>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] sm:text-xs font-medium text-emerald-600 h-6 sm:h-7 px-1.5 sm:px-2"
                      onClick={() => handleViewGoal(goal)}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {goal.contributions.slice(0, 3).map((contribution) => (
                      <div key={contribution.id} className="flex items-center justify-between text-[10px] sm:text-xs">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {contribution.memberId ? (
                            <UserAvatar 
                              user={{ id: contribution.memberId } as any} 
                              size="sm"
                            />
                          ) : contribution.memberAvatar ? (
                            <img
                              src={contribution.memberAvatar}
                              alt={contribution.memberName}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 flex items-center justify-center text-[6px] sm:text-[8px] font-medium text-slate-600">
                              {contribution.memberName.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <span className="text-slate-700 truncate max-w-[80px] sm:max-w-[120px]">{contribution.memberName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-medium text-slate-900">
                            {formatCurrency(contribution.amount)}
                          </span>
                          <span className="text-slate-400 text-[10px] sm:text-xs shrink-0">
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
                          className="text-[10px] sm:text-xs text-emerald-600 h-6 sm:h-7"
                          onClick={() => handleViewGoal(goal)}
                        >
                          +{goal.contributions.length - 3} more contributions
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 border-t border-slate-100">
                  {permissions.canContribute && (
                    <Button
                      size="sm"
                      className="text-xs py-1 px-2 sm:px-3 flex-1 h-7 sm:h-8"
                      onClick={() => handleContributeGoal(goal)}
                      disabled={goal.status === "completed"}
                    >
                      Contribute
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`text-xs h-7 sm:h-8 px-2 ${!permissions.canContribute ? 'flex-1' : ''}`}
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

      <AddGoalModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={async () => {
          setAddModalOpen(false);
          await onRefreshGoals?.();
        }}
        defaultFamilyGoal={true}
      />

      <ContributeGoalModal
        open={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        goal={selectedGoal as GoalType}
        onSuccess={async () => {
          setContributeModalOpen(false);
          await onRefreshGoals?.();
        }}
      />

      <ViewGoalModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        goal={selectedGoal as GoalType}
        onEdit={permissions.canEdit ? () => {
          setViewModalOpen(false);
          if (selectedGoal) {
            handleEditGoal(selectedGoal as SharedGoal);
          }
        } : undefined}
        onDelete={permissions.canDelete ? () => {
          setViewModalOpen(false);
          if (selectedGoal) {
            handleDeleteGoal(selectedGoal as SharedGoal);
          }
        } : undefined}
        onContribute={permissions.canContribute ? () => {
          setViewModalOpen(false);
          if (selectedGoal) {
            handleContributeGoal(selectedGoal as SharedGoal);
          }
        } : undefined}
      />

      <EditGoalModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        goal={selectedGoal as GoalType}
        onSuccess={async () => {
          setEditModalOpen(false);
          await onRefreshGoals?.();
        }}
      />

      <DeleteGoalModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        goal={selectedGoal as GoalType}
        onSuccess={async () => {
          setDeleteModalOpen(false);
          await onRefreshGoals?.();
        }}
        onDelete={onDeleteGoal}
      />
    </>
  );
}
