import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { Plus, Trash2, LogOut, Settings as SettingsIcon, Zap } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { shortcuts, addShortcut, deleteShortcut } = useTransactions();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category] = useState('Food');
  const [type] = useState<'expense'|'income'>('expense');

  const handleAddShortcut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    await addShortcut({
      name,
      amount: Number(amount),
      defaultCategory: category,
      type,
      order: shortcuts.length
    });

    setName('');
    setAmount('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', margin: 0 }}>Settings</h1>
        <button 
          onClick={logout}
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}><SettingsIcon size={18} /> Profile</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--ink)' }}>{currentUser?.displayName || 'User'}</h4>
              <p style={{ margin: 0, color: 'var(--ink-soft)' }}>{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="card">
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}><Zap size={18} /> Quick Action Shortcuts</h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '24px' }}>Configure shortcuts that appear on the Transactions page for instant 1-click expense logging.</p>
          
          <form onSubmit={handleAddShortcut} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '24px', padding: '16px', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>Shortcut Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. ☕ Tea" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--ink)' }}>Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="₹20" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)' }} />
            </div>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--ink)', color: 'var(--nav-active-text)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add
            </button>
          </form>

          {shortcuts.length === 0 ? (
            <p style={{ color: 'var(--ink-mute)', fontSize: '14px' }}>No shortcuts created.</p>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {shortcuts.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input-bg)', padding: '8px 12px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, border: '1px solid var(--line)', color: 'var(--ink)' }}>
                  {s.name} <span style={{ color: 'var(--ink-soft)' }}>₹{s.amount}</span>
                  <button onClick={() => deleteShortcut(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, marginLeft: '4px', display: 'flex' }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
