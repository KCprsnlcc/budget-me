"use client";

import React, { useState } from "react";
import { Crown, Shield, Eye, Edit, MoreHorizontal, UserCheck, Clock, Settings, LogOut, Trash2, Users, RefreshCw, Search, Filter, Info, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { ROLE_ICONS } from "../constants";
import type { FamilyMember, JoinRequest, PublicFamily, Family, EditFamilyData, InviteMemberData } from "../types";
import { useAuth } from "@/components/auth/auth-context";
import { formatRelativeTime } from "../../_lib/family-service";

interface MembersTabProps {
  familyData: Family | null;
  members: FamilyMember[];
  pendingRequests: JoinRequest[];
  publicFamilies?: PublicFamily[];
  onUpdateRole: (memberId: string, role: string) => Promise<{ error: string | null }> | void;
  onApproveRequest: (requestId: string) => Promise<{ error: string | null }> | void;
  onDeclineRequest: (requestId: string) => Promise<{ error: string | null }> | void;
  onEditFamily: () => void;
  onDeleteFamily: () => void;
  onLeaveFamily: () => void;
  onJoinFamily: (familyId: string) => void;
  onRefreshFamilies: () => void;
  onSendInvitation?: (form: InviteMemberData) => Promise<{ error: string | null }>;
  onUpdateFamily?: (form: EditFamilyData) => Promise<{ error: string | null }>;
  onDeleteFamilyConfirm?: () => Promise<{ error: string | null }>;
  onLeaveFamilyConfirm?: () => Promise<{ error: string | null }>;
  isLoading?: boolean;
}

export function MembersTab({
  familyData,
  members,
  pendingRequests,
  publicFamilies = [],
  onUpdateRole,
  onApproveRequest,
  onDeclineRequest,
  onEditFamily,
  onDeleteFamily,
  onLeaveFamily,
  onJoinFamily,
  onRefreshFamilies,
  onSendInvitation,
  onUpdateFamily,
  onDeleteFamilyConfirm,
  onLeaveFamilyConfirm,
  isLoading = false,
}: MembersTabProps) {
  const { user } = useAuth();
  const currentUserEmail = user?.email ?? "";

  const [roleChanges, setRoleChanges] = useState<Record<string, string>>({});
  const [savingRoles, setSavingRoles] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Create icon mapping from string constants
  const getRoleIcon = (role: string) => {
    const iconMap: Record<string, React.ElementType> = {
      "Crown": Crown,
      "Shield": Shield,
      "Edit": Edit,
      "Eye": Eye,
    };
    return iconMap[ROLE_ICONS[role as keyof typeof ROLE_ICONS]] || Eye;
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setRoleChanges(prev => ({ ...prev, [memberId]: newRole }));
  };

  const handleSaveRoles = async () => {
    setSavingRoles(true);
    const entries = Object.entries(roleChanges);
    const errors: string[] = [];

    for (const [memberId, role] of entries) {
      const result = await onUpdateRole(memberId, role);
      if (result && result.error) {
        errors.push(result.error);
      }
    }

    setSavingRoles(false);
    if (errors.length === 0) {
      setRoleChanges({});
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingRequestId(requestId);
    await onApproveRequest(requestId);
    setProcessingRequestId(null);
  };

  const handleDecline = async (requestId: string) => {
    setProcessingRequestId(requestId);
    await onDeclineRequest(requestId);
    setProcessingRequestId(null);
  };



  if (!familyData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center mx-auto mb-4">
          <Users className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Family Data</h3>
        <p className="text-sm text-slate-500 mb-6">
          Family data is not available. Please try refreshing the page.
        </p>
        <Button variant="outline" onClick={onRefreshFamilies}>
          Refresh
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Requests Card Skeleton */}
              <Card className="p-6">
                <Skeleton width={200} height={16} className="mb-2" />
                <Skeleton width={250} height={12} className="mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-4 border border-slate-100 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Skeleton width={40} height={40} borderRadius="50%" />
                          <div>
                            <Skeleton width={120} height={14} className="mb-1" />
                            <Skeleton width={150} height={10} />
                          </div>
                        </div>
                      </div>
                      <Skeleton width="100%" height={40} borderRadius={6} className="mb-4" />
                      <div className="flex items-center gap-2">
                        <Skeleton width="50%" height={32} borderRadius={6} />
                        <Skeleton width="50%" height={32} borderRadius={6} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Members List Card Skeleton */}
              <Card className="p-6">
                <Skeleton width={150} height={16} className="mb-2" />
                <Skeleton width={200} height={12} className="mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Skeleton width={40} height={40} borderRadius="50%" />
                        <div>
                          <Skeleton width={120} height={14} className="mb-1" />
                          <Skeleton width={100} height={10} />
                        </div>
                      </div>
                      <Skeleton width={80} height={20} borderRadius={10} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              {/* Role Management Skeleton */}
              <Card className="p-6">
                <Skeleton width={120} height={16} className="mb-2" />
                <Skeleton width={180} height={12} className="mb-6" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton width={32} height={32} borderRadius="50%" />
                        <Skeleton width={100} height={12} />
                      </div>
                      <Skeleton width={80} height={24} borderRadius={4} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* About Roles Skeleton */}
              <Card className="p-6">
                <Skeleton width={100} height={16} className="mb-2" />
                <Skeleton width={180} height={12} className="mb-6" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} width="100%" height={20} />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Join Requests Section */}
        <div className="lg:col-span-2 space-y-6">
          {pendingRequests.length > 0 ? (
            <Card className="p-6 border-blue-100 hover:shadow-md transition-all group cursor-pointer">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Pending Join Requests
                  ({pendingRequests.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-light">Review and approve family member requests</p>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="p-4 bg-white shadow-sm border-blue-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{request.name}</p>
                          <p className="text-[10px] text-slate-500 font-light">
                            {request.email} • Requested {formatRelativeTime(request.requestedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-4 italic px-3 py-2 border border-slate-200 rounded-lg">
                      "{request.message}"
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => handleApprove(request.id)}
                        disabled={processingRequestId === request.id}
                      >
                        {processingRequestId === request.id ? (
                          <span className="flex items-center">
                            <Skeleton width={14} height={14} borderRadius="50%" className="mr-1" />
                            Processing...
                          </span>
                        ) : (
                          <UserCheck size={14} className="mr-1" />
                        )}
                        Approve as Member
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(request.id)}
                        disabled={processingRequestId === request.id}
                      >
                        {processingRequestId === request.id ? (
                          <span className="flex items-center">
                            <Skeleton width={14} height={14} borderRadius="50%" className="mr-1" />
                            Processing...
                          </span>
                        ) : (
                          <Trash2 size={14} className="mr-1" />
                        )}
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-slate-100">
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Requests</h3>
                <p className="text-sm text-slate-500 mb-6">
                  There are no pending join requests for your family group.
                </p>
                <div className="text-xs text-slate-400">
                  When someone requests to join your family, they'll appear here for your review.
                </div>
              </div>
            </Card>
          )}

          {/* Current Family Members List */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Family Members ({members.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Manage current family members and their roles</p>
            </div>
            {members.length > 0 ? (
              <div className="space-y-4">
                {members.map((member) => {
                  const RoleIcon = getRoleIcon(member.role);
                  const isOwner = member.role === "Owner";
                  const isCurrentUser = member.email === currentUserEmail;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-xl group hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm border ${member.role === "Owner"
                                ? "border-emerald-100 text-emerald-700"
                                : member.role === "Admin"
                                  ? "border-blue-100 text-blue-700"
                                  : member.role === "Member"
                                    ? "border-purple-100 text-purple-700"
                                    : "border-slate-100 text-slate-700"
                              }`}
                          >
                            {member.initials}
                          </div>
                          {isOwner && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{member.name}</p>
                            {isOwner && (
                              <Crown className="text-amber-500" size={14} />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-light">
                            {member.email} • Joined {member.joinedAt || "Jan 2025"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            member.role === "Owner"
                              ? "success"
                              : member.role === "Admin"
                                ? "info"
                                : member.role === "Member"
                                  ? "neutral"
                                  : "brand"
                          }
                        >
                          {member.role}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {isCurrentUser && (
                            <span className="text-xs text-slate-400 font-light">You</span>
                          )}
                          {isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                              onClick={onLeaveFamily}
                            >
                              <LogOut size={12} />
                              Leave
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Family Members Yet</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Your family group doesn't have any members yet.
                </p>
                <div className="text-xs text-slate-400">
                  Invite family members to start collaborating on budgets and goals together.
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Role Management and Info */}
        <div className="space-y-6">
          {/* Role Management interface */}
          <Card className="p-6 overflow-hidden">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Role Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Assign and manage member permissions</p>
            </div>
            {members.filter(m => m.role !== "Owner").length > 0 ? (
              <>
                <div className="space-y-4">
                  {members
                    .filter(m => m.role !== "Owner")
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-lg hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-[10px] flex-shrink-0 border ${member.role === "Admin"
                                ? "border-blue-100 text-blue-700"
                                : member.role === "Member"
                                  ? "border-purple-100 text-purple-700"
                                  : "border-slate-100 text-slate-700"
                              }`}
                          >
                            {member.initials}
                          </div>
                          <span className="text-xs font-medium text-slate-900 truncate">{member.name}</span>
                        </div>
                        <select
                          value={roleChanges[member.id] || member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="text-[10px] border border-slate-200 rounded-lg px-2 py-1 bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </div>
                    ))}
                </div>
                {Object.keys(roleChanges).length > 0 && (
                  <Button className="w-full text-xs justify-center py-2.5" onClick={handleSaveRoles} disabled={savingRoles}>
                    {savingRoles ? (
                      <span className="flex items-center">
                        <Skeleton width={14} height={14} borderRadius="50%" className="mr-2" />
                        Saving...
                      </span>
                    ) : (
                      <Crown className="text-amber-500 mr-2" size={14} />
                    )}
                    {savingRoles ? "Saving..." : "Save Role Changes"}
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Settings className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Members to Manage</h3>
                <p className="text-sm text-slate-500 mb-6">
                  There are no family members whose roles can be changed.
                </p>
                <div className="text-xs text-slate-400">
                  Only non-owner members can have their roles modified.
                </div>
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="p-6 border-emerald-100 hover:shadow-md transition-all group cursor-pointer">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                About Roles
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Understanding family member permissions</p>
            </div>
            <ul className="space-y-3">
              <li className="text-[10px] text-emerald-800 leading-relaxed">
                <span className="font-bold">Owner:</span> Complete control, can delete the family group.
              </li>
              <li className="text-[10px] text-emerald-800 leading-relaxed">
                <span className="font-bold">Admin:</span> Can invite members, manage roles, and create shared budgets.
              </li>
              <li className="text-[10px] text-emerald-800 leading-relaxed">
                <span className="font-bold">Member:</span> Full access to shared features, budgets, and goals.
              </li>
              <li className="text-[10px] text-emerald-800 leading-relaxed">
                <span className="font-bold">Viewer:</span> Read-only access to all family information.
              </li>
            </ul>
          </Card>
        </div>
      </div>


    </div>
  );
}
