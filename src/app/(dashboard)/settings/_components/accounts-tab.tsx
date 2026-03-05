"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Wallet, Star, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Account } from "./types";
import { AddAccountModal, DeleteAccountModal, EditAccountModal } from "./index";
import { ACCOUNT_TYPES } from "./constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { getUserAccounts, createAccount, updateAccount, deleteAccount, setDefaultAccount } from "../_lib/settings-service";

export function AccountsTab() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Load accounts
  useEffect(() => {
    async function loadAccounts() {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const data = await getUserAccounts(user.id);
        setAccounts(data);
      } catch (error) {
        console.error("Error loading accounts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAccounts();
  }, [user]);

  const handleAdd = useCallback(async (newAccount: Omit<Account, "id">) => {
    if (!user?.id) return;

    try {
      const result = await createAccount(user.id, newAccount);
      
      if (result.success && result.accountId) {
        // Reload accounts
        const data = await getUserAccounts(user.id);
        setAccounts(data);
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  }, [user]);

  const handleEdit = useCallback(async (updatedAccount: Account) => {
    if (!user?.id) return;

    try {
      // Check if balance changed
      const originalAccount = accounts.find(a => a.id === updatedAccount.id);
      const balanceChanged = originalAccount && originalAccount.balance !== updatedAccount.balance;
      
      if (balanceChanged) {
        const balanceDiff = updatedAccount.balance - originalAccount.balance;
        const adjustmentType = balanceDiff > 0 ? "deposit" : "withdrawal";
        const adjustmentAmount = Math.abs(balanceDiff);
        
        // Import the adjustment function
        const { adjustAccountBalance } = await import("../_lib/settings-service");
        
        // Adjust balance with transaction
        const adjustResult = await adjustAccountBalance(
          user.id,
          updatedAccount.id,
          adjustmentAmount,
          adjustmentType,
          "Manual balance adjustment from settings"
        );
        
        if (!adjustResult.success) {
          return;
        }
      }
      
      // Update other account details
      const result = await updateAccount(user.id, updatedAccount.id, {
        name: updatedAccount.name,
        color: updatedAccount.color,
        isDefault: updatedAccount.isDefault,
        institution: updatedAccount.institution,
        description: updatedAccount.description,
      });
      
      if (result.success) {
        // Reload accounts
        const data = await getUserAccounts(user.id);
        setAccounts(data);
      }
    } catch (error) {
      console.error("Error updating account:", error);
    }
  }, [user, accounts]);

  const handleDelete = useCallback(async (accountId: string) => {
    if (!user?.id) return;

    try {
      const result = await deleteAccount(user.id, accountId);
      
      if (result.success) {
        // Reload accounts
        const data = await getUserAccounts(user.id);
        setAccounts(data);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  }, [user]);

  const handleSetDefault = useCallback(async (accountId: string) => {
    if (!user?.id) return;

    try {
      const result = await setDefaultAccount(user.id, accountId);
      
      if (result.success) {
        // Reload accounts
        const data = await getUserAccounts(user.id);
        setAccounts(data);
      }
    } catch (error) {
      console.error("Error setting default account:", error);
    }
  }, [user]);

  const openAddModal = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((account: Account) => {
    setSelectedAccount(account);
    setEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((account: Account) => {
    setSelectedAccount(account);
    setDeleteModalOpen(true);
  }, []);

  const getIconComponent = (type: string) => {
    const accountType = ACCOUNT_TYPES.find((t) => t.type === type);
    return accountType?.icon || Wallet;
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      emerald: "bg-emerald-100 text-emerald-600",
      blue: "bg-blue-100 text-blue-600",
      amber: "bg-amber-100 text-amber-600",
      red: "bg-red-100 text-red-600",
      purple: "bg-purple-100 text-purple-600",
      slate: "bg-slate-100 text-slate-600",
    };
    return colorMap[color] || colorMap.emerald;
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Your Accounts</h3>
          <p className="text-xs text-slate-500">Manage your connected balances and sources.</p>
        </div>
        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={openAddModal}>
          <Plus size={18} className="mr-1.5" />
          Add Account
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const Icon = getIconComponent(account.type);
            const iconClass = getColorClass(account.color);

            return (
              <div
                key={account.id}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg text-slate-600">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{account.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">{account.type} Account</p>
                    </div>
                  </div>
                  {account.isDefault && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                      Default
                    </span>
                  )}
                </div>

                  <div className="mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Current Balance</span>
                        <span className="font-medium text-slate-900">
                          ₱{account.balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEditModal(account)}>
                    <Pencil size={16} />
                  </Button>
                  {!account.isDefault && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Set as Default" onClick={() => handleSetDefault(account.id)}>
                      <Star size={16} />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => openDeleteModal(account)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Wallet className="text-slate-400" size={32} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">No Accounts Found</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
            Add your first account to start tracking your finances effectively.
          </p>
          <Button variant="outline" size="sm" className="text-xs" onClick={openAddModal}>
            Add Your First Account
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddAccountModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAdd}
      />
      <EditAccountModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        account={selectedAccount}
        onEdit={handleEdit}
      />
      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        account={selectedAccount}
        onDelete={handleDelete}
      />
    </div>
  );
}
