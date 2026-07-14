import React, { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useFinance } from '../context/FinanceContext';
import { useLedger } from '../context/LedgerContext';
import { ArrowRight, TrendingUp, TrendingDown, Calendar, AlertCircle, PiggyBank, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parse } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { transactions } = useTransactions();
  const { settings, subscriptions } = useFinance();
  const { profile, activeMonth } = useLedger();

  const fmt = (n: number) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
  const monthName = activeMonth ? format(parse(activeMonth, 'yyyy-MM', new Date()), 'MMMM yyyy') : '';

  const { income, expense, recentTxns, effectiveBudget, remainingBudget } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });

    const effBudget = (settings.globalBudget || 0) + (settings.extraBudget || 0);
    const remBudget = effBudget - exp;

    return { 
      income: inc,
      expense: exp,
      recentTxns: transactions.slice(0, 5), // Assuming transactions are already sorted desc
      effectiveBudget: effBudget,
      remainingBudget: remBudget
    };
  }, [transactions, settings.globalBudget, settings.extraBudget]);

  const upcomingBills = useMemo(() => {
    const today = new Date().getDate();
    return subscriptions
      .filter(s => s.billingDate >= today && s.billingDate <= today + 7)
      .sort((a,b) => a.billingDate - b.billingDate);
  }, [subscriptions]);

  const topCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const sorted = Object.keys(catMap).sort((a,b) => catMap[b] - catMap[a]);
    return sorted.length > 0 ? { name: sorted[0], amount: catMap[sorted[0]] } : null;
  }, [transactions]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', margin: 0 }}>Overview</h1>
        <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
          {monthName}
        </div>
      </div>
      
      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>Monthly Income</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={20} /> {fmt(income)}</h2>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>Monthly Expense</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingDown size={20} /> {fmt(expense)}</h2>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>Remaining Budget</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: remainingBudget >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={20} /> {fmt(remainingBudget)}</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Base + Extra ({fmt(effectiveBudget)})</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>Lifetime Savings</p>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}><PiggyBank size={20} /> {fmt(profile?.lifetimeSavings || 0)}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent Transactions */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Recent Transactions</h3>
              <Link to="/transactions" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>View All <ArrowRight size={14} /></Link>
            </div>
            {recentTxns.length === 0 ? (
              <p style={{ color: '#64748b' }}>No transactions this month.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentTxns.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{t.category}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{t.date} {t.note && `• ${t.note}`}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: t.type === 'income' ? '#10b981' : t.type === 'expense' ? '#ef4444' : '#64748b' }}>
                      {t.type === 'income' ? '+' : t.type === 'transfer' ? '' : '-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Pulse */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Budget Pulse</h3>
              <Link to="/budgets" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Manage <ArrowRight size={14} /></Link>
            </div>
            
            {settings.globalBudget > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const percentage = Math.min((expense / effectiveBudget) * 100, 100) || 0;
                  const isOver = expense > effectiveBudget;

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Effective Monthly Budget</span>
                        <span style={{ color: isOver ? '#ef4444' : '#64748b' }}>{Math.round(percentage)}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: isOver ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981', borderRadius: '99px' }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No global budget configured.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Category */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18} /> Top Spending Category</h3>
            {topCategory ? (
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '28px' }}>{topCategory.name}</h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', fontWeight: 600 }}>{fmt(topCategory.amount)} spent this month</p>
              </div>
            ) : (
              <p style={{ margin: 0, opacity: 0.9 }}>No expenses this month.</p>
            )}
          </div>

          {/* Upcoming Bills */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Upcoming Bills (7 Days)</h3>
              <Link to="/recurring" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>All</Link>
            </div>
            {upcomingBills.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No bills due in the next 7 days.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingBills.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Due on {s.billingDate}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{fmt(s.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
