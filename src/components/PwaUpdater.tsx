import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const PwaUpdater: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: 'var(--nav-active-text)', padding: '16px 20px',
      borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', zIndex: 10000, minWidth: '320px',
      animation: 'slideInRight 0.3s ease-out forwards'
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
          {needRefresh ? 'Update Available' : 'App ready to work offline'}
        </h4>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          {needRefresh ? 'A new version of Moneta is available.' : 'Moneta has been cached for offline use.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {needRefresh && (
          <button 
            onClick={() => updateServiceWorker(true)}
            style={{ background: 'var(--teal)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        )}
        <button 
          onClick={close}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default PwaUpdater;
