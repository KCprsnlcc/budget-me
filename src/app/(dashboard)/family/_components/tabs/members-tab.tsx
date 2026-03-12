"use client";

import React, { useState } from "react";
import { Crown, Shield, Eye, Edit, MoreHorizontal, UserCheck, Clock, Settings, LogOut, Trash2, Users, RefreshCw, Search, Filter, Info, Home, Mail, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  onEditFamily?: () => void;
  onDeleteFamily?: () => void;
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
  const [processingRequestAction, setProcessingRequestAction] = useState<'approve' | 'decline' | null>(null);
  const [processingInvitationId, setProcessingInvitationId] = useState<string | null>(null);
  const [processingInvitationAction, setProcessingInvitationAction] = useState<'accept' | 'decline' | null>(null);

  const [transferOwnershipModalOpen, setTransferOwnershipModalOpen] = useState(false);
  const [removeMemberModalOpen, setRemoveMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const currentUserMember = members.find(m => m.email === currentUserEmail);
  const currentUserRole = currentUserMember?.role;
  const isOwner = currentUserRole === "Owner";
  const isAdmin = currentUserRole === "Admin";
  const canManageRoles = isOwner || isAdmin;
  const canInviteMembers = currentUserRole === "Owner" || currentUserRole === "Admin";
  const canEditFamily = currentUserRole === "Owner" || currentUserRole === "Admin";
  const canDeleteFamily = currentUserRole === "Owner";
  const canApproveRequests = currentUserRole === "Owner" || currentUserRole === "Admin";

  const canManageMemberRole = (memberRole: string, memberEmail: string) => {
    const isTargetCurrentUser = memberEmail === currentUserEmail;
    
    if (currentUserRole === "Owner") {
      return !isTargetCurrentUser;
    }
    if (currentUserRole === "Admin") {
      return memberRole !== "Owner" && !isTargetCurrentUser;
    }
    return false;
  };

  const canRemoveMember = (memberRole: string, memberEmail: string) => {
    const isTargetCurrentUser = memberEmail === currentUserEmail;
    
    if (currentUserRole === "Owner") {
      return !isTargetCurrentUser;
    }
    if (currentUserRole === "Admin") {
      return (memberRole === "Member" || memberRole === "Viewer") && !isTargetCurrentUser;
    }
    return false;
  };

  const getRoleIcon = (role: string) => {
    const iconMap: Record<string, React.ElementType> = {
      "Crown": Crown,
      "Shield": Shield,
      "Edit": Edit,
      "Eye": Eye,
    };
    return iconMap[ROLE_ICONS[role as keyof typeof ROLE_ICONS]] || Eye;
  };

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
    setProcessingRequestAction('approve');
    await onApproveRequest(requestId);
    setProcessingRequestId(null);
    setProcessingRequestAction(null);
  };

  const handleDecline = async (requestId: string) => {
    setProcessingRequestId(requestId);
    setProcessingRequestAction('decline');
    await onDeclineRequest(requestId);
    setProcessingRequestId(null);
    setProcessingRequestAction(null);
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setProcessingInvitationId(invitationId);
    setProcessingInvitationAction('accept');
    await onRespondToInvitation?.(invitationId, true);
    setProcessingInvitationId(null);
    setProcessingInvitationAction(null);
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    setProcessingInvitationId(invitationId);
    setProcessingInvitationAction('decline');
    await onRespondToInvitation?.(invitationId, false);
    setProcessingInvitationId(null);
    setProcessingInvitationAction(null);
  };

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
        <div className="space-y-4 sm:space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 border-blue-100">
              <Skeleton width={160} height={14} className="mb-2 sm:w-[200px] sm:h-4" />
              <Skeleton width={200} height={10} className="mb-4 sm:mb-6 sm:w-[250px] sm:h-3" />
              <div className="space-y-3">
                {Array.from({ length: 1 }).map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 bg-white shadow-sm border-blue-100 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Skeleton width={32} height={32} borderRadius="50%" className="sm:w-10 sm:h-10" />
                        <div>
                          <Skeleton width={100} height={12} className="mb-1 sm:w-[120px]" />
                          <Skeleton width={120} height={10} className="sm:w-[150px]" />
                        </div>
                      </div>
                    </div>
                    <Skeleton width="100%" height={36} borderRadius={6} className="mb-3 sm:h-10" />
                    <div className="flex items-center gap-2">
                      <Skeleton width="50%" height={28} borderRadius={6} className="sm:h-8" />
                      <Skeleton width="50%" height={28} borderRadius={6} className="sm:h-8" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 sm:p-6 border-emerald-100">
              <Skeleton width={120} height={14} className="mb-2 sm:w-[150px] sm:h-4" />
              <Skeleton width={160} height={10} className="mb-4 sm:mb-6 sm:w-[200px] sm:h-3" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 bg-white shadow-sm border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Skeleton width={32} height={32} borderRadius="50%" className="sm:w-10 sm:h-10" />
                        <div>
                          <Skeleton width={100} height={12} className="mb-1 sm:w-[120px]" />
                          <Skeleton width={120} height={10} className="sm:w-[150px]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton width={50} height={28} borderRadius={6} className="sm:w-[60px] sm:h-8" />
                        <Skeleton width={50} height={28} borderRadius={6} className="sm:w-[60px] sm:h-8" />
                      </div>
                    </div>
                    <Skeleton width="100%" height={28} borderRadius={6} className="sm:h-8" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <Skeleton width={120} height={14} className="mb-2 sm:w-[150px] sm:h-4" />
                  <Skeleton width={160} height={10} className="sm:w-[200px] sm:h-3" />
                </div>
                <Skeleton width={120} height={28} borderRadius={6} className="sm:w-[150px] sm:h-8" />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <Skeleton width={32} height={32} borderRadius="50%" className="sm:w-10 sm:h-10" />
                      <Skeleton width={12} height={12} borderRadius="50%" className="absolute -bottom-0.5 -right-0.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton width={100} height={12} className="sm:w-[120px]" />
                        <Skeleton width={14} height={14} borderRadius="50%" />
                      </div>
                      <Skeleton width={120} height={10} className="sm:w-[150px]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Skeleton width={80} height={28} borderRadius={6} className="sm:w-[100px] sm:h-8" />
                      <Skeleton width={20} height={20} borderRadius={4} />
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <Skeleton width={24} height={16} borderRadius={4} />
                      <Skeleton width={50} height={24} borderRadius={6} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100">
              <Skeleton width="100%" height={36} borderRadius={6} className="sm:h-10" />
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Skeleton width={140} height={14} className="sm:w-[180px] sm:h-4" />
                <Skeleton width={16} height={16} borderRadius="50%" className="sm:w-5 sm:h-5" />
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-2 rounded border">
                    <Skeleton width={50} height={10} className="mb-1 sm:w-[60px] sm:h-3" />
                    <Skeleton width="100%" height={8} className="sm:h-3" />
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
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {pendingRequests.length > 0 ? (
          <Card className="p-4 sm:p-6 border-blue-100 hover:shadow-md transition-all group cursor-pointer">
            <div className="mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Pending Join Requests
                ({pendingRequests.length})
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">
                {canApproveRequests 
                  ? "Review and approve family member requests" 
                  : "Only admins and owners can approve join requests"}
              </p>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-3 sm:p-4 bg-white shadow-sm border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {request.avatar ? (
                        <img
                          src={request.avatar}
                          alt={request.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-emerald-600 font-medium text-xs sm:text-sm">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">{request.name}</p>
                        <p className="text-[10px] text-slate-500 font-light">
                          {request.email} • Requested {formatRelativeTime(request.requestedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-600 mb-3 italic px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg">
                    "{request.message}"
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8"
                      onClick={() => handleApprove(request.id)}
                      disabled={!canApproveRequests || processingRequestId === request.id}
                      title={!canApproveRequests ? "Only admins and owners can approve requests" : ""}
                    >
                      {processingRequestId === request.id && processingRequestAction === 'approve' ? (
                        <>
                          <Loader2 size={12} className="animate-spin mr-1 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Approving...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8"
                      onClick={() => handleDecline(request.id)}
                      disabled={!canApproveRequests || processingRequestId === request.id}
                      title={!canApproveRequests ? "Only admins and owners can decline requests" : ""}
                    >
                      {processingRequestId === request.id && processingRequestAction === 'decline' ? (
                        <>
                          <Loader2 size={12} className="animate-spin mr-1 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Declining...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                          Decline
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-4 sm:p-6 border-slate-100">
            <div className="mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Pending Join Requests
                (0)
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">
                {canApproveRequests 
                  ? "Review and approve family member requests" 
                  : "Only admins and owners can approve join requests"}
              </p>
            </div>
            <div className="text-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <UserCheck className="text-slate-300 w-5 h-5 sm:w-7 sm:h-7" size={28} />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1">No Pending Requests</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 px-4 sm:px-8 leading-relaxed">
                When someone requests to join your family group, they'll appear here for your review.
              </p>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6 border-emerald-100 hover:shadow-md transition-all group cursor-pointer">
          <div className="mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              My Invitations
              {invitations.length > 0 && ` (${invitations.length})`}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">Invitations to join other family groups</p>
          </div>

          {invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="p-3 sm:p-4 bg-white shadow-sm border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {invitation.inviterAvatar ? (
                        <img
                          src={invitation.inviterAvatar}
                          alt={invitation.inviterName}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 border border-slate-200 italic font-serif text-sm sm:text-base">
                          {invitation.inviterName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">{invitation.familyName}</p>
                        <p className="text-[10px] text-slate-500 font-light">
                          From {invitation.inviterName} • {formatRelativeTime(invitation.invitedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-xs px-2 sm:px-3 h-7 sm:h-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        disabled={processingInvitationId === invitation.id}
                      >
                        {processingInvitationId === invitation.id && processingInvitationAction === 'accept' ? (
                          <>
                            <Loader2 size={12} className="animate-spin mr-1 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden sm:inline">Accepting...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          "Accept"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 sm:px-3 h-7 sm:h-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        disabled={processingInvitationId === invitation.id}
                      >
                        {processingInvitationId === invitation.id && processingInvitationAction === 'decline' ? (
                          <>
                            <Loader2 size={12} className="animate-spin mr-1 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden sm:inline">Declining...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          "Decline"
                        )}
                      </Button>
                    </div>
                  </div>
                  {invitation.message && (
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-0 italic px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-100 bg-slate-50/50 rounded-lg">
                      "{invitation.message}"
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Mail className="text-slate-300 w-5 h-5 sm:w-7 sm:h-7" size={28} />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1">No Pending Invitations</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 px-4 sm:px-8 leading-relaxed">
                When someone invites you to join their family dashboard, it will appear here.
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Family Members ({members.length})
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-light">
                {canManageRoles ? "Manage current family members and their roles" : "View current family members"}
              </p>
            </div>
            {currentUserRole === "Owner" && onTransferOwnership && members.filter(m => m.id !== currentUserMember?.id && m.status === "active").length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-emerald-600 hover:bg-transparent transition-colors flex items-center gap-1 h-7 sm:h-8 px-2"
                onClick={handleOpenTransferOwnership}
              >
                <Crown size={12} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Transfer Ownership</span>
                <span className="sm:hidden">Transfer</span>
              </Button>
            )}
          </div>
        </div>
            {members.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {members.map((member) => {
                  const RoleIcon = getRoleIcon(member.role);
                  const isOwner = member.role === "Owner";
                  const isCurrentUser = member.email === currentUserEmail;

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-slate-100 rounded-xl group hover:shadow-md transition-all cursor-pointer gap-3 sm:gap-0"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative shrink-0">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-100"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm border ${member.role === "Owner"
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
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{member.name}</p>
                            {isOwner && (
                              <Crown className="text-amber-500 w-3 h-3 sm:w-3.5 sm:h-3.5" size={14} />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-light truncate">
                            {member.email} • Joined {member.joinedAt || "Jan 2025"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {canManageMemberRole(member.role, member.email) ? (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <RoleDropdown
                              value={roleChanges[member.id] || member.role}
                              onChange={(value) => handleRoleChange(member.id, value)}
                              options={getRoleOptions(member.role)}
                              disabled={false}
                              className="min-w"
                            />
                            
                            {canRemoveMember(member.role, member.email) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-transparent transition-colors p-1 h-7 sm:h-8"
                                onClick={() => handleOpenRemoveMember(member)}
                                title="Remove member"
                              >
                                <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-medium text-slate-600">
                            {member.role}
                          </span>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {isCurrentUser && (
                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">You</span>
                          )}
                          {isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[10px] sm:text-xs text-slate-400 hover:text-rose-500 hover:bg-transparent transition-colors flex items-center gap-1 h-7 sm:h-8 px-1.5 sm:px-2"
                              onClick={onLeaveFamily}
                            >
                              <LogOut size={12} className="sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">Leave</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" size={32} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No Family Members Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                  Your family group doesn't have any members yet.
                </p>
                <div className="text-[10px] sm:text-xs text-slate-400">
                  Invite family members to start collaborating on budgets and goals together.
                </div>
              </div>
            )}
            
            {canManageRoles && Object.keys(roleChanges).length > 0 && (
              <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-xs justify-center py-2 sm:py-2.5 h-8 sm:h-10" 
                    onClick={handleCancelRoleChanges}
                    disabled={savingRoles}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1 text-xs justify-center py-2 sm:py-2.5 h-8 sm:h-10" onClick={handleSaveRoles} disabled={savingRoles}>
                    {savingRoles ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-white" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800">
                  <span className="flex items-center gap-2">
                    <Shield size={14} className="sm:w-4 sm:h-4" />
                    About Roles & Permissions
                  </span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs sm:text-sm">▼</span>
                </summary>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-xs">
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
                  <p className="mt-2 text-[10px] sm:text-xs text-slate-600">
                    As an Admin, you can manage Members and Viewers, but not Owners or other Admins.
                  </p>
                )}
                {currentUserRole === "Owner" && (
                  <p className="mt-2 text-[10px] sm:text-xs text-slate-600">
                    As Owner, you have complete control over all family members and settings.
                  </p>
                )}
              </details>
            </div>
          </Card>

      <TransferOwnershipModal
        open={transferOwnershipModalOpen}
        onClose={handleCloseTransferOwnership}
        onConfirm={handleTransferOwnership}
        familyMembers={members}
        currentOwnerId={currentUserMember?.id || ""}
      />

      <RemoveMemberModal
        open={removeMemberModalOpen}
        onClose={handleCloseRemoveMember}
        onConfirm={handleRemoveMember}
        member={selectedMember}
      />

    </div>
  );
}
