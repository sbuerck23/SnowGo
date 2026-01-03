import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      // Get current user
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      
        // Try localStorage first (instant load)
        const localTheme = localStorage.getItem('theme') as Theme | null;
        
        if (localTheme) {
          setThemeState(localTheme);
          document.documentElement.setAttribute('data-theme', localTheme);
        } else if (user) {
          // If no local theme but user is logged in, try fetching from database
          try {
            const { data, error } = await supabase
              .from('user_preferences')
              .select('theme')
              .eq('user_id', user.id)
              .single();

            if (!error && data?.theme) {
              const dbTheme = data.theme as Theme;
              setThemeState(dbTheme);
              localStorage.setItem('theme', dbTheme);
              document.documentElement.setAttribute('data-theme', dbTheme);
            } else {
              // Default to light theme
              document.documentElement.setAttribute('data-theme', 'light');
            }
          } catch (error) {
            // Silently ignore database errors - table may not exist yet
            document.documentElement.setAttribute('data-theme', 'light');
          }
        } else {
          // Default to light theme for non-authenticated users
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch (err) {
        console.error("User isn't logged in:", err);
      }
    };

    initializeTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // Sync with database only if user is authenticated (optional)
    if (userId) {
      try {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            theme: newTheme,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      } catch (error) {
        // Silently fail - localStorage is our primary storage
        // Database sync is optional for authenticated users only
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
