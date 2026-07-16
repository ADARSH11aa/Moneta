import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflineFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
          You are currently offline. Some features may not be available.
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {children}
          
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50
          }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px' }}>
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                <WifiOff size={40} />
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: 'var(--ink)' }}>No Internet Connection</h2>
              <p style={{ margin: '0 0 24px 0', color: 'var(--ink-soft)' }}>Please check your network and try again.</p>
              <button 
                onClick={() => window.location.reload()}
                style={{ background: 'var(--teal)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={18} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OfflineFallback;
