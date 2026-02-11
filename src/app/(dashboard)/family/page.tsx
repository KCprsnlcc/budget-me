import {
  Users,
  Plus,
  Crown,
  Shield,
  Eye,
  Edit,
  MoreHorizontal,
  Mail,
  UserCheck,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export const metadata = { title: "BudgetMe - Family" };

const FAMILY_MEMBERS = [
  {
    name: "John Doe",
    email: "john@budgetme.site",
    initials: "JD",
    role: "Owner",
    status: "active",
    lastActive: "Now",
    permissions: ["Full Access"],
    spending: 3200,
    budget: 5000,
  },
  {
    name: "Sarah Doe",
    email: "sarah@budgetme.site",
    initials: "SD",
    role: "Admin",
    status: "active",
    lastActive: "2h ago",
    permissions: ["View", "Edit", "Budget"],
    spending: 1800,
    budget: 3000,
  },
  {
    name: "Mike Doe",
    email: "mike@budgetme.site",
    initials: "MD",
    role: "Member",
    status: "active",
    lastActive: "1d ago",
    permissions: ["View", "Add Transactions"],
    spending: 450,
    budget: 800,
  },
  {
    name: "Emma Doe",
    email: "emma@budgetme.site",
    initials: "ED",
    role: "Viewer",
    status: "pending",
    lastActive: "Invited",
    permissions: ["View Only"],
    spending: 0,
    budget: 500,
  },
];

const SHARED_GOALS = [
  { name: "Family Vacation Fund", saved: 2400, target: 5000, members: 3 },
  { name: "Home Renovation", saved: 8500, target: 20000, members: 2 },
  { name: "Emergency Fund", saved: 12000, target: 15000, members: 4 },
];

const ROLE_ICONS: Record<string, React.ElementType> = {
  Owner: Crown,
  Admin: Shield,
  Member: Edit,
  Viewer: Eye,
};

export default function FamilyPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <Users size={20} className="text-slate-400" />
            Family Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage family members and shared finances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Mail size={14} /> Send Invite
          </Button>
          <Button size="sm">
            <Plus size={14} /> Add Member
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Members</div>
          <div className="text-lg font-bold text-slate-900 mt-1">4</div>
          <div className="text-[10px] text-emerald-600 mt-1">3 active, 1 pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Combined Budget</div>
          <div className="text-lg font-bold text-slate-900 mt-1">$9,300</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Total Spending</div>
          <div className="text-lg font-bold text-slate-900 mt-1">$5,450</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Shared Goals</div>
          <div className="text-lg font-bold text-slate-900 mt-1">3</div>
        </Card>
      </div>

      {/* Members */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Family Members</h3>
        <div className="space-y-4">
          {FAMILY_MEMBERS.map((member) => {
            const RoleIcon = ROLE_ICONS[member.role] || Eye;
            return (
              <div key={member.email} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{member.name}</h4>
                    <Badge variant={member.status === "active" ? "success" : "warning"}>
                      {member.status === "active" ? (
                        <><UserCheck size={10} className="mr-1" /> Active</>
                      ) : (
                        <><Clock size={10} className="mr-1" /> Pending</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{member.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <RoleIcon size={10} className="text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-500">{member.role}</span>
                    <span className="text-[10px] text-slate-300 mx-1">&bull;</span>
                    <span className="text-[10px] text-slate-400">{member.lastActive}</span>
                  </div>
                </div>
                <div className="hidden md:block w-40">
                  <div className="flex items-center justify-between mb-1 text-[10px]">
                    <span className="text-slate-400">${member.spending}</span>
                    <span className="text-slate-400">${member.budget}</span>
                  </div>
                  <ProgressBar
                    value={member.spending}
                    max={member.budget}
                    color={member.spending / member.budget > 0.9 ? "danger" : "success"}
                  />
                </div>
                <button className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Shared Goals */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">Shared Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHARED_GOALS.map((goal) => (
            <div key={goal.name} className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="text-xs font-semibold text-slate-800 mb-3">{goal.name}</h4>
              <div className="flex items-center justify-between mb-1.5 text-[10px]">
                <span className="text-slate-500">${goal.saved.toLocaleString()}</span>
                <span className="text-slate-400">${goal.target.toLocaleString()}</span>
              </div>
              <ProgressBar value={goal.saved} max={goal.target} color="brand" className="mb-2" />
              <div className="text-[10px] text-slate-400">
                {goal.members} members contributing &bull; {Math.round((goal.saved / goal.target) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
