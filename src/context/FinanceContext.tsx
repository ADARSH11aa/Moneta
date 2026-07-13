/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { Subscription, FinanceSettings } from '../types';

interface FinanceContextType {
  settings: FinanceSettings;
  subscriptions: Subscription[];
  updateSettings: (s: Partial<FinanceSettings>) => Promise<void>;
  addSubscription: (s: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (id: string, s: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [settings, setSettings] = useState<FinanceSettings>({ globalBudget: 0, totalSavings: 0 });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to settings doc
    const unsubSettings = onSnapshot(doc(db, 'users', currentUser.uid, 'config', 'finance'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as FinanceSettings);
      }
    });

    const unsubSub = onSnapshot(collection(db, 'users', currentUser.uid, 'subscriptions'), (snap) => {
      setSubscriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription)));
    });

    return () => { unsubSettings(); unsubSub(); };
  }, [currentUser]);

  const updateSettings = async (s: Partial<FinanceSettings>) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, 'config', 'finance');
    await setDoc(ref, s, { merge: true });
  };

  const addDoc = async (col: string, data: any) => {
    if (!currentUser) return;
    const newRef = doc(collection(db, 'users', currentUser.uid, col));
    await setDoc(newRef, data);
  };
  
  const updateDoc = async (col: string, id: string, data: any) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, col, id);
    await setDoc(ref, data, { merge: true });
  };
  
  const delDoc = async (col: string, id: string) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, col, id);
    await deleteDoc(ref);
  };

  return (
    <FinanceContext.Provider value={{
      settings,
      subscriptions,
      updateSettings,
      addSubscription: (s) => addDoc('subscriptions', s),
      updateSubscription: (id, s) => updateDoc('subscriptions', id, s),
      deleteSubscription: (id) => delDoc('subscriptions', id),
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
