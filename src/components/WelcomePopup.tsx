import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { format, parse } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const WelcomePopup: React.FC = () => {
  const { showWelcomePopup, setShowWelcomePopup, rolledOverMonth } = useLedger();
  const navigate = useNavigate();

  if (!showWelcomePopup || !rolledOverMonth) return null;

  const monthName = format(parse(rolledOverMonth, 'yyyy-MM', new Date()), 'MMMM');
  const currentMonthName = format(new Date(), 'MMMM');

  const handleViewReport = () => {
    setShowWelcomePopup(false);
    navigate('/ledger');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>Welcome to {currentMonthName}!</h2>
        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
          {monthName} has been archived successfully.<br/>Your new monthly workspace is ready.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexDirection: 'column' }}>
          <button onClick={handleViewReport} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
            View {monthName} Report
          </button>
          <button onClick={() => setShowWelcomePopup(false)} style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
