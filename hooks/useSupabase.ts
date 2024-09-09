import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const SUPABASE_URL = 'https://iomjqkbtjqubpotzqyje.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbWpxa2J0anF1YnBvdHpxeWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTM4OTk0MywiZXhwIjoyMDQwOTY1OTQzfQ.B_SsnV8ffEHJyTxa8TPPr3nZbD6k6d5FPZ69S4gp0tU';

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export const useSupabase = () => {
  return useMemo(() => ({ supabase }), []);
};