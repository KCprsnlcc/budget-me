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
  onSendJoinRequest?: (familyId: string) => Promise<{ error: string | null }>;
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

  const handleCreateFamily = () => {
    setCreateModalOpen(true);
  };

  const handleJoinFamily = (familyId: string) => {
    onJoinFamily(familyId);
  };

  // Check if user has already requested to join this family
  const hasRequestedFamily = (familyId: string) => {
    return joinRequests.some(req => req.family_id === familyId);
  };

  // Handle request button click
  const handleRequestJoin = async (familyId: string) => {
    if (!onSendJoinRequest) return;
    
    const result = await onSendJoinRequest(familyId);
    if (result.error) {
      console.error('Failed to send join request:', result.error);
    }
  };

  // Skeleton loader for tab content
  const renderTabSkeleton = () => {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="space-y-6 animate-fade-in">
          {activeTab === "create" && (
            <div className="space-y-10">
              {/* Features Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center justify-center mx-auto">
                      <Skeleton width={24} height={24} borderRadius={8} />
                    </div>
                    <div className="space-y-2">
                      <Skeleton width={120} height={16} className="mx-auto" />
                      <Skeleton width={160} height={12} className="mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Create Button Skeleton */}
              <div className="pt-6 flex flex-col items-center border-t border-slate-50">
                <Skeleton width={180} height={36} borderRadius={8} />
                <Skeleton width={140} height={10} className="mt-4" />
              </div>
            </div>
          )}

          {activeTab === "join" && (
            <div className="space-y-6">
              {/* Search Input Skeleton */}
              <div className="max-w-6xl mx-auto">
                <div className="relative mb-8">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Skeleton width={18} height={18} borderRadius={4} />
                  </div>
                  <Skeleton width="100%" height={48} borderRadius={8} />
                </div>

                {/* Join Requests Section Skeleton */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton width={150} height={16} />
                    <Skeleton width={80} height={20} borderRadius={10} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="p-4 border border-slate-200 bg-white rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Skeleton width={16} height={16} borderRadius={4} />
                            <div className="space-y-1">
                              <Skeleton width={120} height={14} />
                              <Skeleton width={100} height={10} />
                            </div>
                          </div>
                          <Skeleton width={60} height={20} borderRadius={10} />
                        </div>
                        <Skeleton width="100%" height={12} className="mb-3" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Skeleton width={12} height={12} borderRadius={4} />
                            <Skeleton width={60} height={10} />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton width={12} height={12} borderRadius={4} />
                            <Skeleton width={60} height={10} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Families Section Skeleton */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 mb-4">
                    <Skeleton width={120} height={10} />
                    <Skeleton width={60} height={10} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Skeleton width={16} height={16} borderRadius={4} />
                            <div className="space-y-1">
                              <Skeleton width={120} height={14} />
                              <Skeleton width={100} height={10} />
                            </div>
                          </div>
                          <Skeleton width={60} height={28} borderRadius={6} />
                        </div>
                        <Skeleton width="100%" height={12} className="mb-3" />
                        <div className="flex items-center justify-between">
                          <Skeleton width={80} height={10} />
                          <Skeleton width={70} height={10} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Text Skeleton */}
                <div className="pt-8 mt-8 border-t border-slate-50 text-center">
                  <Skeleton width={200} height={10} className="mx-auto" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "invitations" && (
            <div className="space-y-6">
              <div className="max-w-6xl mx-auto">
                {/* Invitation Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-4 border border-slate-200 bg-white rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Skeleton width={16} height={16} borderRadius={4} />
                          <div className="space-y-1">
                            <Skeleton width={120} height={14} />
                            <Skeleton width={100} height={10} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton width={60} height={28} borderRadius={6} />
                          <Skeleton width={60} height={28} borderRadius={6} />
                        </div>
                      </div>
                      <Skeleton width="100%" height={12} className="mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton width={80} height={10} />
                        <Skeleton width={100} height={10} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* No Data State Skeleton */}
                <div className="text-center py-12">
                  <div className="flex items-center justify-center mx-auto mb-4">
                    <Skeleton width={32} height={32} borderRadius={8} />
                  </div>
                  <Skeleton width={200} height={20} className="mx-auto mb-2" />
                  <Skeleton width={300} height={12} className="mx-auto mb-6" />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Skeleton width={140} height={36} borderRadius={8} />
                    <Skeleton width={140} height={36} borderRadius={8} />
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
    <div className="max-w-4xl mx-auto py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">
          Family Finance
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
          Collaborate on budgets, track shared expenses, and reach financial goals as a household.
        </p>
      </div>

      {/* No Family Tabs Container */}
      <Card className="overflow-hidden">
        {/* Minimal Tabs */}
        <div className="flex border-b border-slate-200/60">
          <button
            className={`flex-1 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "create"
                ? "text-emerald-600 border-emerald-500"
                : "text-slate-400 hover:text-slate-600 border-slate-100"
            }`}
            onClick={() => handleTabChange("create")}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus size={16} />
              <span>Create</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "join"
                ? "text-emerald-600 border-emerald-500"
                : "text-slate-400 hover:text-slate-600 border-slate-100"
            }`}
            onClick={() => handleTabChange("join")}
          >
            <div className="flex items-center justify-center gap-2">
              <Search size={16} />
              <span>Join</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all relative ${
              activeTab === "invitations"
                ? "text-emerald-600 border-emerald-500"
                : "text-slate-400 hover:text-slate-600 border-slate-100"
            }`}
            onClick={() => handleTabChange("invitations")}
          >
            <div className="flex items-center justify-center gap-2">
              <Mail size={16} />
              <span>Invitations</span>
              {invitations.length > 0 && (
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              )}
            </div>
          </button>
        </div>

        <div className="p-10">
          {/* Show skeleton during tab switching */}
          {tabSwitching ? (
            renderTabSkeleton()
          ) : (
            <>
              {/* Create Tab Content */}
              {activeTab === "create" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {NO_FAMILY_FEATURES.map((feature, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-center text-slate-600 mx-auto">
                      {feature.icon === "Widget" && <Home size={24} />}
                      {feature.icon === "Target" && <Check size={24} />}
                      {feature.icon === "ShieldCheck" && <Users size={24} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{feature.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex flex-col items-center border-t border-slate-50">
                <Button
                  onClick={handleCreateFamily}
                  className="px-10 py-3.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:translate-y-[-1px] transition-all bg-emerald-500 hover:bg-emerald-600"
                >
                  <Home size={20} />
                  Create New Family
                </Button>
                <p className="text-[10px] text-slate-400 mt-4 tracking-wide uppercase">
                  Setup takes less than 2 minutes
                </p>
              </div>
            </div>
              )}

          {/* Join Tab Content */}
          {activeTab === "join" && (
            <div className="space-y-6">
              <div className="max-w-6xl mx-auto">
                <div className="relative mb-8">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Find by name or group ID..."
                  />
                </div>

                {/* Your Join Requests Section */}
                {joinRequests.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-900">Your Join Requests ({joinRequests.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {joinRequests.map((request) => (
                        <Card key={request.family_id} className="p-4 border border-slate-200 bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center text-slate-400">
                                <Clock size={16} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-slate-900">{request.families?.family_name}</h4>
                                <p className="text-[10px] text-slate-500">
                                  Requested {formatRelativeTime(request.requestedAt)}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="text-xs bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-default"
                              disabled
                            >
                              Pending
                            </Button>
                          </div>
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                            {request.families?.description || "No description available"}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>{request.createdBy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={12} />
                              <span>{request.memberCount} members</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Families Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Available Groups
                    </span>
                    <span className="text-[10px] text-emerald-500 font-medium">
                      {publicFamilies.filter(f => !hasRequestedFamily(f.id)).length} groups
                    </span>
                  </div>
                  {publicFamilies.filter(f => !hasRequestedFamily(f.id)).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {publicFamilies.filter(f => !hasRequestedFamily(f.id)).map((family) => (
                        <Card key={family.id} className="p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                <Home size={16} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-slate-900">{family.name}</h4>
                                <p className="text-[10px] text-slate-500">
                                  {family.memberCount} active members
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0 hover:shadow-md transition-shadow"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestJoin(family.id);
                              }}
                            >
                              Request
                            </Button>
                          </div>
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                            {family.description || "Join this family group to collaborate on finances"}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Created by {family.createdBy}</span>
                            <span>Public group</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="flex items-center justify-center text-slate-400 mx-auto mb-4">
                        <Search className="text-slate-400" size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No More Groups Available</h3>
                      <p className="text-sm text-slate-500 mb-6">
                        You've requested to join all available public groups. Wait for approval or create your own family.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => handleTabChange("create")} className="bg-emerald-500 hover:bg-emerald-600">
                          <Plus size={16} className="mr-2" />
                          Create Family
                        </Button>
                        <Button variant="outline" onClick={() => handleTabChange("invitations")}>
                          <Mail size={16} className="mr-2" />
                          Check Invitations
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-8 mt-8 border-t border-slate-50 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    Can't find your group? Check the ID or ask your admin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invitations Tab Content */}
          {activeTab === "invitations" && (
            <div className="space-y-6">
              <div className="max-w-6xl mx-auto">
                {invitations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {invitations.map((invitation) => (
                      <Card key={invitation.id} className="p-4 border border-slate-200 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center text-slate-400">
                              <Mail size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-slate-900">{invitation.familyName}</h4>
                              <p className="text-[10px] text-slate-500">
                                From <span className="text-slate-600 font-medium">{invitation.inviterName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0 hover:shadow-md transition-shadow"
                              onClick={() => onRespondToInvitation ? onRespondToInvitation(invitation.id, true) : onCheckInvitations()}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all"
                              onClick={() => onRespondToInvitation ? onRespondToInvitation(invitation.id, false) : onCheckInvitations()}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                        {invitation.message && (
                          <p className="text-xs text-slate-600 italic px-3 py-2 bg-slate-50 rounded-lg mb-3 line-clamp-2">
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
                  <div className="text-center py-12">
                    <div className="flex items-center justify-center text-slate-400 mx-auto mb-4">
                      <Mail className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Invitations</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      You don't have any pending family invitations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => handleTabChange("create")} className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus size={16} className="mr-2" />
                        Create Family
                      </Button>
                      <Button variant="outline" onClick={() => handleTabChange("join")}>
                        <Search size={16} className="mr-2" />
                        Browse Groups
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
      />
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
}
