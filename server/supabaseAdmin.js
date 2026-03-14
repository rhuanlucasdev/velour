import { createClient } from "@supabase/supabase-js";
import { getEnv, maybeGetEnv } from "./env.js";

const supabaseUrl = maybeGetEnv("VITE_SUPABASE_URL");
const serviceRoleKey = maybeGetEnv("SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(
        getEnv("VITE_SUPABASE_URL"),
        getEnv("SUPABASE_SERVICE_ROLE_KEY"),
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      )
    : null;
