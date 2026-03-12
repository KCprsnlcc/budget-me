import { createClient } from "@/lib/supabase/client";
import { getPhilippinesNow } from "@/lib/timezone";
import type { Account, ProfileFormData } from "../_components/types";

const supabase = createClient();

export interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<ProfileFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.firstName && updates.lastName 
          ? `${updates.firstName} ${updates.lastName}` 
          : undefined,
        phone: updates.phone,
        date_of_birth: updates.dateOfBirth,
        updated_at: getPhilippinesNow(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: getPhilippinesNow(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile with avatar:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export interface AccountData {
  id: string;
  user_id: string;
  account_name: string;
  account_type: string;
  balance: number;
  color: string | null;
  is_default: boolean;
  status: string;
  institution_name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserAccounts(userId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }

  return (data || []).map((account) => ({
    id: account.id,
    name: account.account_name,
    type: account.account_type as any,
    balance: parseFloat(account.balance?.toString() || "0"),
    color: account.color || "emerald",
    isDefault: account.is_default || false,
    institution: account.institution_name || undefined,
    description: account.description || undefined,
  }));
}

export async function createAccount(
  userId: string,
  account: Omit<Account, "id">
): Promise<{ success: boolean; accountId?: string; error?: string }> {
  try {

    if (account.isDefault) {
      await supabase
        .from("accounts")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        user_id: userId,
        account_name: account.name,
        account_type: account.type,
        balance: account.balance,
        initial_balance: account.balance,
        color: account.color,
        is_default: account.isDefault,
        institution_name: account.institution,
        description: account.description,
        status: "active",
        currency: "PHP",
        created_at: getPhilippinesNow(),
        updated_at: getPhilippinesNow(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating account:", error);
      return { success: false, error: error.message };
    }

    await logAccountActivity(userId, "account_created", {
      account_id: data.id,
      account_name: account.name,
      account_type: account.type,
      initial_balance: account.balance,
    });

    return { success: true, accountId: data.id };
  } catch (error) {
    console.error("Error creating account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateAccount(
  userId: string,
  accountId: string,
  updates: Partial<Account>
): Promise<{ success: boolean; error?: string }> {
  try {

    if (updates.isDefault) {
      await supabase
        .from("accounts")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const updateData: any = {
      updated_at: getPhilippinesNow(),
    };

    if (updates.name !== undefined) updateData.account_name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;
    if (updates.institution !== undefined) updateData.institution_name = updates.institution || null;
    if (updates.description !== undefined) updateData.description = updates.description || null;

    const { error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", accountId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating account:", error);
      return { success: false, error: error.message };
    }

    await logAccountActivity(userId, "account_updated", {
      account_id: accountId,
      updates: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function adjustAccountBalance(
  userId: string,
  accountId: string,
  amount: number,
  type: "deposit" | "withdrawal",
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {

    const { data: account, error: fetchError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", accountId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !account) {
      return { success: false, error: "Account not found" };
    }

    const currentBalance = parseFloat(account.balance?.toString() || "0");
    const newBalance = type === "deposit" 
      ? currentBalance + amount 
      : currentBalance - amount;

    const { error: updateError } = await supabase
      .from("accounts")
      .update({
        balance: newBalance,
        updated_at: getPhilippinesNow(),
      })
      .eq("id", accountId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating balance:", updateError);
      return { success: false, error: updateError.message };
    }

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        account_id: accountId,
        type: type === "deposit" ? "income" : "expense",
        amount: amount,
        description: reason,
        notes: `Balance adjustment: ${type}`,
        date: getPhilippinesNow().toISOString().split("T")[0],
        status: "completed",
        created_at: getPhilippinesNow(),
        updated_at: getPhilippinesNow(),
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);

    }

    await logAccountActivity(userId, "account_balance_change", {
      account_id: accountId,
      adjustment_type: type,
      amount: amount,
      previous_balance: currentBalance,
      new_balance: newBalance,
      reason: reason,
    });

    return { success: true };
  } catch (error) {
    console.error("Error adjusting balance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function setDefaultAccount(
  userId: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  try {

    await supabase
      .from("accounts")
      .update({ is_default: false })
      .eq("user_id", userId);

    const { error } = await supabase
      .from("accounts")
      .update({
        is_default: true,
        updated_at: getPhilippinesNow(),
      })
      .eq("id", accountId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error setting default account:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting default account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteAccount(
  userId: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  try {

    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("account_id", accountId);

    if ((count || 0) > 0) {

      const { error } = await supabase
        .from("accounts")
        .update({
          status: "closed",
          updated_at: getPhilippinesNow(),
        })
        .eq("id", accountId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error closing account:", error);
        return { success: false, error: error.message };
      }
    } else {

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting account:", error);
        return { success: false, error: error.message };
      }
    }

    await logAccountActivity(userId, "account_deleted", {
      account_id: accountId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function logAccountActivity(
  userId: string,
  activityType: string,
  metadata: any
): Promise<void> {
  try {
    await supabase.from("system_activity_log").insert({
      user_id: userId,
      activity_type: activityType,
      activity_description: `Account ${activityType.replace("account_", "")}`,
      metadata: metadata,
      severity: "info",
      created_at: getPhilippinesNow(),
    });
  } catch (error) {

    console.error("Error logging activity:", error);
  }
}
