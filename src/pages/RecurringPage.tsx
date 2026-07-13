import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Edit2, Trash2, Calendar, CreditCard } from 'lucide-react';
import type { Subscription } from '../types';

const RecurringPage: React.FC = () => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useFinance();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDate, setBillingDate] = useState('1');
  const [frequency, setFrequency] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [paymentMethod, setPaymentMethod] = useState('');

  const openModal = (s?: Subscription) => {
    if (s) {
      setEditingId(s.id);
      setName(s.name);
      setAmount(String(s.amount));
      setBillingDate(String(s.billingDate));
      setFrequency(s.frequency);
      setPaymentMethod(s.paymentMethod || '');
    } else {
      setEditingId(null);
      setName('');
      setAmount('');
      setBillingDate('1');
      setFrequency('Monthly');
      setPaymentMethod('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    
    const subData = { name, amount: Number(amount), billingDate: Number(billingDate), frequency, paymentMethod };
    
    if (editingId) {
      await updateSubscription(editingId, subData);
    } else {
      await addSubscription(subData);
    }
    setIsModalOpen(false);
  };

  const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const { monthlyTotal, yearlyTotal } = useMemo(() => {
    let m = 0, y = 0;
    subscriptions.forEach(s => {
      if (s.frequency === 'Monthly') { m += s.amount; y += s.amount * 12; }
      else if (s.frequency === 'Yearly') { m += s.amount / 12; y += s.amount; }
      else if (s.frequency === 'Weekly') { m += s.amount * 4.33; y += s.amount * 52; }
    });
    return { monthlyTotal: m, yearlyTotal: y };
  }, [subscriptions]);

  const sortedSubs = [...subscriptions].sort((a, b) => a.billingDate - b.billingDate);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', margin: 0 }}>Subscriptions</h1>
        <button 
          onClick={() => openModal()}
          style={{ background: '#000', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> Add Subscription
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
          <p style={{ color: '#94a3b8', margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>Total Monthly Fixed Cost</p>
          <h2 style={{ margin: 0, fontSize: '32px' }}>{fmt(monthlyTotal)}</h2>
        </div>
        <div className="card" style={{ background: '#fff' }}>
          <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>Total Yearly Fixed Cost</p>
          <h2 style={{ margin: 0, fontSize: '32px' }}>{fmt(yearlyTotal)}</h2>
        </div>
      </div>

      <div className="card">
        {sortedSubs.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No recurring payments added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedSubs.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#fff' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.name} <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>{s.frequency}</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Bills on {s.billingDate}</span>
                    {s.paymentMethod && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={14} /> {s.paymentMethod}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontWeight: 700, fontSize: '18px' }}>{fmt(s.amount)}</span>
                  <div style={{ display: 'flex', gap: '8px', color: '#94a3b8' }}>
                    <button onClick={() => openModal(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Edit2 size={16} /></button>
                    <button onClick={() => deleteSubscription(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>{editingId ? 'Edit Subscription' : 'New Subscription'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Service Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} placeholder="e.g. Netflix, Gym" />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Amount (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Frequency</label>
                  <select value={frequency} onChange={e => setFrequency(e.target.value as any)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Billing Date (1-31)</label>
                  <input type="number" min="1" max="31" value={billingDate} onChange={e => setBillingDate(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Payment Method</label>
                  <input type="text" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} placeholder="e.g. HDFC Credit" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '99px', border: 'none', background: '#000', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Subscription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringPage;
