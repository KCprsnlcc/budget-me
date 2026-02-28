"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Wallet, Flag, UserPlus, Filter, Clock, Search, RotateCcw, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { UserAvatar } from "@/components/shared/user-avatar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { ActivityItem } from "../types";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface ActivityTabProps {
  activities: ActivityItem[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  loading?: boolean;
  currentUser?: User | null;
  familyId?: string | null;
}

export function ActivityTab({
  activities,
  onLoadMore,
  hasMore,
  isLoading,
  loading = false,
  currentUser,
  familyId,
}: ActivityTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [realtimeActivities, setRealtimeActivities] = useState<ActivityItem[]>([]);
  
  // Realtime subscription
  useEffect(() => {
    if (!familyId) return;
    
    const supabase = createClient();
    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_activity_log',
          filter: `family_id=eq.${familyId}`,
        },
        async (payload) => {
          // Fetch the new activity with profile data
          const { data: newActivity } = await supabase
            .from('family_activity_log')
            .select(`
              *,
              profiles!family_activity_log_user_id_fkey (
                full_name,
                email,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (newActivity) {
            const profile = newActivity.profiles;
            const fullName = profile?.full_name || profile?.email || "Unknown User";
            
            let activityType: "transaction" | "goal" | "member" | "budget";
            if (newActivity.activity_type.includes("transaction")) {
              activityType = "transaction";
            } else if (newActivity.activity_type.includes("goal")) {
              activityType = "goal";
            } else if (newActivity.activity_type.includes("member") || newActivity.activity_type.includes("family")) {
              activityType = "member";
            } else {
              activityType = "budget";
            }
            
            const activity: ActivityItem = {
              id: newActivity.id,
              type: activityType,
              action: newActivity.description,
              memberName: fullName,
              memberEmail: profile?.email || "",
              memberAvatar: profile?.avatar_url || undefined,
              details: newActivity.activity_type.replace(/_/g, " "),
              amount: newActivity.amount ? Number(newActivity.amount) : undefined,
              target: newActivity.target_name || undefined,
              timestamp: newActivity.created_at,
              metadata: newActivity.metadata || {},
            };
            
            setRealtimeActivities(prev => [activity, ...prev].slice(0, 10)); // Keep only last 10 realtime activities
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId]);
  
  // Combine activities with realtime activities
  const allActivities = useMemo(() => {
    return [...realtimeActivities, ...activities];
  }, [realtimeActivities, activities]);

  // Create mock user for avatar component
  const createMockUser = useCallback((activity: ActivityItem): User => {
    return {
      id: activity.memberEmail,
      email: activity.memberEmail,
      user_metadata: {
        full_name: activity.memberName,
        avatar_url: activity.memberAvatar
      },
      app_metadata: {},
      created_at: "",
      aud: "authenticated"
    } as User;
  }, []);
  
  const formatTime = useCallback((timestamp: string) => {
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
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      }
      return "Just now";
    }
  }, []);
  
  const getIcon = useCallback((type: string) => {
    switch (type) {
      case "transaction":
        return Wallet;
      case "goal":
        return Flag;
      case "member":
        return UserPlus;
      case "budget":
        return Filter;
      default:
        return Clock;
    }
  }, []);
  
  const getBadgeColor = useCallback((type: string) => {
    return "bg-gray-100 text-gray-700 border-gray-300";
  }, []);

  // Ensure activity description includes user name
  const getActivityDescription = useCallback((activity: ActivityItem) => {
    // If the action already starts with the member name, return as-is
    if (activity.action.startsWith(activity.memberName)) {
      return activity.action;
    }
    
    // Otherwise, prepend the member name to the action
    return `${activity.memberName} ${activity.action}`;
  }, []);

  // Filter and search logic
  const filteredActivities = useMemo(() => {
    let filtered = allActivities;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.memberName.toLowerCase().includes(query) ||
        activity.action.toLowerCase().includes(query) ||
        activity.details.toLowerCase().includes(query) ||
        (activity.target && activity.target.toLowerCase().includes(query))
      );
    }
    
    // Type filter
    if (activeFilter !== "" && activeFilter !== "all") {
      filtered = filtered.filter(activity => activity.type === activeFilter);
    }
    
    // Month and Year filter
    if (monthFilter !== "all" || yearFilter !== "all") {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const activityMonth = (activityDate.getMonth() + 1).toString(); // Convert to string for comparison
        const activityYear = activityDate.getFullYear().toString();     // Convert to string for comparison
        
        const monthMatch = monthFilter === "all" || activityMonth === monthFilter;
        const yearMatch = yearFilter === "all" || activityYear === yearFilter;
        
        return monthMatch && yearMatch;
      });
    }
    
    return filtered;
  }, [allActivities, searchQuery, activeFilter, monthFilter, yearFilter]);
  
  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);
  
  // Export functionality
  const handleExport = useCallback(() => {
    const csvContent = [
      ['Timestamp', 'Member', 'Action', 'Type', 'Amount', 'Target', 'Details'],
      ...filteredActivities.map(activity => [
        activity.timestamp,
        activity.memberName,
        activity.action,
        activity.type,
        activity.amount?.toString() || '',
        activity.target || '',
        activity.details
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `family-activity-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredActivities]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setActiveFilter("");
    const now = new Date();
    setMonthFilter((now.getMonth() + 1).toString()); // Current month
    setYearFilter(now.getFullYear().toString()); // Current year
  }, []);

  const resetFiltersToAll = useCallback(() => {
    setSearchQuery("");
    setActiveFilter("");
    setMonthFilter("all");
    setYearFilter("all");
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(loadMoreRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  if (loading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="space-y-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton width={150} height={16} className="mb-2" />
              <Skeleton width={200} height={12} />
            </div>
            <Skeleton width={100} height={32} borderRadius={6} />
          </div>

          {/* Activity List Skeleton */}
          <Card className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border border-slate-100">
                  <Skeleton width={40} height={40} borderRadius="50%" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton width={120} height={14} />
                      <Skeleton width={60} height={10} />
                    </div>
                    <Skeleton width="80%" height={12} className="mb-2" />
                    <div className="flex items-center gap-2">
                      <Skeleton width={70} height={18} borderRadius={10} />
                      <Skeleton width={50} height={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </SkeletonTheme>
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
      <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex flex-col xl:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 w-full xl:w-auto">
            <Filter size={16} />
            <span className="font-medium">Filters</span>
            {(searchQuery || activeFilter !== "" || monthFilter !== "all" || yearFilter !== "all") && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                {filteredActivities.length} results
              </span>
            )}
          </div>
          <div className="hidden xl:block h-4 w-px bg-slate-200"></div>

          <div className="relative w-full xl:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-slate-50"
              aria-label="Search activities"
              role="searchbox"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2 w-full xl:w-auto">
            <FilterDropdown
              value={monthFilter === "all" ? "" : monthFilter.toString()}
              onChange={(value) => setMonthFilter(value === "" ? "all" : value)}
              options={MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
              placeholder="All Months"
              className="w-full text-slate-900"
              allowEmpty={true}
              emptyLabel="All Months"
              hideSearch={true}
            />
            
            <FilterDropdown
              value={yearFilter === "all" ? "" : yearFilter.toString()}
              onChange={(value) => setYearFilter(value === "" ? "all" : value)}
              options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => ({ value: y.toString(), label: y.toString() }))}
              placeholder="All Years"
              className="w-full text-slate-900"
              allowEmpty={true}
              emptyLabel="All Years"
              hideSearch={true}
            />
            
            <FilterDropdown
              value={activeFilter}
              onChange={(value) => setActiveFilter(value)}
              options={[
                { value: "all", label: "All Types" },
                { value: "transaction", label: "Transactions" },
                { value: "goal", label: "Goals" },
                { value: "member", label: "Members" },
                { value: "budget", label: "Budgets" }
              ]}
              placeholder="All Types"
              className="w-full text-slate-900"
              allowEmpty={true}
              emptyLabel="All Types"
              hideSearch={true}
            />
          </div>

          <div className="flex-1"></div>
          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to Current Period" onClick={resetFilters}>
              <RotateCcw size={14} /> Current
            </Button>
            <Button variant="outline" size="sm" className="text-xs w-full xl:w-auto justify-center" title="Reset to All Time" onClick={resetFiltersToAll}>
              <RotateCcw size={14} /> All Time
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Feed */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Filter className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ? "No Matching Activities" : "No Activity Yet"}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery 
                ? "No activities match your search criteria."
                : "There hasn't been any activity in your family yet."
              }
            </p>
            {searchQuery || activeFilter !== "all" || monthFilter !== "all" || yearFilter !== "all" ? (
              <Button size="sm" variant="outline" onClick={resetFiltersToAll} className="mt-2">
                Clear Filters
              </Button>
            ) : searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                <X size={14} className="mr-2" />
                Clear Search
              </Button>
            )}
            {!searchQuery && (
              <div className="text-xs text-slate-400">
                Start by adding transactions, creating goals, or inviting family members to see activity here.
              </div>
            )}
          </div>
        ) : (
          <>
            {filteredActivities.map((activity, index) => {
              const isRealtime = index < realtimeActivities.length;
              const Icon = getIcon(activity.type);
              
              return (
                <Card
                  key={activity.id}
                  className={`flex items-start gap-3 p-4 bg-white hover:bg-slate-50 rounded-xl transition-all duration-200 border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer ${
                    isRealtime ? "ring-2 ring-emerald-500 ring-opacity-50 bg-emerald-50/30" : ""
                  }`}
                  role="article"
                  aria-label={`Activity: ${getActivityDescription(activity)}`}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, () => {
                    // Optional: Add click handler for keyboard navigation
                  })}
                >
                  <div className="flex-shrink-0">
                    <UserAvatar 
                      user={createMockUser(activity)} 
                      size="lg"
                      className="ring-2 ring-white shadow-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center text-slate-400 flex-shrink-0 -ml-6 mt-5 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                    <Icon size={12} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          <span className="text-slate-600">{getActivityDescription(activity)}</span>
                          {activity.type === "goal" && !activity.action.includes("goal") && (
                            <span className="text-slate-500 ml-1">goal</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {isRealtime && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                            New
                          </span>
                        )}
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getBadgeColor(activity.type)} text-xs px-2 py-1 border font-medium`}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Badge>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-500 capitalize">
                        {activity.details}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* Load More Trigger */}
            {hasMore && (
              <div 
                ref={loadMoreRef}
                className="pt-4 text-center"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="text-sm px-6 py-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    "Load More Activity"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
