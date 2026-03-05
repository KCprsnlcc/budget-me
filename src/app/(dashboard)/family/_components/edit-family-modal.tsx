"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Home, FileText, PhilippinePeso, Info, ArrowRight, ArrowLeft, Check, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Stepper } from "./stepper";
import { FAMILY_TYPES, DEFAULT_CURRENCY } from "./constants";
import type { EditFamilyData, ModalStep, Family } from "./types";

const STEPS = ["Details", "Review"];

interface EditFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onDeleteFamily?: () => void;
  onUpdateFamily?: (form: EditFamilyData) => Promise<{ error: string | null }>;
  familyData?: Family | null;
  canDeleteFamily?: boolean;
}

export function EditFamilyModal({ open, onClose, onDeleteFamily, onUpdateFamily, familyData, canDeleteFamily = true }: EditFamilyModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(1);
  const [formData, setFormData] = useState<EditFamilyData>({
    name: familyData?.name ?? "",
    description: familyData?.description ?? "",
    visibility: familyData?.type ?? "private",
  });

  // Sync form data when familyData changes
  useEffect(() => {
    if (familyData && open) {
      setFormData({
        name: familyData.name,
        description: familyData.description ?? "",
        visibility: familyData.type,
      });
    }
  }, [familyData, open]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setSubmitError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue = currentStep === 1 || currentStep === 2;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = useCallback(async () => {
    if (currentStep >= 2) {
      if (onUpdateFamily) {
        setSubmitting(true);
        setSubmitError(null);
        const result = await onUpdateFamily(formData);
        setSubmitting(false);
        if (result.error) {
          setSubmitError(result.error);
          return;
        }
      }
      handleClose();
      return;
    }
    setCurrentStep((s) => (s + 1) as ModalStep);
  }, [currentStep, handleClose, onUpdateFamily, formData]);

  const handleBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => (s - 1) as ModalStep);
  }, [currentStep]);

  const updateFormData = useCallback(
    <K extends keyof EditFamilyData>(key: K, value: EditFamilyData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleDeleteFamily = useCallback(() => {
    handleClose();
    if (onDeleteFamily) {
      onDeleteFamily();
    }
  }, [handleClose, onDeleteFamily]);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Edit Family
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Step {currentStep} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper currentStep={currentStep} totalSteps={2} labels={STEPS} />

      {/* Body */}
      <ModalBody className="px-5 py-5 bg-[#F9FAFB]/30">
        {/* STEP 1: Family Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Family Details
              </h4>
              <p className="text-xs text-slate-500">
                Update your family group information.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Family Name <span className="text-gray-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  placeholder="Enter family name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Description <span className="text-gray-400 font-normal lowercase tracking-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                  rows={3}
                  placeholder="Brief description of your family"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-[0.04em]">
                  Visibility
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(FAMILY_TYPES).map(([key, type], idx) => {
                    const selected = formData.visibility === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateFormData("visibility", key as "private" | "public")}
                        className={`relative p-4 rounded-xl border cursor-pointer text-left transition-all duration-200 bg-white ${
                          selected
                            ? "border-emerald-500 shadow-[0_0_0_1px_#10b981]"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                        }`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border transition-all duration-200 bg-white ${
                              selected
                                ? "text-gray-700 border-gray-200"
                                : "text-gray-400 border-gray-100"
                            }`}
                          >
                            {key === "private" ? <Home size={18} /> : <FileText size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-gray-900 mb-0.5">{type.title}</h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed">{type.description}</p>
                          </div>
                          {/* Check indicator */}
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

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Currency
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <PhilippinePeso className="text-emerald-600" size={16} />
                  <span className="text-sm font-medium text-slate-700">{DEFAULT_CURRENCY}</span>
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded ml-auto">
                    Default
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <Info className="text-gray-600 mt-0.5" size={16} />
                <div className="text-xs text-gray-700">
                  <p className="font-medium text-gray-900">Family Settings</p>
                  <p className="mt-1">
                    Private families require invitations. Public families can be discovered by others.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {canDeleteFamily && onDeleteFamily && (
                  <button
                    type="button"
                    className="flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors"
                    onClick={handleDeleteFamily}
                  >
                    <Trash2 size={14} />
                    DELETE FAMILY GROUP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Review Family Changes
              </h4>
              <p className="text-xs text-slate-500">
                Please review your changes before updating.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 space-y-0 divide-y divide-gray-100">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Family Name</span>
                  <span className="text-[13px] font-semibold text-gray-700">{formData.name}</span>
                </div>
                {formData.description && (
                  <div className="flex justify-between items-start py-2.5">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Description</span>
                    <span className="text-[11px] text-gray-500 italic max-w-[180px] text-right">
                      {formData.description}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Visibility</span>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {FAMILY_TYPES[formData.visibility as keyof typeof FAMILY_TYPES].title}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <Info className="text-gray-600 mt-0.5" size={16} />
              <div className="text-xs text-gray-700">
                <p className="font-medium text-gray-900">Update Confirmation</p>
                <p className="mt-1">
                  These changes will be applied to your family group immediately.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-white border border-gray-200 text-gray-700 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px text-red-500" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-gray-900">Error</h4>
                  <p className="text-[11px] leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}

            {canDeleteFamily && onDeleteFamily && (
              <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <Trash2 className="text-gray-600 mt-0.5" size={16} />
                <div className="text-xs text-gray-700">
                  <p className="font-medium text-gray-900">Delete Family</p>
                  <p className="mt-1">
                    If you want to delete this family group, click the delete button below.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="flex justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky bottom-0 bg-white z-10 lg:static">
        {currentStep > 1 ? (
          <button
            onClick={handleBack}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center"
          >
            <ArrowLeft size={14} className="mr-1.5 sm:mr-2" />
            Back
          </button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          {canDeleteFamily && onDeleteFamily && currentStep === 2 && (
            <button
              onClick={handleDeleteFamily}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 size={14} className="mr-1.5 sm:mr-2" />
              Delete
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canContinue || submitting}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                {currentStep === 2 ? "Update Family" : "Continue"}
                {currentStep < 2 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
              </>
            )}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
