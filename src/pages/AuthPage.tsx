import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithApple, loginWithEmail, signUpWithEmail, currentUser } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || "Google login failed");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError('');
      await loginWithApple();
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || "Apple login failed");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    try {
      setError('');
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || "Authentication failed");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: '1000px',
        minHeight: '600px',
        background: 'var(--bg-main)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        
        {/* Left Column (Auth Form) */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', color: 'var(--ink)', margin: '0 0 8px 0' }}>
              {isSignUp ? 'Create Account!' : 'Welcome Back!'}
            </h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '32px' }}>
              {isSignUp ? 'Please enter details to sign up below' : 'Please enter log in details below'}
            </p>

            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    width: '100%', padding: '16px 20px', borderRadius: '12px', 
                    border: '1px solid var(--line)', background: 'transparent', 
                    color: 'var(--ink)', fontSize: '14px', outline: 'none' 
                  }} 
                />
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    width: '100%', padding: '16px 20px', borderRadius: '12px', 
                    border: '1px solid var(--line)', background: 'transparent', 
                    color: 'var(--ink)', fontSize: '14px', outline: 'none' 
                  }} 
                />
              </div>

              {!isSignUp && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ink)', cursor: 'pointer', fontWeight: 600 }}>Forget password?</span>
                </div>
              )}

              {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}

              <button 
                type="submit"
                style={{ 
                  background: 'var(--ink)', color: 'var(--nav-active-text)', border: 'none', 
                  padding: '16px 24px', borderRadius: '12px', fontSize: '15px', 
                  fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: '8px'
                }}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>or continue</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleGoogleSignIn}
                style={{ 
                  background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', 
                  padding: '14px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, 
                  cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', gap: '10px' 
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="currentColor"/>
                  <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="currentColor"/>
                  <path d="M5.50253 14.3003C5.00318 12.8099 5.00318 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="currentColor"/>
                  <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.08405 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="currentColor"/>
                </svg>
                Log in with Google
              </button>

              <button 
                onClick={handleAppleSignIn}
                style={{ 
                  background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', 
                  padding: '14px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, 
                  cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', gap: '10px' 
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C12 2 12.7 4 14.5 4C16.3 4 16.7 2.4 16.7 2.4C16.7 2.4 16 0.3 14 0.3C12 0.3 12 2 12 2ZM19.2 16.2C19.2 16.2 21.6 15 22 12.5C22 12.5 19.3 11 19.2 8C19.1 5 21.4 3.7 21.4 3.7C21.4 3.7 19.6 1.5 16.6 1.6C13.6 1.7 12 4 12 4C12 4 10.2 2 7.5 2.1C4.8 2.2 2 4.6 2 9.5C2 14.4 6.5 21.5 9.5 21.6C12.5 21.7 12 19 12 19C12 19 12.4 21.7 15 21.6C17.6 21.5 19.2 16.2 19.2 16.2Z" fill="currentColor"/>
                </svg>
                Log in with Apple
              </button>
            </div>

            <div style={{ marginTop: '32px', fontSize: '13px', color: 'var(--ink-soft)', textAlign: 'center' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span 
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}
              >
                {isSignUp ? 'Sign in' : 'Sign Up'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Illustration & Marketing) */}
        <div 
          className="auth-right-pane" 
          style={{ 
            flex: 1, 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            position: 'relative', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px',
            color: '#fff',
            borderLeft: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <img 
            src="/logo.png" 
            alt="Moneta Logo" 
            style={{ 
              width: '100%', 
              maxWidth: '280px', 
              maxHeight: '280px', 
              objectFit: 'contain', 
              marginBottom: '40px'
            }} 
          />
          <h2 style={{ fontSize: '28px', margin: '0 0 16px 0', fontFamily: "'Space Grotesk', sans-serif", textAlign: 'center' }}>
            Manage your Money Anywhere
          </h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', textAlign: 'center', maxWidth: '320px', margin: 0, lineHeight: 1.6 }}>
            You can manage your money on the go with PocketLedger on the web.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;

