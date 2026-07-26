import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://xwvukvssovpjtxoxqezd.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dnVrdnNzb3ZwanR4b3hxZXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTg3NTYsImV4cCI6MjA5OTUzNDc1Nn0.liAvJsz7S4_T4wevxZEnrw35D4xvgjzYAGKR-dD8S-g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
