import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User preferences helper functions
export const getUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine
    console.error('Error fetching user preferences:', error);
  }

  return data;
};

export const setUserTheme = async (userId: string, theme: 'light' | 'dark') => {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      theme,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error saving theme preference:', error);
    throw error;
  }
};
