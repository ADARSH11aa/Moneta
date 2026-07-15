import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { UserPreferences } from '../types';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  currency: '₹',
  theme: 'system',
  accentColor: '#0f766e', // Teal base
  glassIntensity: 20,
  blurIntensity: 20,
  notifications: {
    monthlyReminder: true,
    budgetWarning: true,
    recurringReminder: true,
  }
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
  return context;
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    if (!currentUser) return;
    
    const ref = doc(db, 'users', currentUser.uid, 'config', 'preferences');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPreferences({
          ...defaultPreferences,
          ...data,
          notifications: {
            ...defaultPreferences.notifications,
            ...(data.notifications || {})
          }
        });
      } else {
        // Initialize with default
        setDoc(ref, defaultPreferences, { merge: true }).catch(console.error);
      }
    });

    return () => unsub();
  }, [currentUser]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, 'config', 'preferences');
    
    let finalUpdates = { ...updates };
    if (updates.notifications) {
      finalUpdates.notifications = {
        ...preferences.notifications,
        ...updates.notifications
      };
    }
    
    await setDoc(ref, finalUpdates, { merge: true });
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};
