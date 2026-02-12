"use client";

import React, { useState } from "react";
import { ShieldCheck, Filter, MoreHorizontal, Calendar, Users, TrendingUp, Target, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GOAL_STATUSES, GOAL_FILTERS } from "../constants";
import type { SharedGoal, GoalContribution } from "../types";

interface GoalsTabProps {
  goals: SharedGoal[];
  onFilter: (filter: string) => void;
  activeFilter: string;
  onEditGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  onAddGoal?: () => void;
  isLoading?: boolean;
}

export function GoalsTab({
  goals,
  onFilter,
  activeFilter,
  onEditGoal,
  onDeleteGoal,
  onAddGoal,
  isLoading = false,
}: GoalsTabProps) {
  const [showFilters, setShowFilters] = useState(false);

  const getGoalIcon = (status: string) => {
    switch (status) {
      case "on-track":
        return <ShieldCheck className="text-emerald-600" size={24} />;
      case "at-risk":
        return <Target className="text-amber-600" size={24} />;
      case "completed":
        return <TrendingUp className="text-blue-600" size={24} />;
      case "paused":
        return <Calendar className="text-slate-600" size={24} />;
      default:
        return <Target className="text-slate-600" size={24} />;
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
        return "secondary";
      default:
        return "outline";
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
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Target className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
        <p className="text-sm text-slate-500 mb-6">
          Start by creating your first family savings goal.
        </p>
        <Button onClick={onAddGoal}>
          <Target size={16} className="mr-2" />
          Create Goal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Family Goals ({filteredGoals.length})
        </h3>
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
                      activeFilter === filter ? "bg-emerald-50 text-emerald-600" : "text-slate-600"
                    }`}
                  >
                    {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" onClick={onAddGoal}>
            <Target size={14} className="mr-1" />
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
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors group-hover:scale-110">
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
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500">
                    {daysRemaining !== null
                      ? `${daysRemaining} days remaining until target date`
                      : "No target date set"}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {formatCurrency(remaining)} left
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
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  <DollarSign size={12} className="mr-1" />
                  Contribute
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
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
    </div>
  );
}
