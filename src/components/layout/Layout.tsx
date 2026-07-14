import React from 'react';
import Sidebar from './Sidebar';
import { useLedger } from '../../context/LedgerContext';
import { format } from 'date-fns';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeMonth, setActiveMonth } = useLedger();
  const currentMonth = format(new Date(), 'yyyy-MM');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '240px', padding: '40px', overflowY: 'auto', height: '100vh' }}>
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
  );
};

export default Layout;
