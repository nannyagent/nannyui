import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpqzsricripnvbrpsyws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcXpzcmljcmlwbnZicnBzeXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDIwNDcsImV4cCI6MjA3NjMxODA0N30.pV6oSyxOfumrgIoikvbs5UpmcqnFeHQ46IewZBuq8Jw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});
