import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useLedger } from '../context/LedgerContext';
import { useFinance } from '../context/FinanceContext';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../hooks/useCurrency';
import { User, Wallet, DollarSign, Palette, Bell, Database, Info, LogOut, Zap, Trash2, Shield, FileSpreadsheet, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'transactions', label: 'Transactions', icon: Wallet },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'about', label: 'About', icon: Info },
];

const CURRENCIES = ['₹', '$', '€', '£'];

const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { shortcuts, addShortcut, deleteShortcut, transactions } = useTransactions();
  const { profile } = useLedger();
  const { settings } = useFinance();
  const { preferences, updatePreferences } = usePreferences();
  const { success, error } = useToast();
  const { fmt } = useCurrency();
  
  const [activeTab, setActiveTab] = useState('account');
  
  // Shortcut form
  const [scName, setScName] = useState('');
  const [scAmount, setScAmount] = useState('');
  
  const handleAddShortcut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scName || !scAmount) return;
    await addShortcut({ name: scName, amount: Number(scAmount), defaultCategory: 'Food', type: 'expense', order: shortcuts.length });
    setScName(''); setScAmount('');
    success('Shortcut added');
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return error('No transactions to export.');
    const headers = ['Date', 'Type', 'Category', 'Wallet', 'Amount', 'Note'];
    const rows = transactions.map(t => [t.date, t.type, t.category, t.walletId, t.amount, `"${t.note || ''}"`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `moneta_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('CSV Exported');
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) return error('No data to export.');
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text('Moneta Financial Report', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Date: ${format(new Date(), 'yyyy-MM-dd')}`, 20, 30);
    pdf.text(`Total Transactions: ${transactions.length}`, 20, 40);
    pdf.text(`Current Budget: ${fmt(settings.globalBudget)}`, 20, 50);
    pdf.save(`moneta_summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    success('PDF Summary Exported');
  };

  return (
    <div className="settings-layout" style={{ margin: '0 auto' }}>
      
      {/* Sidebar Navigation */}
      <div className="card settings-sidebar">
        <h2 style={{ fontSize: '18px', margin: '0 0 16px 8px', color: 'var(--ink)' }}>Settings</h2>
        <div className="tab-list">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '12px', border: 'none', background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                  color: isActive ? 'var(--nav-active-text)' : 'var(--ink-soft)',
                  fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {activeTab === 'account' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 24px 0' }}>Account</h1>
            <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16,185,129,0.05) 100%)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(16,185,129,0.4)' }}>
                {currentUser?.email?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>{currentUser?.displayName || 'Moneta User'}</h3>
                <p style={{ margin: '0 0 8px 0', color: 'var(--ink-soft)' }}>{currentUser?.email}</p>
                <span style={{ fontSize: '12px', background: 'var(--teal-pale)', color: 'var(--teal)', padding: '4px 10px', borderRadius: '99px', fontWeight: 600 }}>
                  Member since {profile?.createdAt ? (typeof profile.createdAt.toDate === 'function' ? format(profile.createdAt.toDate(), 'MMM yyyy') : format(new Date(profile.createdAt), 'MMM yyyy')) : 'Recently'}
                </span>
              </div>
              <button onClick={() => { logout(); success('Logged out successfully'); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <LogOut size={16} /> Logout
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ color: 'var(--ink-soft)', margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Total Transactions</p>
                <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--ink)' }}>{transactions.length}</h2>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ color: 'var(--ink-soft)', margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Lifetime Savings</p>
                <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--ink)' }}>{fmt(profile?.lifetimeSavings || 0)}</h2>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <p style={{ color: 'var(--ink-soft)', margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Current Budget</p>
                <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--ink)' }}>{fmt(settings.globalBudget || 0)}</h2>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 24px 0' }}>Transactions</h1>
            
            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} /> Quick Action Shortcuts</h3>
              <form onSubmit={handleAddShortcut} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Shortcut Name (e.g., Coffee)" value={scName} onChange={e => setScName(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--input-bg)', color: 'var(--ink)' }} />
                <input type="number" placeholder="Amount" value={scAmount} onChange={e => setScAmount(e.target.value)} style={{ width: '120px', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--input-bg)', color: 'var(--ink)' }} />
                <button type="submit" style={{ padding: '10px 20px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
              </form>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                {shortcuts.map(s => (
                  <div key={s.id} style={{ background: 'var(--teal-pale)', color: 'var(--teal)', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                    {s.name} ({fmt(s.amount)})
                    <button onClick={() => { deleteShortcut(s.id); success('Shortcut deleted'); }} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0 }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 24px 0' }}>Finance</h1>
            
            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Currency Selector</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {CURRENCIES.map(c => (
                  <button 
                    key={c}
                    onClick={() => { updatePreferences({ currency: c }); success(`Currency changed to ${c}`); }}
                    style={{
                      width: '48px', height: '48px', borderRadius: '12px', fontSize: '20px', fontWeight: 600, cursor: 'pointer',
                      background: preferences.currency === c ? 'var(--teal)' : 'var(--input-bg)',
                      color: preferences.currency === c ? '#fff' : 'var(--ink)',
                      border: preferences.currency === c ? 'none' : '1px solid var(--line)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Monthly Reset</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '16px' }}>Moneta automatically archives your ledger on the 1st of every month.</p>
              <button style={{ background: 'var(--input-bg)', color: 'var(--ink)', border: '1px solid var(--line)', padding: '10px 16px', borderRadius: '12px', fontWeight: 600 }}>Reset Settings Managed Automatically</button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 24px 0' }}>Appearance</h1>
            
            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Theme</h3>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--input-bg)', padding: '6px', borderRadius: '16px', width: 'fit-content' }}>
                {['light', 'dark', 'system'].map(t => (
                  <button 
                    key={t}
                    onClick={() => updatePreferences({ theme: t as any })}
                    style={{
                      padding: '8px 24px', borderRadius: '10px', textTransform: 'capitalize', cursor: 'pointer', fontWeight: 600,
                      background: preferences.theme === t ? 'var(--bg-card)' : 'transparent',
                      color: preferences.theme === t ? 'var(--ink)' : 'var(--ink-soft)',
                      border: 'none', boxShadow: preferences.theme === t ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Accent Color</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['#0f766e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'].map(color => (
                  <button 
                    key={color}
                    onClick={() => updatePreferences({ accentColor: color })}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%', background: color, border: 'none', cursor: 'pointer',
                      outline: preferences.accentColor === color ? `2px solid var(--ink)` : 'none', outlineOffset: '2px'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Glass Effect Intensity</h3>
              <input 
                type="range" min="0" max="100" value={preferences.glassIntensity} 
                onChange={(e) => updatePreferences({ glassIntensity: Number(e.target.value) })}
                style={{ width: '100%', maxWidth: '300px' }}
              />
              
              <h3 style={{ margin: '24px 0 16px 0', fontSize: '16px' }}>Background Blur</h3>
              <input 
                type="range" min="0" max="40" value={preferences.blurIntensity} 
                onChange={(e) => updatePreferences({ blurIntensity: Number(e.target.value) })}
                style={{ width: '100%', maxWidth: '300px' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 24px 0' }}>Notifications</h1>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'monthlyReminder', label: 'Monthly Reminder', desc: 'Get reminded to check your monthly summary.' },
                { id: 'budgetWarning', label: 'Budget Exceeded Alert', desc: 'Alert when you cross 80% of your budget.' },
                { id: 'recurringReminder', label: 'Recurring Reminder', desc: 'Remind before a recurring bill is due.' },
              ].map(opt => (
                <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--ink)' }}>{opt.label}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)' }}>{opt.desc}</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={(preferences.notifications as any)[opt.id]}
                      onChange={(e) => {
                        updatePreferences({ notifications: { ...preferences.notifications, [opt.id]: e.target.checked } });
                        success('Preferences saved');
                      }}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--teal)' }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 24px 0' }}>Data Export</h1>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--input-bg)', borderRadius: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FileSpreadsheet size={16} /> Export to CSV</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)' }}>Download all transactions in a spreadsheet.</p>
                </div>
                <button onClick={handleExportCSV} style={{ padding: '10px 16px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Download CSV</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--input-bg)', borderRadius: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Export to PDF</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)' }}>Download a summary report in PDF.</p>
                </div>
                <button onClick={handleExportPDF} style={{ padding: '10px 16px', background: 'var(--ink)', color: 'var(--nav-active-text)', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Download PDF</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', margin: '0 0 24px 0' }}>About Moneta</h1>
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <img src="/logo.png" alt="Moneta" style={{ height: '40px', marginBottom: '16px' }} />
              <h2 style={{ margin: '0 0 8px 0', color: 'var(--ink)' }}>Moneta Finance</h2>
              <p style={{ color: 'var(--ink-soft)', margin: '0 0 24px 0' }}>Version 2.0.0 (Premium Build)</p>
              
              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '12px', textAlign: 'left', background: 'var(--input-bg)', padding: '24px', borderRadius: '16px', minWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Developer</span>
                  <span style={{ fontWeight: 600 }}>Deepmind Team</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Firebase Status</span>
                  <span style={{ fontWeight: 600, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={14}/> Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-soft)' }}>Links</span>
                  <span style={{ fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}>Privacy Policy • Terms</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;
