"use client";

import React, { useState } from "react";
import { Wallet, Flag, UserPlus, Filter, MoreHorizontal, Clock, ChevronDown, Search, RotateCcw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACTIVITY_TYPES, ACTIVITY_FILTERS, ACTIVITY_ICONS } from "../constants";
import type { ActivityItem } from "../types";

interface ActivityTabProps {
  activities: ActivityItem[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  loading?: boolean;
}

export function ActivityTab({
  activities,
  onLoadMore,
  hasMore,
  isLoading,
  loading = false,
}: ActivityTabProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <Wallet size={20} />;
      case "goal":
        return <Flag size={20} />;
      case "member":
        return <UserPlus size={20} />;
      case "budget":
        return <Filter size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "transaction":
        return "info";
      case "goal":
        return "success";
      case "member":
        return "secondary";
      case "budget":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (activeFilter === "all") return true;
    return activity.type === activeFilter;
  });

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-emerald-500" />
        <span className="ml-2 text-sm text-slate-500">Loading activity...</span>
      </div>
    );
  }

  if (!loading && activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Activity Yet</h3>
        <p className="text-sm text-slate-500 mb-6">
          There hasn't been any activity in your family yet.
        </p>
        <div className="text-xs text-slate-400">
          Start by adding transactions, creating goals, or inviting family members to see activity here.
        </div>
      </div>
    );
  }

  if (!loading && filteredActivities.length === 0 && activities.length > 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Filter className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Activity</h3>
        <p className="text-sm text-slate-500 mb-6">
          There are no {activeFilter} activities matching your filter.
        </p>
        <Button variant="outline" onClick={() => setActiveFilter("all")}>
          <Filter size={14} className="mr-2" />
          Show All Activity
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col xl:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 w-full xl:w-auto">
            <Filter size={16} />
            <span className="font-medium">Filters</span>
          </div>
          <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

          <div className="relative w-full xl:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2 w-full xl:w-auto">
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full"
            >
              <option value="all">All Types</option>
              <option value="transaction">Transactions</option>
              <option value="goal">Goals</option>
              <option value="member">Members</option>
              <option value="budget">Budgets</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Members</option>
              <option>John Doe</option>
              <option>Sarah Doe</option>
              <option>Emma Doe</option>
              <option>Mike Johnson</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
            <select className="h-8 px-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-emerald-500 w-full">
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset Filters">
              <RotateCcw size={14} />
            </Button>
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center">
              <Download size={14} />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Feed */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <Card
            key={activity.id}
            className="flex items-start gap-3 p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="flex items-center justify-center text-slate-600 flex-shrink-0">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{activity.memberName}</span>{" "}
                  {activity.action}
                  {activity.amount && (
                    <span className="font-bold text-slate-900">
                      ${activity.amount.toLocaleString()}
                    </span>
                  )}
                  {activity.target && (
                    <span className="font-medium text-emerald-600">{activity.target}</span>
                  )}
                  {activity.type === "goal" && " goal"}
                </p>
                <span className="text-[10px] text-slate-400">{formatTime(activity.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getBadgeColor(activity.type) + " text-[9px] px-1.5 py-0"}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </Badge>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400">{activity.details}</span>
              </div>
            </div>
          </Card>
        ))}

        {/* Load More */}
        {hasMore && (
          <div className="pt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-[10px] px-8 py-2"
            >
              {isLoading ? "Loading..." : "Load More Activity"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
