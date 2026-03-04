import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function createSuperadmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "assets@mechanico.io",
    password: "StrongPassword123!",
    email_confirm: true,
    user_metadata: {
      role: "superadmin",
      first_name: "Mechanico",
      last_name: "Admin",
    },
  });

  if (error) {
    console.error("Error creating superadmin:", error.message);
    return;
  }

  console.log("Superadmin created:", data.user?.email);
}

createSuperadmin();
