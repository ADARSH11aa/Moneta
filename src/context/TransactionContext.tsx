/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, getDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useLedger } from './LedgerContext';
import type { Transaction, Shortcut } from '../types';
import { calculateMonthlySavings } from '../utils/finance';

interface TransactionContextType {
  transactions: Transaction[];
  shortcuts: Shortcut[];
  loading: boolean;
  addTransaction: (txn: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, txn: Partial<Transaction>, oldTxn?: Transaction) => Promise<void>;
  deleteTransaction: (id: string, oldTxn: Transaction) => Promise<void>;
  duplicateTransaction: (id: string) => Promise<void>;
  addShortcut: (shortcut: Omit<Shortcut, 'id'>) => Promise<void>;
  updateShortcut: (id: string, shortcut: Partial<Shortcut>) => Promise<void>;
  deleteShortcut: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeMonth, refreshMonths } = useLedger();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !activeMonth) {
      setTransactions([]);
      setShortcuts([]);
      setLoading(false);
      return;
    }

    // Now listen to the active month's transactions
    const txnsRef = collection(db, 'users', currentUser.uid, 'months', activeMonth, 'transactions');
    const qTxn = query(txnsRef, orderBy('date', 'desc'));
    
    const unsubTxn = onSnapshot(qTxn, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
      setLoading(false);
    });

    const shortcutsRef = collection(db, 'users', currentUser.uid, 'shortcuts');
    const qShort = query(shortcutsRef, orderBy('order', 'asc'));

    const unsubShort = onSnapshot(qShort, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shortcut));
      setShortcuts(data);
    });

    return () => {
      unsubTxn();
      unsubShort();
    };
  }, [currentUser, activeMonth]);

  const updateMonthlySummaryTotals = async (incomeDelta: number, expenseDelta: number) => {
    if (!currentUser || !activeMonth) return;
    const summaryRef = doc(db, 'users', currentUser.uid, 'months', activeMonth);
    const snap = await getDoc(summaryRef);
    let income = 0;
    let expense = 0;
    let budget = 0;
    if (snap.exists()) {
      const data = snap.data();
      income = data.income || 0;
      expense = data.expense || 0;
      budget = data.budget || 0;
    }
    const newIncome = Math.max(0, income + incomeDelta);
    const newExpense = Math.max(0, expense + expenseDelta);
    const newSavings = calculateMonthlySavings(newIncome, newExpense, budget);

    await setDoc(summaryRef, {
      income: newIncome,
      expense: newExpense,
      budget: budget,
      savings: newSavings
    }, { merge: true });
  };

  const addTransaction = async (txn: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!currentUser || !activeMonth) return;
    const newRef = doc(collection(db, 'users', currentUser.uid, 'months', activeMonth, 'transactions'));
    
    await setDoc(newRef, {
      ...txn,
      createdAt: serverTimestamp()
    });

    // Update monthly summary
    const incDelta = txn.type === 'income' ? txn.amount : 0;
    const expDelta = txn.type === 'expense' ? txn.amount : 0;
    await updateMonthlySummaryTotals(incDelta, expDelta);
    await refreshMonths();
  };

  const updateTransaction = async (id: string, txn: Partial<Transaction>, oldTxn?: Transaction) => {
    if (!currentUser || !activeMonth) return;
    const ref = doc(db, 'users', currentUser.uid, 'months', activeMonth, 'transactions', id);
    await setDoc(ref, txn, { merge: true });

    if (oldTxn && txn.amount !== undefined) {
      const diff = txn.amount - oldTxn.amount;
      const incDelta = oldTxn.type === 'income' ? diff : 0;
      const expDelta = oldTxn.type === 'expense' ? diff : 0;
      await updateMonthlySummaryTotals(incDelta, expDelta);
      await refreshMonths();
    }
  };

  const deleteTransaction = async (id: string, oldTxn: Transaction) => {
    if (!currentUser || !activeMonth) return;
    const ref = doc(db, 'users', currentUser.uid, 'months', activeMonth, 'transactions', id);
    await deleteDoc(ref);

    const incDelta = oldTxn.type === 'income' ? -oldTxn.amount : 0;
    const expDelta = oldTxn.type === 'expense' ? -oldTxn.amount : 0;
    await updateMonthlySummaryTotals(incDelta, expDelta);
    await refreshMonths();
  };

  const duplicateTransaction = async (id: string) => {
    if (!currentUser || !activeMonth) return;
    const txn = transactions.find(t => t.id === id);
    if (!txn) return;
    
    const { id: _, createdAt: _createdAt, ...rest } = txn;
    await addTransaction(rest);
  };

  const addShortcut = async (shortcut: Omit<Shortcut, 'id'>) => {
    if (!currentUser) return;
    const newRef = doc(collection(db, 'users', currentUser.uid, 'shortcuts'));
    await setDoc(newRef, shortcut);
  };

  const updateShortcut = async (id: string, shortcut: Partial<Shortcut>) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, 'shortcuts', id);
    await setDoc(ref, shortcut, { merge: true });
  };

  const deleteShortcut = async (id: string) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, 'shortcuts', id);
    await deleteDoc(ref);
  };

  return (
    <TransactionContext.Provider value={{
      transactions, shortcuts, loading, 
      addTransaction, updateTransaction, deleteTransaction, duplicateTransaction,
      addShortcut, updateShortcut, deleteShortcut
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
