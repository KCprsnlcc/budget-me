"use client";

import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { User, UserFormState } from "../_lib/types";
import { updateUser } from "../_lib/user-service";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, Check, User as UserIcon, Shield, ClipboardCheck, SquarePen as PenSquare, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DateSelector } from "@/components/ui/date-selector";
import { Stepper } from "./stepper";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const STEPS = ["Role Type", "Details", "Review"];

const ROLES = [
  { value: "user", label: "User", desc: "Standard user with basic permissions and access to personal features." },
  { value: "admin", label: "Admin", desc: "Full system access with administrative privileges and user management." },
];

export function EditUserModal({ open, onClose, user, onSuccess }: EditUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserFormState>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        role: user.role,
        phone: user.phone || "",
        date_of_birth: user.date_of_birth || "",
        timezone: user.timezone || "Asia/Manila",
        language: user.language || "en",
        currency_preference: user.currency_preference || "PHP",
        is_active: user.is_active,
      });
      setCurrentStep(1);
    }
  }, [user, open]);

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.role) {
        toast.error("Please select a role");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.full_name) {
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
    if (!user) return;

    try {
      setLoading(true);
      await updateUser(user.id, formData);
      toast.success("User updated successfully");
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={handleClose} className="max-w-2xl">
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Edit User
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {currentStep} of 3
          </span>
        </div>
      </ModalHeader>

      {}
      <Stepper steps={STEPS} currentStep={currentStep} />

      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {}
        {currentStep === 1 && (
          <div className="animate-txn-in">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 mb-1">User Role</h2>
              <p className="text-[11px] text-slate-500">
                Current role:{" "}
                <span className="font-semibold text-emerald-600">
                  {formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : "—"}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map(({ value, label, desc }, idx) => {
                const selected = formData.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: value as any })}
                    className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${selected
                      ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                      }`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${selected
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
                        className={`w-[18px] h-[18px] rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
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

        {}
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
              {}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 text-[13px] bg-[#F9FAFB]/50 border border-slate-200 rounded-lg text-slate-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed</p>
              </div>

              {}
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

              {}
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
                    value={formData.date_of_birth || ""}
                    onChange={(value) => setFormData({ ...formData, date_of_birth: value })}
                    placeholder="Select date of birth"
                    className="w-full"
                  />
                </div>
              </div>

              {}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                  Status
                </label>
                <Checkbox
                  id="is_active_edit"
                  checked={formData.is_active || false}
                  onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  label="Account Active"
                />
              </div>
            </div>
          </div>
        )}

        {}
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
              {}
              <div className="text-center p-6 bg-[#F9FAFB]/50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Updated Role</div>
                <div className="flex items-center justify-center gap-2 my-2">
                  {formData.role === "admin" ? (
                    <Shield size={20} className="text-emerald-500" />
                  ) : (
                    <UserIcon size={20} className="text-emerald-500" />
                  )}
                  <span className="text-[24px] font-bold text-slate-900">
                    {formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : "—"}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white text-slate-500 uppercase tracking-wider inline-block mt-2 border border-slate-100">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-0 divide-y divide-slate-100">
                  <ReviewRow label="Full Name" value={formData.full_name || "—"} />
                  <ReviewRow label="Email" value={user.email} />
                  <ReviewRow label="Phone" value={formData.phone || "Not provided"} />
                  <ReviewRow label="Date of Birth" value={formData.date_of_birth || "Not provided"} />
                </div>
              </div>

              {}
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">Changes Summary</h4>
                  <p className="text-[11px] leading-relaxed">
                    Review your changes before saving. The user account will be updated immediately.
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
            {loading ? (<><Loader2 size={14} className="animate-spin" /> Saving...</>) : (<>Save Changes <Check size={14} /></>)}
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
