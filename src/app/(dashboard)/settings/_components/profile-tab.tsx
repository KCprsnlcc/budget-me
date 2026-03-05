"use client";

import { useState, useEffect } from "react";
import { Camera, Lock, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-context";
import { getUserProfile, updateUserProfile, uploadProfilePicture } from "../_lib/settings-service";

export function ProfileTab() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    email: "",
    avatarUrl: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    email: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const profile = await getUserProfile(user.id);
        if (profile) {
          const [firstName = "", lastName = ""] = (profile.full_name || "").split(" ");
          const data = {
            firstName,
            lastName,
            phone: profile.phone || "",
            dateOfBirth: profile.date_of_birth || "",
            email: profile.email || user.email || "",
            avatarUrl: profile.avatar_url || "",
          };
          setOriginalData(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            email: data.email,
          });
          setAvatarUrl(data.avatarUrl);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: originalData.firstName,
      lastName: originalData.lastName,
      phone: originalData.phone,
      dateOfBirth: originalData.dateOfBirth,
      email: originalData.email,
    });
    setHasChanges(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const result = await updateUserProfile(user.id, formData);
      
      if (result.success) {
        setOriginalData({
          ...originalData,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
        });
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadProfilePicture(user.id, file);
      
      if (result.success && result.url) {
        setAvatarUrl(result.url);
      }
    } catch (error) {
      console.error("Error uploading picture:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=10b981&color=fff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer">
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Camera size={14} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Profile Picture</h4>
          <p className="text-[10px] text-slate-400 flex items-center">
            <Info size={10} className="mr-1" />
            JPEG, PNG, GIF, or WebP (max 5MB)
          </p>
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
              disabled={!hasChanges || isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="bg-emerald-500 hover:bg-emerald-600" 
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
