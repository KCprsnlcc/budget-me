import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "BudgetMe - Settings" };

const NOTIFICATION_SETTINGS = [
  { label: "Budget alerts", description: "Get notified when approaching budget limits", enabled: true },
  { label: "Weekly summary", description: "Receive a weekly financial summary email", enabled: true },
  { label: "Goal milestones", description: "Notifications when you reach savings milestones", enabled: true },
  { label: "AI insights", description: "Get AI-generated spending insights", enabled: false },
  { label: "Family activity", description: "Notifications about family member actions", enabled: true },
];

const SECURITY_OPTIONS = [
  { label: "Two-factor authentication", description: "Add extra security to your account", status: "Enabled", icon: Shield },
  { label: "Login notifications", description: "Get notified of new sign-ins", status: "Enabled", icon: Bell },
  { label: "Session management", description: "Manage active sessions", status: "3 active", icon: Smartphone },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings size={20} className="text-slate-400" />
          Settings
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your account preferences and configuration
        </p>
      </div>

      {/* Profile */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <User size={14} className="text-slate-400" /> Profile
        </h3>
        <div className="flex items-start gap-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 text-slate-600 text-lg font-bold shrink-0">
            JD
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" defaultValue="john@budgetme.site" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm">Save Changes</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Bell size={14} className="text-slate-400" /> Notifications
        </h3>
        <div className="space-y-4">
          {NOTIFICATION_SETTINGS.map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-xs font-medium text-slate-800">{setting.label}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{setting.description}</p>
              </div>
              <button
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${setting.enabled ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${setting.enabled ? "left-5.5 translate-x-0" : "left-0.5"}`} style={{ left: setting.enabled ? "1.25rem" : "0.125rem" }} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Palette size={14} className="text-slate-400" /> Appearance
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Light", icon: Sun, active: true },
            { label: "Dark", icon: Moon, active: false },
            { label: "System", icon: Smartphone, active: false },
          ].map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.label}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${theme.active ? "border-emerald-500 bg-emerald-50/50 text-emerald-700" : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300"}`}
              >
                <Icon size={20} className="mx-auto mb-2" />
                <span className="text-xs font-medium">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Security */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Lock size={14} className="text-slate-400" /> Security
        </h3>
        <div className="space-y-3">
          {SECURITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.label} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-slate-400" />
                  <div>
                    <h4 className="text-xs font-medium text-slate-800">{option.label}</h4>
                    <p className="text-[10px] text-slate-400">{option.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{option.status}</Badge>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <Globe size={14} className="text-slate-400" /> Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Currency</Label>
            <select className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-emerald-500">
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
              <option>PHP - Philippine Peso</option>
            </select>
          </div>
          <div>
            <Label>Date format</Label>
            <select className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-emerald-500">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-5 border-red-200">
        <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-[11px] text-slate-400 mb-4">Irreversible actions that affect your account</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm">
            <Download size={14} /> Export All Data
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 size={14} /> Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
