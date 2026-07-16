import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LedgerProvider } from './context/LedgerContext';
import { TransactionProvider } from './context/TransactionContext';
import { FinanceProvider } from './context/FinanceContext';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import WelcomePopup from './components/WelcomePopup';
import PwaUpdater from './components/PwaUpdater';
import OfflineFallback from './components/OfflineFallback';

const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const RecurringPage = lazy(() => import('./pages/RecurringPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const LedgerPage = lazy(() => import('./pages/LedgerPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null;
  
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

const ThemeInjector = () => {
  const { preferences } = usePreferences();

  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply dynamic theme variables
    root.style.setProperty('--teal', preferences.accentColor);
    
    // Convert hex to rgb for pale variant (simplistic approximation for glass)
    const hex = preferences.accentColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    root.style.setProperty('--teal-pale', `rgba(${r}, ${g}, ${b}, 0.15)`);

    // Apply glass blur
    const glassEl = document.querySelector('.global-overlay') as HTMLElement;
    if (glassEl) {
      glassEl.style.backdropFilter = `blur(${preferences.blurIntensity}px)`;
      glassEl.style.opacity = `${preferences.glassIntensity / 100}`;
    }
  }, [preferences]);

  return null;
};

// Generic loader fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '50vh', color: 'var(--ink-mute)' }}>
    Loading...
  </div>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PreferencesProvider>
          <LedgerProvider>
            <TransactionProvider>
              <FinanceProvider>
                <ThemeInjector />
                <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -2, overflow: 'hidden' }}>
                    <video autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                      <source src="/bg.mp4" type="video/mp4" />
                    </video>
                  </div>
                  
                  <div className="global-overlay"></div>

                  <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
                    <Router>
                      <OfflineFallback>
                        <Suspense fallback={<PageLoader />}>
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
                        </Suspense>
                      </OfflineFallback>
                    </Router>
                    <PwaUpdater />
                  </div>
                </div>
              </FinanceProvider>
            </TransactionProvider>
          </LedgerProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
