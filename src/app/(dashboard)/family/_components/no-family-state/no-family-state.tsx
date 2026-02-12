"use client";

import React, { useState } from "react";
import { Users, Plus, Search, Mail, Home, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateFamilyModal, InviteMemberModal } from "../index";
import { NO_FAMILY_TABS, NO_FAMILY_FEATURES } from "../constants";
import type { NoFamilyTab, PublicFamily, Invitation } from "../types";

interface NoFamilyStateProps {
  onCreateFamily: () => void;
  onJoinFamily: (familyId: string) => void;
  onCheckInvitations: () => void;
  publicFamilies?: PublicFamily[];
  invitations?: Invitation[];
  isLoading?: boolean;
}

export function NoFamilyState({
  onCreateFamily,
  onJoinFamily,
  onCheckInvitations,
  publicFamilies = [],
  invitations = [],
  isLoading = false,
}: NoFamilyStateProps) {
  const [activeTab, setActiveTab] = useState<NoFamilyTab>("create");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleTabChange = (tab: NoFamilyTab) => {
    setActiveTab(tab);
  };

  const handleCreateFamily = () => {
    setCreateModalOpen(true);
  };

  const handleJoinFamily = (familyId: string) => {
    onJoinFamily(familyId);
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
              <div className="max-w-md mx-auto">
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Nearby Groups
                    </span>
                    <span className="text-[10px] text-emerald-500 font-medium">
                      Auto-discovery on
                    </span>
                  </div>
                  {publicFamilies.map((family) => (
                    <div
                      key={family.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-slate-50 transition-all cursor-pointer group"
                      onClick={() => handleJoinFamily(family.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                            <Users size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-900">{family.name}</h4>
                            <p className="text-[10px] text-slate-400">
                              {family.memberCount} active members
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-50"
                        >
                          Request
                        </Button>
                      </div>
                    </div>
                  ))}
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
            <div className="max-w-md mx-auto">
              {invitations.length > 0 ? (
                invitations.map((invitation) => (
                  <Card key={invitation.id} className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-5 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center text-slate-600">
                        <Mail size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{invitation.familyName}</p>
                        <p className="text-[11px] text-slate-400">
                          Invited by <span className="text-slate-600 font-medium">{invitation.inviterName}</span>
                        </p>
                      </div>
                    </div>
                    {invitation.message && (
                      <p className="text-xs text-slate-600 italic px-3 py-2 bg-slate-50 rounded-lg">
                        "{invitation.message}"
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => onCheckInvitations()}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCheckInvitations()}
                      >
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <Mail className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Invitations</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    You don't have any pending family invitations.
                  </p>
                  <Button variant="outline" onClick={() => onCheckInvitations()}>
                    Check Again
                  </Button>
                </div>
              )}
            </div>
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
