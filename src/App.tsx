import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import RecurringPage from './pages/RecurringPage';
import BudgetsPage from './pages/BudgetsPage';
import LedgerPage from './pages/LedgerPage';

import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LedgerProvider } from './context/LedgerContext';
import { TransactionProvider } from './context/TransactionContext';
import { FinanceProvider } from './context/FinanceContext';
import Layout from './components/layout/Layout';
import WelcomePopup from './components/WelcomePopup';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Layout>{children}</Layout>
      <WelcomePopup />
    </>
  );
};

function App() {
  useEffect(() => {
    if (localStorage.getItem('moneta_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <LedgerProvider>
        <TransactionProvider>
          <FinanceProvider>
            <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
              {/* Global Video Background */}
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -2, overflow: 'hidden' }}>
                <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                  <source src="/bg.mp4" type="video/mp4" />
                </video>
              </div>
              
              {/* Global Glassmorphism Tint Overlay */}
              <div className="global-overlay"></div>

              {/* Application Content */}
              <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
                <Router>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/ledger" element={<ProtectedRoute><LedgerPage /></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                    <Route path="/recurring" element={<ProtectedRoute><RecurringPage /></ProtectedRoute>} />
                    <Route path="/budgets" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />

                    <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  </Routes>
                </Router>
              </div>
            </div>
          </FinanceProvider>
        </TransactionProvider>
      </LedgerProvider>
    </AuthProvider>
  );
}

export default App;
