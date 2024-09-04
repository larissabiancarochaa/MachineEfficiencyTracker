import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const SUPABASE_URL = 'https://iomjqkbtjqubpotzqyje.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbWpxa2J0anF1YnBvdHpxeWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzODk5NDMsImV4cCI6MjA0MDk2NTk0M30.O2X5fuZjh1m_9tkIbHJOL1T-DmRVt7EZQ6P0H5tl4TA';

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export const useSupabase = () => {
  return useMemo(() => ({ supabase }), []);
};