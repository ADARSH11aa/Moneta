import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useLedger } from '../../context/LedgerContext';
import { format } from 'date-fns';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeMonth, setActiveMonth } = useLedger();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent', flexDirection: 'column' }}>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      
      <div className="mobile-header">
        <img src="/logo.png" alt="MONETA Logo" className="logo" />
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="layout-main">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {activeMonth && activeMonth !== currentMonth && (
              <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px 24px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <span style={{ fontWeight: 500 }}>You are viewing a past month's ledger.</span>
                <button onClick={() => setActiveMonth(currentMonth)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Return to Current Month</button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
