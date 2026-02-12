"use client";

import React, { useState } from "react";
import { Crown, Shield, Eye, Edit, MoreHorizontal, UserCheck, Clock, Settings, LogOut, Trash2, Users, RefreshCw, Search, Filter, Info, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EditFamilyModal, DeleteFamilyModal, LeaveFamilyModal } from "../index";
import { ROLE_ICONS } from "../constants";
import type { FamilyMember, JoinRequest, PublicFamily, Family } from "../types";

interface MembersTabProps {
  familyData: Family | null;
  members: FamilyMember[];
  pendingRequests: JoinRequest[];
  publicFamilies?: PublicFamily[];
  onUpdateRole: (memberId: string, role: string) => void;
  onApproveRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onEditFamily: () => void;
  onDeleteFamily: () => void;
  onLeaveFamily: () => void;
  onJoinFamily: (familyId: string) => void;
  onRefreshFamilies: () => void;
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
  isLoading = false,
}: MembersTabProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [roleChanges, setRoleChanges] = useState<Record<string, string>>({});

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

  const handleSaveRoles = () => {
    Object.entries(roleChanges).forEach(([memberId, role]) => {
      onUpdateRole(memberId, role);
    });
    setRoleChanges({});
  };

  const handleEditFamilyClick = () => {
    setEditModalOpen(true);
  };

  const handleDeleteFamilyClick = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(true);
  };

  const handleLeaveFamilyClick = () => {
    setLeaveModalOpen(true);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Join Requests Section */}
        <div className="lg:col-span-2 space-y-6">
          {pendingRequests.length > 0 && (
            <Card className="p-6 border-blue-100 hover:shadow-md transition-all group cursor-pointer">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <UserCheck className="text-blue-600" size={18} />
                Pending Join Requests
                <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingRequests.length}
                </Badge>
              </h3>
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
                            {request.email} • Requested 2 days ago
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
                        onClick={() => onApproveRequest(request.id)}
                      >
                        <UserCheck size={14} className="mr-1" />
                        Approve as Member
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeclineRequest(request.id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Current Family Members List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Family Members ({members.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={handleEditFamilyClick}>
                <Settings size={16} className="mr-2" />
                Family Settings
              </Button>
            </div>
            <div className="space-y-4">
              {members.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                const isOwner = member.role === "Owner";
                const isCurrentUser = member.email === "john@budgetme.app"; // TODO: Get from auth context

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl group hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm border ${
                            member.role === "Owner"
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
                            onClick={handleLeaveFamilyClick}
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
          </Card>
        </div>

        {/* Role Management and Info */}
        <div className="space-y-6">
          {/* Role Management interface */}
          <Card className="p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="text-purple-600" size={18} />
                Role Management
              </h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-medium text-slate-400 hover:text-purple-600">
                Info
              </Button>
            </div>
            <div className="space-y-4">
              {members
                .filter(m => m.role !== "Owner")
                .map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-lg hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-[10px] flex-shrink-0 border ${
                          member.role === "Admin"
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
              <Button className="w-full text-xs justify-center py-2.5" onClick={handleSaveRoles}>
                <Crown className="text-amber-500 mr-2" size={14} />
                Save Role Changes
              </Button>
            )}
          </Card>

          {/* Info Card */}
          <Card className="p-6 border-emerald-100 hover:shadow-md transition-all group cursor-pointer">
            <h4 className="text-sm font-semibold text-emerald-900 flex items-center gap-2 mb-2">
              <Info size={18} />
              About Roles
            </h4>
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

      {/* Discover Families Section */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Discover Families</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-light">
              Find and join other public family groups in your network.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] font-medium text-slate-400 hover:text-emerald-600 flex items-center gap-1"
            onClick={onRefreshFamilies}
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicFamilies.map((family) => (
            <Card
              key={family.id}
              className="p-5 hover:shadow-md transition-all group cursor-pointer"
              onClick={() => onJoinFamily(family.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-blue-100 flex items-center justify-center text-blue-600 transition-colors group-hover:scale-110">
                    <Home size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{family.name}</h4>
                    <p className="text-[10px] text-slate-500">Created by {family.createdBy}</p>
                  </div>
                </div>
                <Badge className="text-[9px] flex items-center gap-1">
                  <Users size={12} />
                  {family.memberCount} members
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mb-4 font-light leading-relaxed">
                "Managing our household expenses and savings goals together for our new home."
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[9px] text-slate-400">
                  Public • Created Jan 15
                </span>
                <Button
                  size="sm"
                  className="text-xs py-1.5 bg-emerald-500 hover:bg-emerald-600"
                >
                  Request Join
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <EditFamilyModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onDeleteFamily={handleDeleteFamilyClick}
      />
      <DeleteFamilyModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
      <LeaveFamilyModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
      />
    </div>
  );
}
