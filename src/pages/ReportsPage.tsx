import React, { useMemo, useState, useRef } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useFinance } from '../context/FinanceContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { Download, TrendingDown, Wallet, FileText, Image as ImageIcon, FileSpreadsheet, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const ReportsPage: React.FC = () => {
  const { transactions } = useTransactions();
  const { settings } = useFinance();
  const reportRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { chartData, categoryData, kpis } = useMemo(() => {
    // KPI Data
    let income = 0, expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });

    const totalBudget = (settings.globalBudget || 0) + (settings.extraBudget || 0);
    const balance = Math.max(0, totalBudget - expense);

    // Area Chart Data (Last 30 days)
    const areaData = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayTxns = transactions.filter(t => t.date === dateStr);
      let dInc = 0, dExp = 0;
      dayTxns.forEach(t => {
        if (t.type === 'income') dInc += t.amount;
        if (t.type === 'expense') dExp += t.amount;
      });

      areaData.push({
        date: format(date, 'MMM dd'),
        Income: dInc,
        Expense: dExp
      });
    }

    // Pie Chart Data (Category breakdown for Expenses)
    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const pieData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a,b) => b.value - a.value);

    return { chartData: areaData, categoryData: pieData, kpis: { income, expense, balance } };
  }, [transactions, settings.globalBudget, settings.extraBudget]);

  const exportCSV = () => {
    if (transactions.length === 0) return alert('No transactions to export.');
    const headers = ['ID', 'Date', 'Type', 'Category', 'Wallet', 'Amount', 'Note', 'Tags'];
    const rows = transactions.map(t => [
      t.id, t.date, t.type, t.category, t.walletId, t.amount, `"${t.note || ''}"`, `"${(t.tags || []).join(', ')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `moneta_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportImage = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `moneta_report_${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.click();
    } catch (e) {
      console.error(e);
      alert('Failed to export image.');
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`moneta_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to export PDF.');
    }
  };

  const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', margin: 0, color: 'var(--ink)' }}>Reports</h1>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{ background: 'var(--ink)', color: 'var(--nav-active-text)', border: 'none', padding: '12px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
          >
            <Download size={18} /> Export <ChevronDown size={18} />
          </button>
          
          {showExportMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '16px', padding: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', backdropFilter: 'blur(20px)', zIndex: 50, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button 
                onClick={() => { exportCSV(); setShowExportMenu(false); }}
                style={{ background: 'transparent', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ink)', fontWeight: 500, textAlign: 'left', width: '100%', fontFamily: "'Inter', sans-serif" }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileSpreadsheet size={16} color="var(--teal)" /> CSV Data
              </button>
              <button 
                onClick={() => { exportImage(); setShowExportMenu(false); }}
                style={{ background: 'transparent', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ink)', fontWeight: 500, textAlign: 'left', width: '100%', fontFamily: "'Inter', sans-serif" }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ImageIcon size={16} color="var(--teal)" /> Image (PNG)
              </button>
              <button 
                onClick={() => { exportPDF(); setShowExportMenu(false); }}
                style={{ background: 'transparent', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ink)', fontWeight: 500, textAlign: 'left', width: '100%', fontFamily: "'Inter', sans-serif" }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={16} color="var(--teal)" /> PDF Document
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={reportRef} style={{ padding: '2px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: '50%' }}><TrendingDown size={24} /></div>
            <div>
              <p style={{ color: 'var(--ink-soft)', margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Total Expense</p>
              <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--ink)' }}>{fmt(kpis.expense)}</h2>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--teal-pale)', color: 'var(--teal)', padding: '16px', borderRadius: '50%' }}><Wallet size={24} /></div>
            <div>
              <p style={{ color: 'var(--ink-soft)', margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Net Balance</p>
              <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--ink)' }}>{fmt(kpis.balance)}</h2>
            </div>
          </div>
        </div>

        <div className="dashboard-grid-main">
          {/* Spend Analysis Area Chart */}
          <div className="card">
            <h3 style={{ margin: '0 0 24px 0', color: 'var(--ink)' }}>Spend Analysis (Last 30 Days)</h3>
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--ink-mute)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--ink)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Pie Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 24px 0', color: 'var(--ink)' }}>Expenses by Category</h3>
            {categoryData.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)' }}>No expenses found.</div>
            ) : (
              <>
                <div style={{ width: '100%', height: '250px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                        {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--ink)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} formatter={(val: any) => fmt(Number(val) || 0)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '150px' }}>
                  {categoryData.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        {d.name}
                      </div>
                      <span>{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
