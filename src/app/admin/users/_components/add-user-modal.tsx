"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { UserFormState } from "../_lib/types";
import { createUser } from "../_lib/user-service";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, Check, User as UserIcon, Shield, Key, Copy, CheckCircle, ClipboardCheck, PenSquare, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DateSelector } from "@/components/ui/date-selector";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = ["Role Type", "Details", "Review"];

const ROLES = [
  { value: "user", label: "User", desc: "Standard user with basic permissions and access to personal features." },
  { value: "admin", label: "Admin", desc: "Full system access with administrative privileges and user management." },
];

// Password generator function
function generatePassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = "";
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormState>({
    email: "",
    full_name: "",
    role: "user",
    phone: "",
    date_of_birth: "",
    timezone: "Asia/Manila",
    language: "en",
    currency_preference: "PHP",
    is_active: true,
    password: generatePassword(),
  });

  const handleClose = () => {
    setCurrentStep(1);
    setCopied(false);
    setFormData({
      email: "",
      full_name: "",
      role: "user",
      phone: "",
      date_of_birth: "",
      timezone: "Asia/Manila",
      language: "en",
      currency_preference: "PHP",
      is_active: true,
      password: generatePassword(),
    });
    onClose();
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password || "");
      setCopied(true);
      toast.success("Password copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy password");
    }
  };

  const handleGeneratePassword = () => {
    setFormData({ ...formData, password: generatePassword() });
    setCopied(false);
    toast.success("New password generated");
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.role) {
        toast.error("Please select a role");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.email || !formData.full_name || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createUser(formData);
      toast.success("User created successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Add New User
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {currentStep} of 3
          </span>
        </div>
      </ModalHeader>
      
      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={currentStep} />
      
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">

        {/* Step 1: Role Type */}
        {currentStep === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1">User Role</h2>
              <p className="text-[11px] text-slate-500">Select the role and permissions for this user.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map(({ value, label, desc }, idx) => {
                const selected = formData.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: value as any })}
                    className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${
                      selected
                        ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                    }`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${
                          selected
                            ? "text-slate-700 border-slate-200"
                            : "text-slate-400 border-slate-100"
                        }`}
                      >
                        {value === "admin" ? <Shield size={18} /> : <UserIcon size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">{label}</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                      <div
                        className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${
                          selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        }`}
                      >
                        <Check size={10} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: User Details */}
        {currentStep === 2 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 bg-white">
                  <PenSquare size={14} />
                </div>
                User Details
              </h2>
            </div>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Email Address <span className="text-slate-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="user@example.com"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Full Name <span className="text-slate-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="John Doe"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Password <span className="text-slate-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 pr-10 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06] font-mono"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-emerald-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    className="px-3"
                  >
                    {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="px-3"
                  >
                    <Key size={14} />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Click the key icon to generate a new secure password
                </p>
              </div>

              {/* Phone + Date of Birth */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                    Date of Birth
                  </label>
                  <DateSelector
                    value={formData.date_of_birth}
                    onChange={(value) => setFormData({ ...formData, date_of_birth: value })}
                    placeholder="Select date of birth"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Status
                </label>
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  label="Account Active"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1 flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 bg-white">
                  <ClipboardCheck size={14} />
                </div>
                Review &amp; Confirm
              </h2>
            </div>
            <div className="space-y-4">
              {/* User Role Display */}
              <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">User Role</div>
                <div className="flex items-center justify-center gap-2 my-2">
                  {formData.role === "admin" ? (
                    <Shield size={20} className="text-emerald-500" />
                  ) : (
                    <UserIcon size={20} className="text-emerald-500" />
                  )}
                  <span className="text-[24px] font-bold text-slate-900">
                    {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white text-slate-500 uppercase tracking-wider inline-block mt-2 border border-slate-100">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Review Details */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <ReviewRow label="Full Name" value={formData.full_name || "—"} />
                  <ReviewRow label="Email" value={formData.email || "—"} />
                  <ReviewRow label="Password" value="••••••••••••" />
                  <ReviewRow label="Phone" value={formData.phone || "Not provided"} />
                  <ReviewRow label="Date of Birth" value={formData.date_of_birth || "Not provided"} />
                </div>
              </div>

              {/* Warning Notice */}
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">Action is final</h4>
                  <p className="text-[11px] leading-relaxed">
                    The user account will be created immediately. Make sure to save the generated password securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button variant="secondary" size="sm" onClick={handleBack} disabled={loading}>
            <ArrowLeft size={14} /> Back
          </Button>
        ) : (
          <div />
        )}
        {currentStep < STEPS.length ? (
          <Button size="sm" onClick={handleNext} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
            Continue <ArrowRight size={14} />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
            {loading ? (<><Loader2 size={14} className="animate-spin" /> Creating...</>) : (<>Create User <Check size={14} /></>)}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</span>
      <span className="text-[13px] font-semibold text-slate-700">{value}</span>
    </div>
  );
}
