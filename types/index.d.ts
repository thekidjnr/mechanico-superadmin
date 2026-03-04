export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

export interface MerchantProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_onboarded: boolean;
  is_active: boolean;
  subscription_type: string | null;
  subscription_end_date: string | null;
  created_at: string;
  workshop: {
    id: string;
    name: string;
    location: string | null;
    email_address: string | null;
    phone_number: string | null;
    logo_access_url: string | null;
  } | null;
}

export interface AdminStats {
  total_merchants: number;
  active_merchants: number;
  onboarded_merchants: number;
  pending_onboarding: number;
}

export interface CreateMerchantInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface SubService {
  id: number;
  title: string;
  service_id: number;
}

export interface CatalogService {
  id: number;
  title: string;
  sub_services: SubService[];
}

export interface VehicleBrand {
  id: number;
  title: string;
  logo_access_url: string | null;
  logo_file_name: string | null;
  logo_mime_type: string | null;
}
