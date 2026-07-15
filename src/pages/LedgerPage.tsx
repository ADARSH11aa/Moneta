import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { format, parse } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';

const LedgerPage: React.FC = () => {
  const { availableMonths, setActiveMonth } = useLedger();
  const navigate = useNavigate();

  const handleSelectMonth = (monthId: string) => {
    setActiveMonth(monthId);
    navigate('/dashboard');
  };

  const fmt = (n: number) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', margin: '0 0 24px 0' }}>Monthly Ledger</h1>
      
      {availableMonths.length === 0 ? (
        <p style={{ color: '#64748b' }}>No historical data available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {availableMonths.map((m) => {
            const mDate = parse(m.id, 'yyyy-MM', new Date());
            const isCurrent = m.id === format(new Date(), 'yyyy-MM');
            
            return (
              <div 
                key={m.id} 
                className="card" 
                onClick={() => handleSelectMonth(m.id)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {isCurrent && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#dbeafe', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                    Current Month
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '50%', color: '#64748b' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px' }}>{format(mDate, 'MMMM yyyy')}</h3>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Click to view details</p>
                    </div>
                  </div>
                  <ChevronRight size={24} color="#cbd5e1" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14} color="#10b981" /> Income</p>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{fmt(m.income)}</div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingDown size={14} color="#ef4444" /> Expense</p>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{fmt(m.expense)}</div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><PiggyBank size={14} color="#3b82f6" /> Savings</p>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: m.savings >= 0 ? '#10b981' : '#ef4444' }}>{fmt(m.savings)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LedgerPage;
