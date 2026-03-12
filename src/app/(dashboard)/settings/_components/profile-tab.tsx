"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Lock, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateSelector } from "@/components/ui/date-selector";
import { useAuth } from "@/components/auth/auth-context";
import { getUserProfile, updateUserProfile, uploadProfilePicture } from "../_lib/settings-service";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading]);

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
      <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
        <div className="p-6 space-y-8 animate-in fade-in duration-300">
          {}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <Skeleton circle width={80} height={80} />
            <div className="flex-1">
              <Skeleton width={150} height={14} className="mb-2" />
              <Skeleton width={200} height={10} />
            </div>
          </div>

          {}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton width={80} height={12} />
                <Skeleton height={40} borderRadius={8} />
              </div>
              <div className="space-y-2">
                <Skeleton width={80} height={12} />
                <Skeleton height={40} borderRadius={8} />
              </div>
              <div className="space-y-2">
                <Skeleton width={100} height={12} />
                <Skeleton height={40} borderRadius={8} />
              </div>
              <div className="space-y-2">
                <Skeleton width={90} height={12} />
                <Skeleton height={40} borderRadius={8} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton width={100} height={12} />
                <Skeleton height={40} borderRadius={8} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Skeleton width={120} height={12} />
              <div className="flex items-center gap-3">
                <Skeleton width={70} height={36} borderRadius={6} />
                <Skeleton width={110} height={36} borderRadius={6} />
              </div>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div ref={containerRef} className="p-6 space-y-8 animate-in fade-in duration-300">
      {}
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
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {formData.firstName} {formData.lastName}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Update your profile information</p>
        </div>
      </div>

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
            <DateSelector
              value={formData.dateOfBirth}
              onChange={(value) => handleChange("dateOfBirth", value)}
              placeholder="Select date of birth"
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
