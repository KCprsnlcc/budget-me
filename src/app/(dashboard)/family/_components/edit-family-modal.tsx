"use client";

import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, FileText, PhilippinePeso, Info, ArrowRight, ArrowLeft, Check, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Stepper } from "./stepper";
import { FAMILY_TYPES, DEFAULT_CURRENCY, MODAL_STEPS } from "./constants";
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
  React.useEffect(() => {
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
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Edit Family
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Step {currentStep} of 2
          </span>
        </div>
      </ModalHeader>

      {/* Stepper */}
      <Stepper currentStep={currentStep} totalSteps={2} labels={STEPS} />

      {/* Body */}
      <ModalBody className="px-5 py-5">
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
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Family Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Enter family name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  rows={3}
                  placeholder="Brief description of your family (optional)"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(FAMILY_TYPES).map(([key, type]) => (
                    <button
                      key={key}
                      onClick={() => updateFormData("visibility", key as "private" | "public")}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.visibility === key
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{type.title}</div>
                        <div className="text-xs text-slate-500">{type.description}</div>
                      </div>
                    </button>
                  ))}
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

              <Card className="p-4 bg-blue-50 border-blue-100">
                <div className="flex gap-3">
                  <Info className="text-blue-500 shrink-0" size={16} />
                  <div>
                    <p className="font-medium text-blue-900 text-xs">
                      Family Settings
                    </p>
                    <p className="text-blue-700 text-[10px] mt-0.5">
                      Private families require invitations. Public families can be discovered by others.
                    </p>
                  </div>
                </div>
              </Card>

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

            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-slate-600">Family Name</span>
                  <span className="text-sm font-medium text-slate-900">{formData.name}</span>
                </div>
                {formData.description && (
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-600">Description</span>
                    <span className="text-sm text-slate-900 max-w-xs text-right">
                      {formData.description}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-slate-600">Visibility</span>
                  <span className="text-sm font-medium text-slate-900">
                    {FAMILY_TYPES[formData.visibility as keyof typeof FAMILY_TYPES].title}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="text-blue-600 mt-0.5" size={16} />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Update Confirmation</p>
                <p className="mt-1">
                  These changes will be applied to your family group immediately.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 items-start">
                <AlertTriangle size={16} className="flex-shrink-0 mt-px" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                  <p className="text-[11px] leading-relaxed opacity-85">{submitError}</p>
                </div>
              </div>
            )}

            {canDeleteFamily && onDeleteFamily && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Trash2 className="text-red-600 mt-0.5" size={16} />
                <div className="text-xs text-red-800">
                  <p className="font-medium">Delete Family</p>
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
      <ModalFooter className="px-5 py-3.5">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {canDeleteFamily && onDeleteFamily && currentStep === 2 && (
              <Button
                variant="outline"
                onClick={handleDeleteFamily}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canContinue || submitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {currentStep === 2 ? (
                submitting ? (<><Loader2 size={14} className="animate-spin mr-1" /> Saving...</>) : (<> <Check size={16} /> Update Family</>)
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}
