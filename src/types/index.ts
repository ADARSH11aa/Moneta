export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  walletId: string;
  date: string; // YYYY-MM-DD
  note: string;
  tags: string[];
  receiptUrl?: string;
  isFavorite?: boolean;
  createdAt?: any; // Firestore timestamp
}

export interface Shortcut {
  id: string;
  name: string;
  amount: number;
  defaultCategory: string;
  type: TransactionType;
  order: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDate: number; // 1-31
  frequency: 'Weekly' | 'Monthly' | 'Yearly';
  paymentMethod: string;
}

export interface FinanceSettings {
  globalBudget: number;
  totalSavings: number;
  extraBudget?: number;
}

export interface UserProfile {
  email: string;
  displayName: string;
  createdAt?: any;
  lastActiveMonth?: string; // YYYY-MM format
  lifetimeSavings?: number;
}

export interface MonthlySummary {
  id: string; // YYYY-MM format
  income: number;
  expense: number;
  budget: number;
  savings: number;
}

export interface UserPreferences {
  currency: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  glassIntensity: number;
  blurIntensity: number;
  notifications: {
    monthlyReminder: boolean;
    budgetWarning: boolean;
    recurringReminder: boolean;
  };
}
