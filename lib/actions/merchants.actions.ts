"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { CreateMerchantInput } from "@/types";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "@/lib/email";

export const getAdminStats = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("is_onboarded, is_active")
    .neq("role", "superadmin");

  if (error) return { total: 0, active: 0, onboarded: 0, pending: 0 };

  const total = data.length;
  const active = data.filter((p) => p.is_active !== false).length;
  const onboarded = data.filter((p) => p.is_onboarded).length;
  const pending = data.filter((p) => !p.is_onboarded).length;

  return { total, active, onboarded, pending };
};

export const getMerchants = async () => {
  const admin = createAdminClient();

  const [{ data, error }, { data: authData }] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, first_name, last_name, is_onboarded, is_active, subscription_type, subscription_end_date, created_at, workshops(id, name, location, email_address, phone_number, logo_access_url)",
      )
      .neq("role", "superadmin")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (error) return [];

  const emailMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? null]),
  );

  return (data ?? []).map((p: any) => ({
    ...p,
    email: emailMap.get(p.id) ?? null,
    is_active: p.is_active !== false,
    workshop: Array.isArray(p.workshops)
      ? (p.workshops[0] ?? null)
      : (p.workshops ?? null),
  }));
};

export const getMerchant = async (id: string) => {
  const admin = createAdminClient();

  const [{ data, error }, { data: authUser }] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, first_name, last_name, is_onboarded, is_active, subscription_type, subscription_end_date, created_at, workshops(id, name, location, email_address, phone_number, logo_access_url)",
      )
      .eq("id", id)
      .single(),
    admin.auth.admin.getUserById(id),
  ]);

  if (error || !data) return null;

  return {
    ...(data as any),
    email: authUser?.user?.email ?? null,
    is_active: (data as any).is_active !== false,
    workshop: Array.isArray((data as any).workshops)
      ? ((data as any).workshops[0] ?? null)
      : ((data as any).workshops ?? null),
  };
};

export const createMerchant = async (input: CreateMerchantInput) => {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      first_name: input.first_name,
      last_name: input.last_name,
      role: "merchant",
      requires_password_change: true,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Failed to create account" };
  }

  // Upsert profile row (in case trigger didn't fire or didn't set names)
  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      first_name: input.first_name,
      last_name: input.last_name,
      is_onboarded: false,
      is_active: true,
      role: "merchant",
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    console.error("Profile upsert failed:", upsertError.message);
  }

  revalidatePath("/merchants");

  // Send welcome email with credentials (non-blocking — don't fail the account creation if email errors)
  sendWelcomeEmail({
    firstName: input.first_name,
    email: input.email,
    password: input.password,
  }).catch((err) => console.error("[createMerchant] Email send failed:", err));

  return { success: true, userId: data.user.id };
};

export const toggleMerchantStatus = async (
  id: string,
  currentlyActive: boolean,
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: !currentlyActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/merchants");
  revalidatePath(`/merchants/${id}`);
  return { success: true };
};

export const updateMerchantSubscription = async (
  id: string,
  subscription_type: string,
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_type })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/merchants/${id}`);
  return { success: true };
};

export const deleteMerchant = async (id: string) => {
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/merchants");
  return { success: true };
};
