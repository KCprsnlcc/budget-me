"use client";

import { useState, useCallback } from "react";
import { Plus, Wallet, Star, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Account } from "./types";
import { AddAccountModal, DeleteAccountModal, EditAccountModal } from "./index";
import { ACCOUNT_TYPES } from "./constants";
import { cn } from "@/lib/utils";

export function AccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "1",
      name: "Main Checking",
      type: "checking",
      balance: 2500.00,
      color: "emerald",
      isDefault: true,
      institution: "BPI",
    },
    {
      id: "2",
      name: "Emergency Savings",
      type: "savings",
      balance: 5000.00,
      color: "blue",
      isDefault: false,
      institution: "Metrobank",
    },
  ]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAdd = useCallback((newAccount: Omit<Account, "id">) => {
    const account: Account = {
      ...newAccount,
      id: Date.now().toString(),
    };
    setAccounts((prev) => {
      if (account.isDefault) {
        return prev.map((a) => ({ ...a, isDefault: false })).concat(account);
      }
      return [...prev, account];
    });
  }, []);

  const handleEdit = useCallback((updatedAccount: Account) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === updatedAccount.id) {
          return updatedAccount;
        }
        if (updatedAccount.isDefault && a.id !== updatedAccount.id) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
  }, []);

  const handleDelete = useCallback((accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
  }, []);

  const handleSetDefault = useCallback((accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === accountId }))
    );
  }, []);

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

      {/* Accounts Grid */}
      {accounts.length > 0 ? (
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
