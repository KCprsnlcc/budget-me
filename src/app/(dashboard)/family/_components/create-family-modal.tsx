"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Home, FileText, Info, ArrowRight, ArrowLeft, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Stepper } from "./stepper";
import { FAMILY_TYPES } from "./constants";
import type { CreateFamilyData, ModalStep } from "./types";
import { toast } from "sonner";

const STEPS = ["Details", "Review"];

interface CreateFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFamily?: (form: CreateFamilyData) => Promise<{ error: string | null }>;
}

export function CreateFamilyModal({ open, onClose, onCreateFamily }: CreateFamilyModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>(1);
  const [formData, setFormData] = useState<CreateFamilyData>({
    name: "",
    description: "",
    type: "private",
  });

  const reset = useCallback(() => {
    setFormData({ name: "", description: "", type: "private" });
    setCurrentStep(1);
    setSubmitError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (currentStep === 1 && formData.name !== "") ||
    currentStep === 2;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = useCallback(async () => {
    if (currentStep >= 2) {
      if (!onCreateFamily) {
        toast.error("Create family function not available");
        return;
      }
      
      setSubmitting(true);
      setSubmitError(null);
      
      try {
        const result = await onCreateFamily(formData);
        
        if (result.error) {
          setSubmitError(result.error);
          toast.error(result.error);
          setSubmitting(false);
          return;
        }
        
        // Success
        toast.success("Family created successfully!");
        setSubmitting(false);
        handleClose();
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to create family";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setSubmitting(false);
      }
      return;
    }
    setCurrentStep((s) => (s + 1) as ModalStep);
  }, [currentStep, handleClose, onCreateFamily, formData]);

  const handleBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => (s - 1) as ModalStep);
  }, [currentStep]);

  const updateFormData = useCallback(
    <K extends keyof CreateFamilyData>(key: K, value: CreateFamilyData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Create Family
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
                Create a new family group to manage budgets and track shared expenses.
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
                  Family Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(FAMILY_TYPES).map(([key, type], idx) => {
                    const selected = formData.type === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateFormData("type", key as "private" | "public")}
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
            </div>
          </div>
        )}

        {/* STEP 2: Review */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Review Family Details
              </h4>
              <p className="text-xs text-slate-500">
                Please review your family information before creating.
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
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Family Type</span>
                  <span className="text-[13px] font-semibold text-gray-700">
                    {FAMILY_TYPES[formData.type as keyof typeof FAMILY_TYPES].title}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <Info className="text-gray-600 mt-0.5" size={16} />
              <div className="text-xs text-gray-700">
                <p className="font-medium text-gray-900">Important Note</p>
                <p className="mt-1">
                  Once created, you can invite family members and start managing shared budgets and goals.
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
                Creating...
              </>
            ) : (
              <>
                {currentStep === 2 ? "Create Family" : "Continue"}
                {currentStep < 2 && <ArrowRight size={14} className="ml-1.5 sm:ml-2" />}
              </>
            )}
          </button>
        </ModalFooter>
      </Modal>
  );
}
