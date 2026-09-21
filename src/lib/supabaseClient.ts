import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://xwvukvssovpjtxoxqezd.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dnVrdnNzb3ZwanR4b3hxZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTg3NTYsImV4cCI6MjA5OTUzNDc1Nn0.liAvJsz7S4_T4wevxZEnrw35D4xvgjzYAGKR-dD8S-g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Automatic Client Keep-Alive Ping ────────────────────────────────────────
export async function pingSupabaseKeepAlive() {
  try {
    const lastPing = localStorage.getItem('supabase-last-keepalive');
    const now = Date.now();
    // Only ping if >4 hours since last ping to save unnecessary network traffic
    if (lastPing && now - parseInt(lastPing, 10) < 4 * 60 * 60 * 1000) {
      return;
    }
    
    const { error } = await supabase.from('companies').select('id').limit(1);
    if (!error) {
      localStorage.setItem('supabase-last-keepalive', now.toString());
      console.log('⚡ [Supabase Keep-Alive] Activity ping registered successfully');
    }
  } catch (e) {
    // Silent fallback
  }
}

// Trigger initial ping on app startup
if (typeof window !== 'undefined') {
  setTimeout(pingSupabaseKeepAlive, 3000);
}
