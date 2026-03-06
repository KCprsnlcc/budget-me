"use client";

import React, { useState } from "react";
import { Users, Plus, Search, Mail, Home, Check, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { CreateFamilyModal, InviteMemberModal } from "../index";
import { NO_FAMILY_TABS, NO_FAMILY_FEATURES } from "../constants";
import type { NoFamilyTab, PublicFamily, Invitation } from "../types";

// Helper function to format relative time
const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return "Unknown time";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

interface NoFamilyStateProps {
  onCreateFamily: () => void;
  onJoinFamily: (familyId: string) => void;
  onCheckInvitations: () => void;
  publicFamilies?: PublicFamily[];
  invitations?: Invitation[];
  joinRequests?: any[];
  isLoading?: boolean;
  onRespondToInvitation?: (invitationId: string, accept: boolean) => Promise<{ error: string | null }>;
  onSendJoinRequest?: (familyId: string, message: string) => Promise<{ error: string | null }>;
  handleCreateFamily?: (form: any) => Promise<{ error: string | null }>;
}

export function NoFamilyState({
  onCreateFamily,
  onJoinFamily,
  onCheckInvitations,
  publicFamilies = [],
  invitations = [],
  joinRequests = [],
  isLoading = false,
  onRespondToInvitation,
  onSendJoinRequest,
  handleCreateFamily,
}: NoFamilyStateProps) {
  const [activeTab, setActiveTab] = useState<NoFamilyTab>("create");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [tabSwitching, setTabSwitching] = useState(false);

  const handleTabChange = (tab: NoFamilyTab) => {
    if (tab === activeTab) return;

    setTabSwitching(true);
    setActiveTab(tab);

    // Simulate brief loading delay for tab switch (like Financial Insights refresh)
    setTimeout(() => {
      setTabSwitching(false);
    }, 600);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleJoinFamily = (family: PublicFamily) => {
    onJoinFamily(family.id);
  };

  // Check if user has already requested to join this family
  const hasRequestedFamily = (familyId: string) => {
    return joinRequests.some(req => req.family_id === familyId);
  };


  // Skeleton loader for tab content
  const renderTabSkeleton = () => {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {activeTab === "create" && (
            <div className="space-y-6 sm:space-y-10">
              {/* Features Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 text-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-center mx-auto">
                      <Skeleton width={20} height={20} borderRadius={6} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Skeleton width={100} height={14} className="mx-auto sm:w-[120px] sm:h-4" />
                      <Skeleton width={140} height={10} className="mx-auto sm:w-[160px] sm:h-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Button Skeleton */}
              <div className="pt-4 sm:pt-6 flex flex-col items-center border-t border-slate-50">
                <Skeleton width={140} height={32} borderRadius={8} className="sm:w-[180px] sm:h-9" />
                <Skeleton width={120} height={10} className="mt-3 sm:mt-4" />
              </div>
            </div>
          )}

          {activeTab === "join" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Search Input Skeleton */}
              <div className="max-w-6xl mx-auto">
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                    <Skeleton width={14} height={14} borderRadius={4} className="sm:w-4 sm:h-4" />
                  </div>
                  <Skeleton width="100%" height={40} borderRadius={8} className="sm:h-12" />
                </div>

                {/* Join Requests Section Skeleton */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <Skeleton width={120} height={14} className="sm:w-[150px] sm:h-4" />
                    <Skeleton width={60} height={16} borderRadius={10} className="sm:w-[80px] sm:h-5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="p-3 sm:p-4 border border-slate-200 bg-white rounded-lg">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Skeleton width={14} height={14} borderRadius={4} className="sm:w-4 sm:h-4" />
                            <div className="space-y-1">
                              <Skeleton width={100} height={12} className="sm:w-[120px] sm:h-4" />
                              <Skeleton width={80} height={10} className="sm:w-[100px]" />
                            </div>
                          </div>
                          <Skeleton width={50} height={18} borderRadius={10} className="sm:w-[60px] sm:h-5" />
                        </div>
                        <Skeleton width="100%" height={10} className="mb-2 sm:mb-3" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Skeleton width={10} height={10} borderRadius={4} />
                            <Skeleton width={50} height={10} />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton width={10} height={10} borderRadius={4} />
                            <Skeleton width={50} height={10} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Families Section Skeleton */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 mb-3 sm:mb-4">
                    <Skeleton width={100} height={10} className="sm:w-[120px]" />
                    <Skeleton width={40} height={10} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-3 sm:p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Skeleton width={14} height={14} borderRadius={4} className="sm:w-4 sm:h-4" />
                            <div className="space-y-1">
                              <Skeleton width={100} height={12} className="sm:w-[120px] sm:h-4" />
                              <Skeleton width={80} height={10} className="sm:w-[100px]" />
                            </div>
                          </div>
                          <Skeleton width={50} height={24} borderRadius={6} className="sm:w-[60px] sm:h-7" />
                        </div>
                        <Skeleton width="100%" height={10} className="mb-2 sm:mb-3" />
                        <div className="flex items-center justify-between">
                          <Skeleton width={60} height={10} />
                          <Skeleton width={50} height={10} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Text Skeleton */}
                <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-50 text-center">
                  <Skeleton width={180} height={10} className="mx-auto" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "invitations" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="max-w-6xl mx-auto">
                {/* Invitation Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-3 sm:p-4 border border-slate-200 bg-white rounded-lg">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Skeleton width={14} height={14} borderRadius={4} className="sm:w-4 sm:h-4" />
                          <div className="space-y-1">
                            <Skeleton width={100} height={12} className="sm:w-[120px] sm:h-4" />
                            <Skeleton width={80} height={10} className="sm:w-[100px]" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton width={50} height={24} borderRadius={6} className="sm:w-[60px] sm:h-7" />
                          <Skeleton width={50} height={24} borderRadius={6} className="sm:w-[60px] sm:h-7" />
                        </div>
                      </div>
                      <Skeleton width="100%" height={10} className="mb-2 sm:mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton width={60} height={10} />
                        <Skeleton width={80} height={10} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* No Data State Skeleton */}
                <div className="text-center py-8 sm:py-12">
                  <div className="flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Skeleton width={28} height={28} borderRadius={6} className="sm:w-8 sm:h-8" />
                  </div>
                  <Skeleton width={180} height={18} className="mx-auto mb-2 sm:w-[200px] sm:h-5" />
                  <Skeleton width={260} height={12} className="mx-auto mb-4 sm:mb-6 sm:w-[300px] sm:h-3" />
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <Skeleton width={120} height={32} borderRadius={8} className="sm:w-[140px] sm:h-9" />
                    <Skeleton width={120} height={32} borderRadius={8} className="sm:w-[140px] sm:h-9" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SkeletonTheme>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-0 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-2 sm:mb-3">
          Family Finance
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs sm:max-w-sm mx-auto font-light leading-relaxed">
          Collaborate on budgets, track shared expenses, and reach financial goals as a household.
        </p>
      </div>

      {/* No Family Tabs Container */}
      <Card className="overflow-hidden">
        {/* Minimal Tabs */}
        <div className="flex border-b border-slate-200/60 overflow-x-auto scrollbar-hide">
          <button
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${activeTab === "create"
              ? "text-emerald-600 border-emerald-500"
              : "text-slate-400 hover:text-slate-600 border-slate-100"
              }`}
            onClick={() => handleTabChange("create")}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span>Create</span>
            </div>
          </button>
          <button
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${activeTab === "join"
              ? "text-emerald-600 border-emerald-500"
              : "text-slate-400 hover:text-slate-600 border-slate-100"
              }`}
            onClick={() => handleTabChange("join")}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Search size={14} className="sm:w-4 sm:h-4" />
              <span>Join</span>
            </div>
          </button>
          <button
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider border-b-2 transition-all relative whitespace-nowrap ${activeTab === "invitations"
              ? "text-emerald-600 border-emerald-500"
              : "text-slate-400 hover:text-slate-600 border-slate-100"
              }`}
            onClick={() => handleTabChange("invitations")}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Mail size={14} className="sm:w-4 sm:h-4" />
              <span>Invitations</span>
              {invitations.length > 0 && (
                <span className="inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              )}
            </div>
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-10">
          {/* Show skeleton during tab switching */}
          {tabSwitching ? (
            renderTabSkeleton()
          ) : (
            <>
              {/* Create Tab Content */}
              {activeTab === "create" && (
                <div className="space-y-6 sm:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 text-center">
                    {NO_FAMILY_FEATURES.map((feature, index) => (
                      <div key={index} className="space-y-2 sm:space-y-4">
                        <div className="flex items-center justify-center text-slate-600 mx-auto">
                          {feature.icon === "Widget" && <Home size={20} className="sm:w-6 sm:h-6" />}
                          {feature.icon === "Target" && <Check size={20} className="sm:w-6 sm:h-6" />}
                          {feature.icon === "ShieldCheck" && <Users size={20} className="sm:w-6 sm:h-6" />}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{feature.title}</h4>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-2 font-light leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 sm:pt-6 flex flex-col items-center border-t border-slate-50">
                    <Button
                      onClick={handleOpenCreateModal}
                      className="px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 hover:translate-y-[-1px] transition-all bg-emerald-500 hover:bg-emerald-600 h-9 sm:h-11"
                    >
                      <Home size={16} className="sm:w-5 sm:h-5" />
                      Create New Family
                    </Button>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 mt-3 sm:mt-4 tracking-wide uppercase">
                      Setup takes less than 2 minutes
                    </p>
                  </div>
                </div>
              )}

              {/* Join Tab Content */}
              {activeTab === "join" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="max-w-6xl mx-auto">
                    <div className="relative mb-6 sm:mb-8">
                      <Search
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-[18px] sm:h-[18px]"
                        size={18}
                      />
                      <input
                        type="text"
                        className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                        placeholder="Find by name or group ID..."
                      />
                    </div>

                    {/* Your Join Requests Section */}
                    {joinRequests.length > 0 && (
                      <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Your Join Requests ({joinRequests.length})</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {joinRequests.map((request) => (
                            <Card key={request.family_id} className="p-3 sm:p-4 border border-slate-200 bg-white">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {request.createdByAvatar ? (
                                    <img
                                      src={request.createdByAvatar}
                                      alt={request.createdBy}
                                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 border border-slate-200">
                                      <Users size={16} className="sm:w-5 sm:h-5" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="text-xs sm:text-sm font-medium text-slate-900">{request.families?.family_name}</h4>
                                    <p className="text-[10px] text-slate-500">
                                      Requested {formatRelativeTime(request.requestedAt)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="text-[10px] sm:text-xs bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-default h-6 sm:h-7 px-2 sm:px-3"
                                  disabled
                                >
                                  Pending
                                </Button>
                              </div>
                              <p className="text-[10px] sm:text-xs text-slate-600 mb-2 sm:mb-3 line-clamp-2">
                                {request.families?.description || "No description available"}
                              </p>
                              <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <User size={10} className="sm:w-3 sm:h-3" />
                                  <span>{request.createdBy}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users size={10} className="sm:w-3 sm:h-3" />
                                  <span>{request.memberCount} members</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Families Section */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between px-1 mb-3 sm:mb-4">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Available Groups
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-emerald-500 font-medium">
                          {publicFamilies.filter(f => !hasRequestedFamily(f.id)).length} groups
                        </span>
                      </div>
                      {publicFamilies.filter(f => !hasRequestedFamily(f.id)).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {publicFamilies.filter(f => !hasRequestedFamily(f.id)).map((family) => (
                            <Card key={family.id} className="p-3 sm:p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <Home size={14} className="sm:w-4 sm:h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs sm:text-sm font-medium text-slate-900">{family.name}</h4>
                                    <p className="text-[10px] text-slate-500">
                                      {family.memberCount} active members
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="text-[10px] sm:text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0 hover:shadow-md transition-shadow h-6 sm:h-7 px-2 sm:px-3"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoinFamily(family);
                                  }}
                                >
                                  Join
                                </Button>
                              </div>
                              <p className="text-[10px] sm:text-xs text-slate-600 mb-2 sm:mb-3 line-clamp-2">
                                {family.description || "Join this family group to collaborate on finances"}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  {family.creatorAvatar ? (
                                    <img
                                      src={family.creatorAvatar}
                                      alt={family.createdBy}
                                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-slate-200"
                                    />
                                  ) : (
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center text-[6px] sm:text-[8px] font-medium text-emerald-600 border border-slate-200">
                                      {family.createdBy.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                  )}
                                  <span>Created by {family.createdBy}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100 text-slate-400">
                                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>Public group</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <div className="flex items-center justify-center text-slate-400 mx-auto mb-4">
                            <Search className="text-slate-400 w-8 h-8 sm:w-8 sm:h-8" size={32} />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No More Groups Available</h3>
                          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                            You've requested to join all available public groups. Wait for approval or create your own family.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                            <Button onClick={() => handleTabChange("create")} className="bg-emerald-500 hover:bg-emerald-600 h-8 sm:h-9 text-xs sm:text-sm">
                              <Plus size={14} className="sm:w-4 sm:h-4"/>
                              Create Family
                            </Button>
                            <Button variant="outline" onClick={() => onCheckInvitations()} className="h-8 sm:h-9 text-xs sm:text-sm">
                              <Mail size={14} className="sm:w-4 sm:h-4"/>
                              Refresh Invitations
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-50 text-center">
                      <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest">
                        Can't find your group? Check the ID or ask your admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Invitations Tab Content */}
              {activeTab === "invitations" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="max-w-6xl mx-auto">
                    {invitations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {invitations.map((invitation) => (
                          <Card key={invitation.id} className="p-3 sm:p-4 border border-slate-200 bg-white">
                            <div className="flex items-start justify-between mb-2 sm:mb-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                {invitation.inviterAvatar ? (
                                  <img
                                    src={invitation.inviterAvatar}
                                    alt={invitation.inviterName}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-emerald-500">
                                    <Mail size={14} className="sm:w-4 sm:h-4" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-xs sm:text-sm font-medium text-slate-900">{invitation.familyName}</h4>
                                  <p className="text-[10px] text-slate-500">
                                    From <span className="text-slate-600 font-medium">{invitation.inviterName}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Button
                                  size="sm"
                                  className="text-[10px] sm:text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0 hover:shadow-md transition-shadow h-6 sm:h-7 px-2 sm:px-3"
                                  onClick={async () => {
                                    if (onRespondToInvitation) {
                                      await onRespondToInvitation(invitation.id, true);
                                    }
                                  }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[10px] sm:text-xs border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all h-6 sm:h-7 px-2 sm:px-3"
                                  onClick={async () => {
                                    if (onRespondToInvitation) {
                                      await onRespondToInvitation(invitation.id, false);
                                    }
                                  }}
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                            {invitation.message && (
                              <p className="text-[10px] sm:text-xs text-slate-600 italic px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 rounded-lg mb-2 sm:mb-3 line-clamp-2">
                                "{invitation.message}"
                              </p>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Invited {formatRelativeTime(invitation.invitedAt)}</span>
                              <span>Family invitation</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="flex items-center justify-center text-slate-400 mx-auto mb-4">
                          <Mail className="text-slate-400 w-8 h-8 sm:w-8 sm:h-8" size={32} />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No Pending Invitations</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                          When someone invites you to join their family dashboard, it will appear here.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                          <Button onClick={() => handleTabChange("create")} className="bg-emerald-500 hover:bg-emerald-600 h-8 sm:h-9 text-xs sm:text-sm">
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                            Create Family
                          </Button>
                          <Button variant="outline" onClick={() => onCheckInvitations()} className="h-8 sm:h-9 text-xs sm:text-sm">
                            <Mail size={14} className="sm:w-4 sm:h-4" />
                            Refresh Invitations
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateFamilyModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateFamily={handleCreateFamily}
      />
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
}
