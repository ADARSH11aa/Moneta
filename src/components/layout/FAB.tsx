import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Minus, Repeat, ArrowRightLeft, X } from 'lucide-react';

const FAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = (path: string, stateAction: string) => {
    setIsOpen(false);
    navigate(path, { state: { action: stateAction } });
  };

  return (
    <div className="fab-container" ref={menuRef}>
      {isOpen && (
        <div className="fab-menu">
          <button onClick={() => handleAction('/transactions', 'add-expense')}>
            <div style={{ color: 'var(--red)' }}><Minus size={18} /></div> Add Expense
          </button>
          <button onClick={() => handleAction('/transactions', 'add-income')}>
            <div style={{ color: 'var(--teal)' }}><Plus size={18} /></div> Add Income
          </button>
          <button onClick={() => handleAction('/transactions', 'transfer')}>
            <div style={{ color: 'var(--gold)' }}><ArrowRightLeft size={18} /></div> Transfer
          </button>
          <button onClick={() => handleAction('/recurring', 'add-recurring')}>
            <div style={{ color: 'var(--ink)' }}><Repeat size={18} /></div> Recurring
          </button>
        </div>
      )}
      
      <button className="fab-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
};

export default FAB;
