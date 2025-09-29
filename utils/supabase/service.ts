// utils/supabase/service.ts
import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  // Service client bypasses RLS for reading public websites
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
