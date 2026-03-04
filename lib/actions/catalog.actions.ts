"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { CatalogService, VehicleBrand } from "@/types";

// ── Services ──────────────────────────────────────────────────────────────────

export const getServices = async (): Promise<CatalogService[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("services")
    .select("id, title, sub_services(id, title, service_id)")
    .order("id");
  if (error || !data) return [];
  return data as CatalogService[];
};

export const createService = async (title: string) => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("services")
    .insert({ title })
    .select("id, title")
    .single();
  if (error || !data) return { error: error?.message ?? "Failed to create service" };
  revalidatePath("/catalog");
  return { success: true, service: { ...(data as { id: number; title: string }), sub_services: [] } as CatalogService };
};

export const updateService = async (id: number, title: string) => {
  const admin = createAdminClient();
  const { error } = await admin.from("services").update({ title }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog");
  return { success: true };
};

export const deleteService = async (id: number) => {
  const admin = createAdminClient();
  const { error } = await admin.from("services").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog");
  return { success: true };
};

// ── Sub-services ──────────────────────────────────────────────────────────────

export const createSubService = async (serviceId: number, title: string) => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("sub_services")
    .insert({ service_id: serviceId, title })
    .select("id, title, service_id")
    .single();
  if (error || !data) return { error: error?.message ?? "Failed to create sub-service" };
  revalidatePath("/catalog");
  return { success: true, subService: data as { id: number; title: string; service_id: number } };
};

export const updateSubService = async (id: number, title: string) => {
  const admin = createAdminClient();
  const { error } = await admin.from("sub_services").update({ title }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog");
  return { success: true };
};

export const deleteSubService = async (id: number) => {
  const admin = createAdminClient();
  const { error } = await admin.from("sub_services").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog");
  return { success: true };
};

// ── Vehicle Brands ────────────────────────────────────────────────────────────

export const getVehicleBrands = async (): Promise<VehicleBrand[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vehicle_brands")
    .select("id, title, logo_access_url, logo_file_name, logo_mime_type")
    .order("title");
  if (error || !data) return [];
  return data as VehicleBrand[];
};

export const createVehicleBrand = async (formData: FormData) => {
  const admin = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  const file = formData.get("logo") as File | null;

  if (!title) return { error: "Title is required" };

  let logo_access_url: string | null = null;
  let logo_file_name: string | null = null;
  let logo_mime_type: string | null = null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "png";
    const storageKey = `vehicle-brands/${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from("mechanico-media")
      .upload(storageKey, bytes, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
    const { data: urlData } = admin.storage
      .from("mechanico-media")
      .getPublicUrl(storageKey);
    logo_access_url = urlData.publicUrl;
    logo_file_name = storageKey; // store storage path for future deletion
    logo_mime_type = file.type;
  }

  const { data, error } = await admin
    .from("vehicle_brands")
    .insert({ title, logo_access_url, logo_file_name, logo_mime_type })
    .select("id, title, logo_access_url, logo_file_name, logo_mime_type")
    .single();
  if (error || !data) return { error: error?.message ?? "Failed to create brand" };
  revalidatePath("/catalog");
  return { success: true, brand: data as VehicleBrand };
};

export const updateVehicleBrand = async (id: number, formData: FormData) => {
  const admin = createAdminClient();
  const title = (formData.get("title") as string)?.trim();
  const file = formData.get("logo") as File | null;
  const currentStorageKey = formData.get("current_logo_key") as string | null;
  const currentUrl = formData.get("current_logo_url") as string | null;
  const currentMime = formData.get("current_logo_mime") as string | null;

  if (!title) return { error: "Title is required" };

  let logo_access_url = currentUrl;
  let logo_file_name = currentStorageKey;
  let logo_mime_type = currentMime;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "png";
    const storageKey = `vehicle-brands/${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from("mechanico-media")
      .upload(storageKey, bytes, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };
    const { data: urlData } = admin.storage
      .from("mechanico-media")
      .getPublicUrl(storageKey);
    logo_access_url = urlData.publicUrl;
    logo_file_name = storageKey;
    logo_mime_type = file.type;
    if (currentStorageKey) {
      await admin.storage.from("mechanico-media").remove([currentStorageKey]);
    }
  }

  const { data, error } = await admin
    .from("vehicle_brands")
    .update({ title, logo_access_url, logo_file_name, logo_mime_type })
    .eq("id", id)
    .select("id, title, logo_access_url, logo_file_name, logo_mime_type")
    .single();
  if (error || !data) return { error: error?.message ?? "Failed to update brand" };
  revalidatePath("/catalog");
  return { success: true, brand: data as VehicleBrand };
};

export const deleteVehicleBrand = async (id: number, storageKey?: string | null) => {
  const admin = createAdminClient();
  if (storageKey) {
    await admin.storage.from("mechanico-media").remove([storageKey]);
  }
  const { error } = await admin.from("vehicle_brands").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/catalog");
  return { success: true };
};
