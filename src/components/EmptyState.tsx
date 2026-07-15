import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      background: 'var(--bg-card)',
      borderRadius: '24px',
      border: '1px dashed var(--border-card)'
    }}>
      <div style={{ background: 'var(--teal-pale)', padding: '20px', borderRadius: '50%', marginBottom: '24px', color: 'var(--teal)' }}>
        <Icon size={40} />
      </div>
      <h3 style={{ margin: '0 0 8px 0', color: 'var(--ink)', fontSize: '20px' }}>{title}</h3>
      <p style={{ margin: '0 0 24px 0', color: 'var(--ink-soft)', maxWidth: '400px' }}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
