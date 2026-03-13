"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Wallet, Eye, Edit, Trash2, Loader2, CreditCard, TrendingUp, Wallet2, PiggyBank, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Account } from "./types";
import { AddAccountModal, DeleteAccountModal, EditAccountModal } from "./index";
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from "./constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { getUserAccounts, createAccount, updateAccount, deleteAccount, setDefaultAccount } from "../_lib/settings-service";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ACCOUNT_TYPE_ICONS = {
  checking: Landmark,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
  cash: Wallet2,
};

export function AccountsTab() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

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

      const originalAccount = accounts.find(a => a.id === updatedAccount.id);
      const balanceChanged = originalAccount && originalAccount.balance !== updatedAccount.balance;
      
      if (balanceChanged) {
        const balanceDiff = updatedAccount.balance - originalAccount.balance;
        const adjustmentType = balanceDiff > 0 ? "deposit" : "withdrawal";
        const adjustmentAmount = Math.abs(balanceDiff);

        const { adjustAccountBalance } = await import("../_lib/settings-service");

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

      const result = await updateAccount(user.id, updatedAccount.id, {
        name: updatedAccount.name,
        color: updatedAccount.color,
        isDefault: updatedAccount.isDefault,
        institution: updatedAccount.institution,
        description: updatedAccount.description,
      });
      
      if (result.success) {

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
    return ACCOUNT_TYPE_ICONS[type as keyof typeof ACCOUNT_TYPE_ICONS] || Wallet;
  };

  const getColorHex = (color: string) => {
    const colorObj = ACCOUNT_COLORS.find((c) => c.twColor === color);
    return colorObj?.color || "#10B981";
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {}
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

      {}
      {isLoading ? (
        <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <div>
                      <Skeleton width={120} height={14} className="mb-1" />
                      <Skeleton width={100} height={12} />
                    </div>
                  </div>
                  <Skeleton width={60} height={20} borderRadius={12} />
                </div>

                <div className="mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton width={100} height={12} />
                      <Skeleton width={80} height={12} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center gap-3">
                  <Skeleton width={32} height={32} borderRadius={6} />
                  <Skeleton width={32} height={32} borderRadius={6} />
                  <Skeleton width={32} height={32} borderRadius={6} />
                </div>
              </div>
            ))}
          </div>
        </SkeletonTheme>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const Icon = getIconComponent(account.type);
            const iconColor = getColorHex(account.color);

            return (
              <div
                key={account.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
              >
                {}
                <div className="p-4 sm:p-5 bg-[#F9FAFB]/50 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-white border border-gray-100 shadow-sm shrink-0">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm sm:text-base font-bold truncate ${account.isDefault ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {account.name}
                        </h4>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 uppercase tracking-wider capitalize">
                          {account.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-slate-500">Current Balance</span>
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">
                      ₱{account.balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {account.institution && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-slate-500">Institution</span>
                      <span className="font-medium text-slate-700 text-xs sm:text-sm truncate ml-4 max-w-[150px]">
                        {account.institution}
                      </span>
                    </div>
                  )}
                  
                  {account.description && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-600 line-clamp-2">{account.description}</p>
                    </div>
                  )}
                </div>

                {}
                <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 flex justify-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    title="View Details" 
                    onClick={() => openEditModal(account)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    title="Edit" 
                    onClick={() => openEditModal(account)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600" 
                    title="Delete" 
                    onClick={() => openDeleteModal(account)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
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

      {}
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
