"use client";

import { useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileCode, FileJson, Loader2 } from "lucide-react";
import type { ExportFormat } from "./types";

interface ExportChatModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
}

const EXPORT_OPTIONS: { format: ExportFormat; label: string; desc: string; icon: React.ElementType }[] = [
  { format: "pdf", label: "PDF Document", desc: "Formatted for easy reading and sharing", icon: FileText },
  { format: "markdown", label: "Word Document", desc: "Formatted for Microsoft Word", icon: FileCode },
  { format: "json", label: "CSV File", desc: "Data format for spreadsheets", icon: FileJson },
];

export function ExportChatModal({ open, onClose, onExport, isLoading = false }: ExportChatModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");

  const handleClose = useCallback(() => {
    if (isLoading) return;
    onClose();
  }, [onClose, isLoading]);

  const handleExport = useCallback(() => {
    if (isLoading) return;
    onExport(selectedFormat);
  }, [selectedFormat, onExport, isLoading]);

  return (
    <Modal open={open} onClose={handleClose} className="max-w-md">
      {/* Header */}
      <ModalHeader onClose={handleClose} className="px-5 py-3.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Export Chat
        </span>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="px-5 py-8">
        <div className="text-center animate-txn-in">
          {/* Export Icon */}
          <div className="w-16 h-16 rounded-full text-emerald-500 flex items-center justify-center mx-auto mb-6 border border-emerald-200">
            <Download size={28} />
          </div>

          {/* Export Message */}
          <h2 className="text-lg font-bold text-slate-900 mb-3">Export Conversation</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Choose a format to export your conversation:
          </p>

          {/* Format Options */}
          <div className="space-y-2 mx-auto max-w-sm">
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedFormat === option.format;
              return (
                <button
                  key={option.format}
                  onClick={() => setSelectedFormat(option.format)}
                  className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`p-2 ${
                      isSelected ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        isSelected ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </div>
                    <div className="text-[10px] text-slate-500">{option.desc}</div>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1 hover:bg-transparent" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-500" onClick={handleExport} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            "Export"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
