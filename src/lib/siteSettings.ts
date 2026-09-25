import { getSupabase } from "@/lib/supabase";

export type WebsiteSettings = {
  business_name: string;
  legal_name: string;
  tagline: string;
  subtagline: string;
  description: string;
  email: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  instagram: string;
  facebook: string;
};

export async function getWebsiteSettings(): Promise<WebsiteSettings | null> {
  const { data, error } = await getSupabase()
    .from("website_settings")
    .select(
      "business_name, legal_name, tagline, subtagline, description, email, phone1, phone2, whatsapp, address1, address2, city, state, pincode, instagram, facebook"
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load website settings:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    business_name: data.business_name ?? "",
    legal_name: data.legal_name ?? "",
    tagline: data.tagline ?? "",
    subtagline: data.subtagline ?? "",
    description: data.description ?? "",
    email: data.email ?? "",
    phone1: data.phone1 ?? "",
    phone2: data.phone2 ?? "",
    whatsapp: data.whatsapp ?? "",
    address1: data.address1 ?? "",
    address2: data.address2 ?? "",
    city: data.city ?? "",
    state: data.state ?? "",
    pincode: data.pincode ?? "",
    instagram: data.instagram ?? "",
    facebook: data.facebook ?? "",
  };
}