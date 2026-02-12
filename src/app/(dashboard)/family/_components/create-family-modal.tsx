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
import { Home, FileText, Info, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Stepper } from "./stepper";
import { FAMILY_TYPES, MODAL_STEPS } from "./constants";
import type { CreateFamilyData, ModalStep } from "./types";

const STEPS = ["Details", "Review"];

interface CreateFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFamily?: () => void;
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
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const canContinue =
    (currentStep === 1 && formData.name !== "") ||
    currentStep === 2;

  const handleNext = useCallback(() => {
    if (currentStep >= 2) {
      // Handle submit
      console.log("Creating family:", formData);
      handleClose();
      if (onCreateFamily) {
        onCreateFamily();
      }
      return;
    }
    setCurrentStep((s) => (s + 1) as ModalStep);
  }, [currentStep, handleClose, onCreateFamily]);

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
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Create Family
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
                Create a new family group to manage budgets and track shared expenses.
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
                  Family Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(FAMILY_TYPES).map(([key, type]) => (
                    <button
                      key={key}
                      onClick={() => updateFormData("type", key as "private" | "public")}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.type === key
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
                  <span className="text-xs font-medium text-slate-600">Family Type</span>
                  <span className="text-sm font-medium text-slate-900">
                    {FAMILY_TYPES[formData.type as keyof typeof FAMILY_TYPES].title}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="text-blue-600 mt-0.5" size={16} />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Important Note</p>
                <p className="mt-1">
                  Once created, you can invite family members and start managing shared budgets and goals.
                </p>
              </div>
            </div>
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
            <Button
              onClick={handleNext}
              disabled={!canContinue}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {currentStep === 2 ? (
                <>
                  <Check size={16} />
                  Create Family
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
  );
}
