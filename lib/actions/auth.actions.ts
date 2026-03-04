"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const signIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) return { error: error?.message ?? "Login failed" };

  // Verify superadmin role
  const role = data.user.user_metadata?.role;
  if (role !== "superadmin") {
    await supabase.auth.signOut();
    return { error: "Access denied. Superadmin credentials required." };
  }

  return { success: true };
};

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
};

export const getAdminUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "superadmin") return null;

  return {
    id: user.id,
    email: user.email ?? "",
    first_name: user.user_metadata?.first_name ?? null,
    last_name: user.user_metadata?.last_name ?? null,
    role: user.user_metadata?.role ?? null,
  };
};
