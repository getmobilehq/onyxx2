import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

/**
 * Supabase Admin client — uses SERVICE_ROLE_KEY, bypasses RLS.
 * Used for user management (createUser, generateLink, etc.)
 */
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
