import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Target, BarChart3, Settings } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Ledger', path: '/ledger', icon: <Target size={22} /> },
    { name: 'Transactions', path: '/transactions', icon: <Wallet size={22} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={22} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={22} /> },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
