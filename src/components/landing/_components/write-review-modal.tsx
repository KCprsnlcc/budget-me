"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, Loader2, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestimonialInput } from "../_lib/testimonial-service";

interface WriteReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    input: TestimonialInput,
    avatarFile?: File | null
  ) => Promise<{ error: string | null; success: boolean }>;
}

const RING_COLORS = [
  { value: "ring-emerald-50", label: "Emerald", bg: "bg-emerald-50" },
  { value: "ring-blue-50", label: "Blue", bg: "bg-blue-50" },
  { value: "ring-purple-50", label: "Purple", bg: "bg-purple-50" },
  { value: "ring-amber-50", label: "Amber", bg: "bg-amber-50" },
  { value: "ring-rose-50", label: "Rose", bg: "bg-rose-50" },
  { value: "ring-teal-50", label: "Teal", bg: "bg-teal-50" },
  { value: "ring-indigo-50", label: "Indigo", bg: "bg-indigo-50" },
  { value: "ring-cyan-50", label: "Cyan", bg: "bg-cyan-50" },
  { value: "ring-orange-50", label: "Orange", bg: "bg-orange-50" },
];

export function WriteReviewModal({ open, onClose, onSubmit }: WriteReviewModalProps) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [text, setText] = useState("");
  const [ringColor, setRingColor] = useState("ring-emerald-50");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    setAvatarFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      // Validation
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      if (!handle.trim()) {
        setError("Please enter your handle/username");
        return;
      }
      if (!text.trim()) {
        setError("Please write your review");
        return;
      }
      if (text.trim().length < 10) {
        setError("Review must be at least 10 characters");
        return;
      }

      setIsSubmitting(true);

      const result = await onSubmit(
        {
          name: name.trim(),
          handle: handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`,
          text: text.trim(),
          ring_color: ringColor,
        },
        avatarFile
      );

      setIsSubmitting(false);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
        // Reset form after 2 seconds and close
        setTimeout(() => {
          setName("");
          setHandle("");
          setText("");
          setRingColor("ring-emerald-50");
          setAvatarFile(null);
          setAvatarPreview(null);
          setSuccess(false);
          onClose();
        }, 2000);
      }
    },
    [name, handle, text, ringColor, avatarFile, onSubmit, onClose]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  }, [isSubmitting, onClose]);

  if (success) {
    return (
      <Modal open={open} onClose={handleClose}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Thank you for your review!
          </h3>
          <p className="text-sm text-slate-500">
            Your testimonial has been added and will appear on the page immediately.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} className="max-w-[520px]">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={handleClose} className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Write a Review
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="px-5 py-5">
          <div className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div
                className={cn(
                  "relative w-20 h-20 rounded-full overflow-hidden ring-4 cursor-pointer transition-all",
                  ringColor,
                  !avatarPreview && "bg-slate-100"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </div>

              {avatarPreview ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={12} />
                  Remove photo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-emerald-600 hover:text-emerald-700"
                >
                  Add profile photo (optional)
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Ring Color Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                Avatar Border Color
              </label>
              <div className="flex flex-wrap gap-2">
                {RING_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setRingColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full ring-2 transition-all",
                      color.bg,
                      ringColor === color.value
                        ? "ring-emerald-500 ring-offset-2"
                        : "ring-transparent hover:ring-slate-300"
                    )}
                    title={color.label}
                    aria-label={`Select ${color.label} color`}
                  />
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                Your Name <span className="text-slate-400">*</span>
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                disabled={isSubmitting}
              />
            </div>

            {/* Handle Input */}
            <div>
              <label htmlFor="handle" className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                Username / Handle <span className="text-slate-400">*</span>
              </label>
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@johndoe"
                className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                disabled={isSubmitting}
              />
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review" className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-[0.04em]">
                Your Review <span className="text-slate-400">*</span>
              </label>
              <Textarea
                id="review"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience with BudgetMe..."
                className="w-full px-3.5 py-2.5 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg resize-none transition-all hover:border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/[0.06]"
                rows={4}
                disabled={isSubmitting}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2.5 p-3 rounded-lg text-xs bg-red-50 border border-red-100 text-red-900 items-start">
                <X size={16} className="flex-shrink-0 mt-px" />
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5">Error</h4>
                  <p className="text-[11px] leading-relaxed opacity-85">{error}</p>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Review
                <Check size={14} />
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
