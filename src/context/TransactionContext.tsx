/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { Transaction, Shortcut } from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  shortcuts: Shortcut[];
  loading: boolean;
  addTransaction: (txn: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, txn: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      setShortcuts([]);
      setLoading(false);
      return;
    }

    const txnsRef = collection(db, 'users', currentUser.uid, 'transactions');
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
  }, [currentUser]);

  const addTransaction = async (txn: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const newRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
    await setDoc(newRef, {
      ...txn,
      createdAt: serverTimestamp()
    });
  };

  const updateTransaction = async (id: string, txn: Partial<Transaction>) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, 'transactions', id);
    await setDoc(ref, txn, { merge: true });
  };

  const deleteTransaction = async (id: string) => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid, 'transactions', id);
    await deleteDoc(ref);
  };

  const duplicateTransaction = async (id: string) => {
    if (!currentUser) return;
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
