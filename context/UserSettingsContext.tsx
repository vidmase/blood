import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface UserTargets {
  systolic: number;
  diastolic: number;
  pulse: number;
}

interface UserSettingsContextType {
  targets: UserTargets;
  loading: boolean;
  updateTargets: (newTargets: Partial<UserTargets>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const defaultTargets: UserTargets = {
  systolic: 120,
  diastolic: 80,
  pulse: 70,
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [targets, setTargets] = useState<UserTargets>(defaultTargets);
  const [loading, setLoading] = useState(true);

  // Load user targets from localStorage (or later from Supabase)
  useEffect(() => {
    const loadUserTargets = async () => {
      if (!user) {
        setTargets(defaultTargets);
        setLoading(false);
        return;
      }

      try {
        // For now, use localStorage. Later we can integrate with Supabase user profiles
        const savedTargets = localStorage.getItem(`user_targets_${user.id}`);
        if (savedTargets) {
          const parsedTargets = JSON.parse(savedTargets);
          setTargets({ ...defaultTargets, ...parsedTargets });
        } else {
          setTargets(defaultTargets);
        }
      } catch (error) {
        console.error('Error loading user targets:', error);
        setTargets(defaultTargets);
      } finally {
        setLoading(false);
      }
    };

    loadUserTargets();
  }, [user]);

  const updateTargets = async (newTargets: Partial<UserTargets>) => {
    if (!user) return;

    try {
      const updatedTargets = { ...targets, ...newTargets };
      
      // Validate targets
      if (updatedTargets.systolic < 80 || updatedTargets.systolic > 200) {
        throw new Error('Systolic target must be between 80 and 200 mmHg');
      }
      if (updatedTargets.diastolic < 50 || updatedTargets.diastolic > 120) {
        throw new Error('Diastolic target must be between 50 and 120 mmHg');
      }
      if (updatedTargets.pulse < 50 || updatedTargets.pulse > 120) {
        throw new Error('Pulse target must be between 50 and 120 BPM');
      }

      setTargets(updatedTargets);
      
      // Save to localStorage (later we can save to Supabase)
      localStorage.setItem(`user_targets_${user.id}`, JSON.stringify(updatedTargets));
    } catch (error) {
      throw error;
    }
  };

  const resetToDefaults = async () => {
    if (!user) return;

    try {
      setTargets(defaultTargets);
      localStorage.setItem(`user_targets_${user.id}`, JSON.stringify(defaultTargets));
    } catch (error) {
      throw error;
    }
  };

  const value: UserSettingsContextType = {
    targets,
    loading,
    updateTargets,
    resetToDefaults,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};
