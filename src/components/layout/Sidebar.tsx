import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Repeat, 
  Target, 
  BarChart3, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Monthly Ledger', path: '/ledger', icon: <Target size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <Wallet size={20} /> },
    { name: 'Recurring', path: '/recurring', icon: <Repeat size={20} /> },
    { name: 'Budgets', path: '/budgets', icon: <Target size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="MONETA Logo" style={{ height: '56px', objectFit: 'contain' }} />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive ? 'var(--nav-active-text)' : 'var(--ink)',
              background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '15px',
              transition: 'all 0.2s ease',
            })}
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 16px', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('moneta_theme', isDark ? 'dark' : 'light');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '99px',
            background: 'var(--teal-pale)',
            color: 'var(--teal)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            width: '100%',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Moon size={18} className="dark-hide" />
          <Sun size={18} className="dark-show" style={{ display: 'none' }} />
          Toggle Theme
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
