import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTransactions } from '../context/TransactionContext';
import { useLedger } from '../context/LedgerContext';
import { Edit2, Target, PiggyBank, Save, X, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import { format, startOfMonth, eachDayOfInterval, endOfMonth, parse } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const BudgetsPage: React.FC = () => {
  const { settings, updateSettings } = useFinance();
  const { transactions } = useTransactions();
  const { profile, activeMonth } = useLedger();
  
  const [isEditing, setIsEditing] = useState(false);
  const [budgetVal, setBudgetVal] = useState('');
  const [extraVal, setExtraVal] = useState('');

  const handleEdit = () => {
    setBudgetVal(String(settings.globalBudget || 0));
    setExtraVal(String(settings.extraBudget || 0));
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateSettings({
      globalBudget: Number(budgetVal),
      extraBudget: Number(extraVal),
    });
    setIsEditing(false);
  };

  const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const { spentThisMonth, categoryData, trendData } = useMemo(() => {
    const expenseTxns = transactions.filter(t => t.type === 'expense');
    const spent = expenseTxns.reduce((sum, t) => sum + t.amount, 0);

    const catMap: Record<string, number> = {};
    expenseTxns.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const pieData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a,b) => b.value - a.value);

    // Trend Data - scoped to activeMonth
    const monthDate = activeMonth ? parse(activeMonth, 'yyyy-MM', new Date()) : new Date();
    const startDate = startOfMonth(monthDate);
    const endDate = monthDate.getMonth() === new Date().getMonth() && monthDate.getFullYear() === new Date().getFullYear() 
      ? new Date() 
      : endOfMonth(monthDate);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const areaData = days.map(d => {
      const dStr = format(d, 'yyyy-MM-dd');
      const dSum = expenseTxns.filter(t => t.date === dStr).reduce((s,t) => s + t.amount, 0);
      return { date: format(d, 'dd'), Spent: dSum };
    });

    return { spentThisMonth: spent, categoryData: pieData, trendData: areaData };
  }, [transactions, activeMonth]);

  const effectiveBudget = (settings.globalBudget || 0) + (settings.extraBudget || 0);
  const percentage = effectiveBudget > 0 ? Math.min((spentThisMonth / effectiveBudget) * 100, 100) : 0;
  const isOver = effectiveBudget > 0 && spentThisMonth > effectiveBudget;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', margin: 0 }}>Budget & Savings</h1>
        {!isEditing ? (
          <button 
            onClick={handleEdit}
            style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            <Edit2 size={16} /> Edit Goals
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', padding: '10px', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}><X size={20} /></button>
            <button onClick={handleSave} style={{ background: '#000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}><Save size={16} /> Save</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Base Budget Card */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '50%', color: '#4f46e5' }}><Target size={24} /></div>
            <div>
              <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>Base Monthly Budget</p>
              {isEditing ? (
                <input type="number" value={budgetVal} onChange={e => setBudgetVal(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '150px', fontSize: '18px', fontWeight: 'bold' }} placeholder="Base" />
              ) : (
                <h2 style={{ margin: 0, fontSize: '28px' }}>{fmt(settings.globalBudget || 0)}</h2>
              )}
            </div>
          </div>
          {!isEditing && effectiveBudget > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 600 }}>
                <span style={{ color: '#64748b' }}>Effective (Base+Extra): {fmt(effectiveBudget)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: isOver ? '#ef4444' : '#000' }}>{fmt(spentThisMonth)} spent</span>
                <span style={{ color: '#64748b' }}>{Math.round(percentage)}%</span>
              </div>
              <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${percentage}%`, background: isOver ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981', borderRadius: '99px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Extra Budget Card */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '50%', color: '#2563eb' }}><Plus size={24} /></div>
            <div>
              <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>Extra Budget</p>
              {isEditing ? (
                <input type="number" value={extraVal} onChange={e => setExtraVal(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '150px', fontSize: '18px', fontWeight: 'bold' }} placeholder="Extra" />
              ) : (
                <h2 style={{ margin: 0, fontSize: '28px', color: '#3b82f6' }}>{fmt(settings.extraBudget || 0)}</h2>
              )}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Additional funds for this month.</p>
        </div>

        {/* Savings Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}><PiggyBank size={24} color="#fff" /></div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600 }}>Lifetime Savings</p>
              <h2 style={{ margin: 0, fontSize: '32px' }}>{fmt(profile?.lifetimeSavings || 0)}</h2>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Your savings accumulated over all months.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Category Pie Chart */}
        <div className="card">
          <h3 style={{ margin: '0 0 24px 0' }}>Where is the budget going?</h3>
          {categoryData.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No expenses this month.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '200px', height: '200px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                      {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(val: any) => fmt(Number(val) || 0)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '24px' }}>
                {categoryData.slice(0, 5).map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      {d.name}
                    </div>
                    <span>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Trend Chart */}
        <div className="card">
          <h3 style={{ margin: '0 0 24px 0' }}>Monthly Burn Rate</h3>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="Spent" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorBurn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
