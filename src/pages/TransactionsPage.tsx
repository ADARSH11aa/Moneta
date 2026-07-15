import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { Search, Plus, Star, Copy, Edit2, Trash2, Tag as TagIcon, Zap } from 'lucide-react';
import type { TransactionType } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['Food', 'Transport', 'Bills & subscriptions', 'Shopping', 'Health', 'Entertainment', 'Other'];
const WALLETS = ['Cash', 'UPI', 'Credit Card', 'Bank Account'];

const TransactionsPage: React.FC = () => {
  const { transactions, shortcuts, addTransaction, deleteTransaction, duplicateTransaction, updateTransaction } = useTransactions();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'alpha'>('date');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { success } = useToast();
  
  // Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [wallet, setWallet] = useState(WALLETS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  const openModal = (txn?: any) => {
    if (txn) {
      setEditingId(txn.id);
      setType(txn.type);
      setAmount(String(txn.amount));
      setCategory(txn.category);
      setWallet(txn.walletId);
      setDate(txn.date);
      setNote(txn.note || '');
      setTags(txn.tags || []);
    } else {
      setEditingId(null);
      setType('expense');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setWallet(WALLETS[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setTags([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const txnData = {
      type,
      amount: Number(amount),
      category,
      walletId: wallet,
      date,
      note,
      tags
    };

    if (editingId) {
      const oldTxn = transactions.find(t => t.id === editingId);
      await updateTransaction(editingId, txnData, oldTxn);
      success('Transaction updated');
    } else {
      await addTransaction(txnData);
      success('Transaction added');
    }
    setIsModalOpen(false);
  };

  const handleQuickAdd = async (shortcut: any) => {
    await addTransaction({
      type: shortcut.type,
      amount: shortcut.amount,
      category: shortcut.defaultCategory,
      walletId: WALLETS[0], // Defaulting for shortcut
      date: new Date().toISOString().split('T')[0],
      note: shortcut.name,
      tags: []
    });
    success('Quick shortcut added');
  };

  const toggleFavorite = async (txn: any) => {
    await updateTransaction(txn.id, { isFavorite: !txn.isFavorite }, txn);
    success(txn.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = transactions.filter(t => {
      const query = search.toLowerCase();
      return (
        t.note?.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.walletId.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        String(t.amount).includes(query)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'alpha') return (a.note || '').localeCompare(b.note || '');
      return 0;
    });
  }, [transactions, search, sortBy]);

  const { fmt } = useCurrency();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', margin: 0 }}>Transactions</h1>
        <button 
          onClick={() => openModal()}
          style={{ background: '#000', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> New Transaction
        </button>
      </div>

      {/* Quick Shortcuts */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '16px' }}><Zap size={18} /> Quick Shortcuts</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {shortcuts.length > 0 ? shortcuts.map(s => (
            <button key={s.id} onClick={() => handleQuickAdd(s)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', padding: '8px 16px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px' }}>
              {s.name} <span style={{ color: '#64748b' }}>{fmt(s.amount)}</span>
            </button>
          )) : (
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>No shortcuts defined yet. (Coming soon in Settings)</p>
          )}
        </div>
      </div>

      {/* Filters and List */}
      <div className="card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by merchant, category, tag..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ padding: '0 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="category">Sort by Category</option>
            <option value="alpha">Sort Alphabetically</option>
          </select>
        </div>

        {filteredAndSorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No transactions found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAndSorted.map(txn => (
              <div key={txn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: txn.isFavorite ? 'rgba(250, 204, 21, 0.05)' : '#fff', transition: 'all 0.2s' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{txn.category}</span>
                    <span style={{ fontSize: '13px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '99px' }}>{txn.walletId}</span>
                    {txn.isFavorite && <Star size={14} fill="#eab308" color="#eab308" />}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span>{txn.date}</span>
                    {txn.note && <span>• {txn.note}</span>}
                    {txn.tags && txn.tags.length > 0 && (
                      <span style={{ display: 'flex', gap: '4px' }}>
                        • {txn.tags.map(t => <span key={t} style={{ color: '#3b82f6', fontSize: '12px' }}>#{t}</span>)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: txn.type === 'income' ? '#10b981' : txn.type === 'transfer' ? '#64748b' : '#ef4444' }}>
                    {txn.type === 'income' ? '+' : txn.type === 'transfer' ? '' : '-'} {fmt(txn.amount)}
                  </span>
                  
                  {/* Action Icons */}
                  <div style={{ display: 'flex', gap: '8px', color: '#94a3b8' }}>
                    <button onClick={() => toggleFavorite(txn)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Star size={16} color={txn.isFavorite ? '#eab308' : '#94a3b8'} /></button>
                    <button onClick={() => { duplicateTransaction(txn.id); success('Transaction duplicated'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Copy size={16} /></button>
                    <button onClick={() => openModal(txn)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Edit2 size={16} /></button>
                    <button onClick={() => { deleteTransaction(txn.id, txn); success('Transaction deleted'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal Overlay */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
                  <button type="button" key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: type === t ? '#fff' : 'transparent', fontWeight: type === t ? 600 : 500, boxShadow: type === t ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Wallet</label>
                  <select value={wallet} onChange={e => setWallet(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}>
                    {WALLETS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Note / Merchant</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}><TagIcon size={14} /> Tags</label>
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type and press Enter..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tags.map(t => (
                    <span key={t} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '99px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      #{t} <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#0369a1', fontWeight: 'bold' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '99px', border: 'none', background: '#000', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
