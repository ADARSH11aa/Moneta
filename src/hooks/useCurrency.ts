import { useCallback } from 'react';
import { usePreferences } from '../context/PreferencesContext';

export const useCurrency = () => {
  const { preferences } = usePreferences();

  const fmt = useCallback((n: number) => {
    return preferences.currency + Math.round(n || 0).toLocaleString('en-IN');
  }, [preferences.currency]);

  return { fmt, currency: preferences.currency };
};
