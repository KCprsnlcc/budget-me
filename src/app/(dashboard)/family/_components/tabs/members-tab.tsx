"use client";

import React, { useState } from "react";
import { Crown, Shield, Eye, Edit, MoreHorizontal, UserCheck, Clock, Settings, LogOut, Trash2, Users, RefreshCw, Search, Filter, Info, Home, Mail, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { RoleDropdown } from "@/components/ui/role-dropdown";

import { ROLE_ICONS } from "../constants";
import type { FamilyMember, JoinRequest, PublicFamily, Family, EditFamilyData, InviteMemberData, Invitation } from "../types";
import { useAuth } from "@/components/auth/auth-context";
import { formatRelativeTime } from "../../_lib/family-service";
import { TransferOwnershipModal } from "../transfer-ownership-modal";
import { RemoveMemberModal } from "../remove-member-modal";

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
  onRespondToInvitation?: (invitationId: string, accept: boolean) => Promise<{ error: string | null }>;
  onRemoveMember?: (memberId: string) => Promise<{ error: string | null }>;
  onTransferOwnership?: (newOwnerId: string) => Promise<{ error: string | null }>;
  invitations?: Invitation[];
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
  onRespondToInvitation,
  onRemoveMember,
  onTransferOwnership,
  invitations = [],
  isLoading = false,
}: MembersTabProps) {
  const { user } = useAuth();
  const currentUserEmail = user?.email ?? "";

  const [roleChanges, setRoleChanges] = useState<Record<string, string>>({});
  const [savingRoles, setSavingRoles] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Modal states
  const [transferOwnershipModalOpen, setTransferOwnershipModalOpen] = useState(false);
  const [removeMemberModalOpen, setRemoveMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Get current user's role and permissions
  const currentUserMember = members.find(m => m.email === currentUserEmail);
  const currentUserRole = currentUserMember?.role;
  const canManageRoles = currentUserRole === "Owner" || currentUserRole === "Admin";

  // Permission logic for removing members
  const canRemoveMember = (memberRole: string, memberEmail: string) => {
    const isTargetCurrentUser = memberEmail === currentUserEmail;
    
    if (currentUserRole === "Owner") {
      // Owner can remove anyone except themselves
      return memberRole !== "Owner" || !isTargetCurrentUser;
    }
    if (currentUserRole === "Admin") {
      // Admin can remove Members and Viewers, but not Owners or other Admins
      return (memberRole === "Member" || memberRole === "Viewer") && !isTargetCurrentUser;
    }
    return false; // Members and Viewers cannot remove anyone
  };

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

  // Create role options for FilterDropdown
  const getRoleOptions = (currentMemberRole: string) => {
    const options = [
      { value: "Admin", label: "Admin", icon: Shield, color: "text-blue-600" },
      { value: "Member", label: "Member", icon: Edit, color: "text-purple-600" },
      { value: "Viewer", label: "Viewer", icon: Eye, color: "text-slate-600" }
    ];
    
    return options;
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

  const handleCancelRoleChanges = () => {
    setRoleChanges({});
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

  // Modal handlers
  const handleOpenTransferOwnership = () => {
    setTransferOwnershipModalOpen(true);
  };

  const handleCloseTransferOwnership = () => {
    setTransferOwnershipModalOpen(false);
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    if (onTransferOwnership) {
      return await onTransferOwnership(newOwnerId);
    }
    return { error: "Transfer ownership function not available" };
  };

  const handleOpenRemoveMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setRemoveMemberModalOpen(true);
  };

  const handleCloseRemoveMember = () => {
    setRemoveMemberModalOpen(false);
    setSelectedMember(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (onRemoveMember) {
      return await onRemoveMember(memberId);
    }
    return { error: "Remove member function not available" };
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
        <div className="space-y-6 w-full">
          {/* Top Row: Pending Join Requests and My Invitations side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Join Requests Skeleton - Left Column */}
            <Card className="p-6 border-blue-100">
              <Skeleton width={200} height={16} className="mb-2" />
              <Skeleton width={250} height={12} className="mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 1 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white shadow-sm border-blue-100 rounded-lg">
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

            {/* My Invitations Skeleton - Right Column */}
            <Card className="p-6 border-emerald-100">
              <Skeleton width={150} height={16} className="mb-2" />
              <Skeleton width={200} height={12} className="mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white shadow-sm border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Skeleton width={40} height={40} borderRadius="50%" />
                        <div>
                          <Skeleton width={120} height={14} className="mb-1" />
                          <Skeleton width={150} height={10} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton width={60} height={32} borderRadius={6} />
                        <Skeleton width={60} height={32} borderRadius={6} />
                      </div>
                    </div>
                    <Skeleton width="100%" height={30} borderRadius={6} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Full Width: Family Members Section Skeleton */}
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton width={150} height={16} className="mb-2" />
                  <Skeleton width={200} height={12} />
                </div>
                <Skeleton width={150} height={32} borderRadius={6} />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Skeleton width={40} height={40} borderRadius="50%" />
                      <Skeleton width={14} height={14} borderRadius="50%" className="absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton width={120} height={14} />
                        <Skeleton width={16} height={16} borderRadius="50%" />
                      </div>
                      <Skeleton width={150} height={10} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Skeleton width={100} height={32} borderRadius={6} />
                      <Skeleton width={24} height={24} borderRadius={4} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton width={30} height={16} borderRadius={4} />
                      <Skeleton width={60} height={28} borderRadius={6} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Save Role Changes Button Skeleton */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Skeleton width="100%" height={40} borderRadius={6} />
            </div>
            
            {/* About Roles Info Skeleton */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Skeleton width={180} height={16} />
                <Skeleton width={20} height={20} borderRadius="50%" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-2 rounded border">
                    <Skeleton width={60} height={12} className="mb-1" />
                    <Skeleton width="100%" height={10} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Top Row: Pending Join Requests and My Invitations side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Join Requests Section - Left Column */}
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
                      {request.avatar ? (
                        <img
                          src={request.avatar}
                          alt={request.name}
                          className="w-10 h-10 rounded-full object-cover border border-blue-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
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
                        <span className="flex items-center">
                          <UserCheck size={14} className="mr-1" />
                          Approve
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDecline(request.id)}
                      disabled={processingRequestId === request.id}
                    >
                      {processingRequestId === request.id ? (
                        <span className="flex items-center">
                          <Skeleton width={14} height={14} borderRadius="50%" className="mr-1" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Trash2 size={14} className="mr-1" />
                          Decline
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 border-slate-100">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Pending Join Requests
                (0)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Review and approve family member requests</p>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <UserCheck className="text-slate-300" size={28} />
              </div>
              <h4 className="text-sm font-semibold text-slate-800 mb-1">No Pending Requests</h4>
              <p className="text-xs text-slate-500 px-8 leading-relaxed">
                When someone requests to join your family group, they'll appear here for your review.
              </p>
            </div>
          </Card>
        )}

        {/* My Invitations Section - Right Column */}
        <Card className="p-6 border-emerald-100 hover:shadow-md transition-all group cursor-pointer">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              My Invitations
              {invitations.length > 0 && ` (${invitations.length})`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-light">Invitations to join other family groups</p>
          </div>

          {invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="p-4 bg-white shadow-sm border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 italic font-serif">
                        {invitation.familyName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{invitation.familyName}</p>
                        <p className="text-[10px] text-slate-500 font-light">
                          From {invitation.inviterName} • {formatRelativeTime(invitation.invitedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-xs px-3 h-8"
                        onClick={() => onRespondToInvitation?.(invitation.id, true)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 h-8"
                        onClick={() => onRespondToInvitation?.(invitation.id, false)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                  {invitation.message && (
                    <p className="text-xs text-slate-600 mb-0 italic px-3 py-2 border border-slate-100 bg-slate-50/50 rounded-lg">
                      "{invitation.message}"
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Mail className="text-slate-300" size={28} />
              </div>
              <h4 className="text-sm font-semibold text-slate-800 mb-1">No Pending Invitations</h4>
              <p className="text-xs text-slate-500 px-8 leading-relaxed">
                When someone invites you to join their family dashboard, it will appear here.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Full Width: Family Members Section */}
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Family Members ({members.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">
                {canManageRoles ? "Manage current family members and their roles" : "View current family members"}
              </p>
            </div>
            {/* Transfer Ownership Button (Owner only) */}
            {currentUserRole === "Owner" && onTransferOwnership && members.filter(m => m.id !== currentUserMember?.id && m.status === "active").length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={handleOpenTransferOwnership}
              >
                <Crown size={12} className="mr-2" />
                Transfer Ownership
              </Button>
            )}
          </div>
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
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-100"
                            />
                          ) : (
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
                          )}
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
                        {/* Role Management Controls - Integrated into member row */}
                        {canManageRoles && !isOwner && (
                          <div className="flex items-center gap-2">
                            <RoleDropdown
                              value={roleChanges[member.id] || member.role}
                              onChange={(value) => handleRoleChange(member.id, value)}
                              options={getRoleOptions(member.role)}
                              disabled={!canManageRoles || (currentUserRole === "Admin" && member.role === "Owner")}
                              className="min-w"
                            />
                            
                            {/* Remove member button */}
                            {canRemoveMember(member.role, member.email) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-transparent transition-colors p-1 h-8"
                                onClick={() => handleOpenRemoveMember(member)}
                                title="Remove member"
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {/* Static Badge for non-manageable or owners viewing */}
                        {(!canManageRoles || isOwner) && (
                          <span className={`text-xs font-medium ${
                            member.role === "Owner" 
                              ? "text-emerald-600" 
                              : "text-slate-400"
                          }`}>{member.role}</span>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {isCurrentUser && (
                            <span className="text-xs text-slate-400 font-medium">You</span>
                          )}
                          {isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-slate-400 hover:text-rose-500 hover:bg-transparent transition-colors flex items-center gap-1 h-8 px-2"
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
            
            {/* Save Role Changes Button */}
            {canManageRoles && Object.keys(roleChanges).length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-xs justify-center py-2.5" 
                    onClick={handleCancelRoleChanges}
                    disabled={savingRoles}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1 text-xs justify-center py-2.5" onClick={handleSaveRoles} disabled={savingRoles}>
                    {savingRoles ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-3.5 w-3.5 text-white" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* About Roles Info - Compact */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-800">
                  <span className="flex items-center gap-2">
                    <Shield size={14} />
                    About Roles & Permissions
                  </span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-700">Owner:</span>
                    <span className="text-slate-600 block mt-0.5">Full control, manage all roles</span>
                  </div>
                  <div className="p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-700">Admin:</span>
                    <span className="text-slate-600 block mt-0.5">Manage Members/Viewers, invite</span>
                  </div>
                  <div className="p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-700">Member:</span>
                    <span className="text-slate-600 block mt-0.5">Full access to shared features</span>
                  </div>
                  <div className="p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-700">Viewer:</span>
                    <span className="text-slate-600 block mt-0.5">View-only access</span>
                  </div>
                </div>
                {currentUserRole === "Admin" && (
                  <p className="mt-2 text-[10px] text-slate-600">
                    As an Admin, you can manage Members and Viewers, but not Owners or other Admins.
                  </p>
                )}
                {currentUserRole === "Owner" && (
                  <p className="mt-2 text-[10px] text-slate-600">
                    As Owner, you have complete control over all family members and settings.
                  </p>
                )}
              </details>
            </div>
          </Card>

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        open={transferOwnershipModalOpen}
        onClose={handleCloseTransferOwnership}
        onConfirm={handleTransferOwnership}
        familyMembers={members}
        currentOwnerId={currentUserMember?.id || ""}
      />

      {/* Remove Member Modal */}
      <RemoveMemberModal
        open={removeMemberModalOpen}
        onClose={handleCloseRemoveMember}
        onConfirm={handleRemoveMember}
        member={selectedMember}
      />

    </div>
  );
}
