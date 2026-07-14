/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { format } from 'date-fns';
import type { UserProfile, MonthlySummary } from '../types';

interface LedgerContextType {
  activeMonth: string; // YYYY-MM
  setActiveMonth: (month: string) => void;
  availableMonths: MonthlySummary[];
  profile: UserProfile | null;
  loadingLedger: boolean;
  showWelcomePopup: boolean;
  setShowWelcomePopup: (show: boolean) => void;
  rolledOverMonth: string | null;
  refreshMonths: () => Promise<void>;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const [activeMonth, setActiveMonth] = useState<string>(currentMonthStr);
  const [availableMonths, setAvailableMonths] = useState<MonthlySummary[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingLedger, setLoadingLedger] = useState(true);
  
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [rolledOverMonth, setRolledOverMonth] = useState<string | null>(null);

  const refreshMonths = async () => {
    if (!currentUser) return;
    const monthsSnap = await getDocs(collection(db, 'users', currentUser.uid, 'months'));
    const months = monthsSnap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlySummary));
    months.sort((a, b) => b.id.localeCompare(a.id)); // sort descending
    setAvailableMonths(months);
  };

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setAvailableMonths([]);
      setLoadingLedger(false);
      return;
    }

    const initLedger = async () => {
      setLoadingLedger(true);
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        setLoadingLedger(false);
        return;
      }
      
      const userData = userSnap.data() as UserProfile;
      setProfile(userData);

      // Check Migration Needs
      if (!userData.lastActiveMonth) {
        await runMigration(currentUser.uid, userData);
      } else if (userData.lastActiveMonth < currentMonthStr) {
        await runRollover(currentUser.uid, userData, currentMonthStr);
      }
      
      await refreshMonths();
      setActiveMonth(currentMonthStr); // default active month is current
      setLoadingLedger(false);
    };

    initLedger();
  }, [currentUser]);

  const runMigration = async (uid: string, p: UserProfile) => {
    // Migrate all old transactions into months
    const txnsSnap = await getDocs(collection(db, 'users', uid, 'transactions'));
    const txns = txnsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    
    // Read Finance Settings to get globalBudget
    const financeSnap = await getDoc(doc(db, 'users', uid, 'config', 'finance'));
    const globalBudget = financeSnap.exists() ? financeSnap.data().globalBudget || 0 : 0;
    
    const monthData: Record<string, { income: number; expense: number; txns: any[] }> = {};
    
    txns.forEach(txn => {
      // date is YYYY-MM-DD
      const mStr = txn.date.substring(0, 7); 
      if (!monthData[mStr]) monthData[mStr] = { income: 0, expense: 0, txns: [] };
      monthData[mStr].txns.push(txn);
      if (txn.type === 'income') monthData[mStr].income += txn.amount;
      if (txn.type === 'expense') monthData[mStr].expense += txn.amount;
    });

    const batch = writeBatch(db);
    let totalLifetimeSavings = 0;

    for (const [mStr, data] of Object.entries(monthData)) {
      const summaryRef = doc(db, 'users', uid, 'months', mStr);
      const savings = data.income - data.expense;
      
      // We only add to lifetime savings if it's NOT the current month (since current month is active)
      if (mStr < currentMonthStr) {
        totalLifetimeSavings += savings;
      }

      batch.set(summaryRef, {
        income: data.income,
        expense: data.expense,
        budget: globalBudget,
        savings: savings
      });

      // Write txns
      for (const txn of data.txns) {
        const tRef = doc(db, 'users', uid, 'months', mStr, 'transactions', txn.id);
        batch.set(tRef, txn);
      }
    }

    // Ensure current month exists even if empty
    if (!monthData[currentMonthStr]) {
      const currentRef = doc(db, 'users', uid, 'months', currentMonthStr);
      batch.set(currentRef, { income: 0, expense: 0, budget: globalBudget, savings: 0 });
    }

    // Update Profile
    const profileRef = doc(db, 'users', uid);
    batch.update(profileRef, {
      lastActiveMonth: currentMonthStr,
      lifetimeSavings: totalLifetimeSavings
    });

    await batch.commit();
    
    setProfile({ ...p, lastActiveMonth: currentMonthStr, lifetimeSavings: totalLifetimeSavings });
  };

  const runRollover = async (uid: string, p: UserProfile, currentMonth: string) => {
    const prevMonthStr = p.lastActiveMonth!;
    
    // Fetch last active month summary
    const prevMonthRef = doc(db, 'users', uid, 'months', prevMonthStr);
    const prevMonthSnap = await getDoc(prevMonthRef);
    
    let addedSavings = 0;
    if (prevMonthSnap.exists()) {
      const d = prevMonthSnap.data();
      addedSavings = (d.income || 0) - (d.expense || 0);
      
      // ensure we record the final savings
      await updateDoc(prevMonthRef, { savings: addedSavings });
    }

    const newLifetimeSavings = (p.lifetimeSavings || 0) + addedSavings;

    // Read Finance Settings to get globalBudget for new month
    const financeSnap = await getDoc(doc(db, 'users', uid, 'config', 'finance'));
    const globalBudget = financeSnap.exists() ? financeSnap.data().globalBudget || 0 : 0;

    const batch = writeBatch(db);
    
    // Create new month
    const newMonthRef = doc(db, 'users', uid, 'months', currentMonth);
    batch.set(newMonthRef, {
      income: 0,
      expense: 0,
      budget: globalBudget,
      savings: 0
    });

    // Update Profile
    const profileRef = doc(db, 'users', uid);
    batch.update(profileRef, {
      lastActiveMonth: currentMonth,
      lifetimeSavings: newLifetimeSavings
    });

    await batch.commit();

    setProfile({ ...p, lastActiveMonth: currentMonth, lifetimeSavings: newLifetimeSavings });
    setRolledOverMonth(prevMonthStr);
    setShowWelcomePopup(true);
  };

  return (
    <LedgerContext.Provider value={{
      activeMonth, setActiveMonth, availableMonths, profile, loadingLedger,
      showWelcomePopup, setShowWelcomePopup, rolledOverMonth, refreshMonths
    }}>
      {children}
    </LedgerContext.Provider>
  );
};
