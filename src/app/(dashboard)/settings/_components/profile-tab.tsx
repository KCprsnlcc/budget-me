"use client";

import { useState } from "react";
import { Camera, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileTab() {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    email: "john@budgetme.app",
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: "John",
      lastName: "Doe",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1990-05-15",
      email: "john@budgetme.app",
    });
    setHasChanges(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle save
    setHasChanges(false);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
            <img
              src={`https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=10b981&color=fff`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Profile Picture</h4>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="text-xs w-fit">
              <Camera size={14} className="mr-2" />
              Upload New Picture
            </Button>
            <p className="text-[10px] text-slate-400 flex items-center">
              <Info size={10} className="mr-1" />
              JPEG, PNG, GIF, or WebP (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">First Name</Label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Enter first name"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">Last Name</Label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Enter last name"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">Phone Number</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">Date of Birth</Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-medium text-slate-700">Email Address</Label>
            <div className="relative">
              <Input
                type="email"
                value={formData.email}
                readOnly
                className="h-10 bg-slate-50 text-slate-500 cursor-not-allowed pr-10"
              />
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400">
              Contact support to change your email address.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className={`text-xs text-slate-400 italic transition-opacity ${hasChanges ? "opacity-100" : "opacity-0"}`}>
            Unsaved changes...
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={!hasChanges}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600" disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
