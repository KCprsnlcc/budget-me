"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { User } from "../_lib/types";
import { deactivateUser, deleteUser } from "../_lib/user-service";
import { toast } from "sonner";
import { Loader2, AlertTriangle, UserX } from "lucide-react";

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export function DeleteUserModal({ open, onClose, user, onSuccess }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleteType, setDeleteType] = useState<"deactivate" | "delete">("deactivate");

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (deleteType === "deactivate") {
        await deactivateUser(user.id);
        toast.success("User deactivated successfully");
      } else {
        await deleteUser(user.id);
        toast.success("User deleted permanently");
      }
      
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      {}
      <ModalHeader onClose={onClose} className="px-5 py-3.5 bg-white border-b border-slate-100">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          {deleteType === "deactivate" ? "Deactivate User" : "Delete User"}
        </span>
      </ModalHeader>

      {}
      <ModalBody className="px-5 py-8 bg-[#F9FAFB]/30">
        <div className="text-center animate-txn-in">
          {}
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            {deleteType === "deactivate" ? "Deactivate User Account?" : "Delete User Permanently?"}
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
            {deleteType === "deactivate" 
              ? "This will prevent the user from accessing their account. You can reactivate them later."
              : "This action cannot be undone. All user data will be permanently deleted."}
          </p>

          {}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mx-auto max-w-sm">
            <div className="p-5 space-y-0 divide-y divide-gray-100">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Name</span>
                <span className="text-sm font-bold text-slate-900">{user.full_name || "No Name"}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Email</span>
                <span className="text-sm font-semibold text-slate-700">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Role</span>
                <span className="text-sm font-semibold text-slate-700">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Status</span>
                <span className="text-sm font-semibold text-slate-700">
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {}
          <div className="space-y-2 mt-6 mx-auto max-w-sm">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-colors bg-[#F9FAFB]/50">
              <input
                type="radio"
                name="deleteType"
                value="deactivate"
                checked={deleteType === "deactivate"}
                onChange={(e) => setDeleteType(e.target.value as any)}
                className="w-4 h-4 text-emerald-500"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Deactivate Account</p>
                <p className="text-[11px] text-slate-500">User can be reactivated later</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition-colors bg-white">
              <input
                type="radio"
                name="deleteType"
                value="delete"
                checked={deleteType === "delete"}
                onChange={(e) => setDeleteType(e.target.value as any)}
                className="w-4 h-4 text-red-500"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-red-900">Delete Permanently</p>
                <p className="text-[11px] text-red-600">This action cannot be undone</p>
              </div>
            </label>
          </div>

          {}
          <div className="p-3 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 mx-auto max-w-sm mt-6">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mt-px text-amber-500" />
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-widest mb-0.5 text-slate-900">
                  {deleteType === "deactivate" ? "Reversible Action" : "Irreversible Action"}
                </h4>
                <p className="text-[11px] leading-relaxed">
                  {deleteType === "deactivate" 
                    ? "The user account will be deactivated and can be restored later."
                    : "This user will be permanently deleted and cannot be recovered."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      {}
      <ModalFooter className="px-6 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant={deleteType === "delete" ? "destructive" : "default"}
          size="sm" 
          className="flex-1"
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? (<><Loader2 size={14} className="animate-spin" /> Processing...</>) : (deleteType === "deactivate" ? "Deactivate" : "Delete Permanently")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

