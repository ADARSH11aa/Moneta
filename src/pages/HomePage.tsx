import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'transparent' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="MONETA Logo" style={{ height: '48px', objectFit: 'contain' }} />
        </div>

        {/* Navigation Links removed per request */}

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentUser ? (
            <Link to="/dashboard" style={{ background: 'var(--teal)', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: 'var(--ink)', fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                Log in
              </Link>
              <Link to="/login" style={{ background: 'var(--teal)', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', zIndex: 10, textAlign: 'center' }}>
        
        {/* Formatting Tag removed per request */}

        {/* Typography */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '900px' }}>
          Track Every Rupee.<br/>Spend Smarter.
        </h1>

        {/* Abstract Glassmorphism Visuals */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '300px', marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Central Frosted Pill */}
          <div style={{ position: 'absolute', width: '300px', height: '140px', background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-card)', borderRadius: '99px', zIndex: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-5deg)' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: '#10b981' }}>+ ₹14,200</span>
          </div>

          {/* Left Floating Ring */}
          <div style={{ position: 'absolute', left: '10%', width: '180px', height: '180px', background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-card)', borderRadius: '50%', zIndex: 2, transform: 'rotate(15deg) translateY(-20px)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M2 12h20M2 12l5-5m-5 5l5 5"/></svg>
             <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: '#ef4444' }}>- ₹2,450</span>
             <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600, marginTop: '2px' }}>Groceries</span>
          </div>

          {/* Right Floating Ring */}
          <div style={{ position: 'absolute', right: '10%', width: '220px', height: '220px', background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-card)', borderRadius: '50%', zIndex: 4, transform: 'rotate(-10deg) translateY(30px)', boxShadow: '0 15px 35px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
             </div>
             <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>Cash Out</span>
             <span style={{ fontSize: '14px', color: 'var(--ink-soft)', fontWeight: 600, marginTop: '4px' }}>₹8,900</span>
          </div>
          
        </div>
      </main>

    </div>
  );
};

export default HomePage;
