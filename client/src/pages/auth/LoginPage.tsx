import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bus, Eye, EyeOff, HelpCircle } from 'lucide-react';

type LoginTab = 'parent' | 'admin';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(activeTab === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f6f7f8', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '16px 80px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#137fec', borderRadius: '8px', color: '#fff' }}>
            <Bus size={20} />
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '18px', fontWeight: 800, lineHeight: '1.25', letterSpacing: '-0.01em' }}>EduTrans</h2>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', height: '40px', width: '40px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}>
          <HelpCircle size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ color: '#0f172a', fontSize: '30px', fontWeight: 700, lineHeight: '1.2', marginBottom: '8px' }}>Welcome Back</h1>
            <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 400 }}>Please enter your details to sign in</p>
          </div>

          {/* Role Toggle */}
          <div style={{ display: 'flex', marginBottom: '32px' }}>
            <div style={{ display: 'flex', height: '48px', flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: '#f1f5f9', padding: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                style={{
                  display: 'flex', height: '100%', flex: 1, alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px', padding: '0 16px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'parent' ? '#fff' : 'transparent',
                  boxShadow: activeTab === 'parent' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  color: activeTab === 'parent' ? '#137fec' : '#64748b',
                }}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                style={{
                  display: 'flex', height: '100%', flex: 1, alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px', padding: '0 16px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'admin' ? '#fff' : 'transparent',
                  boxShadow: activeTab === 'admin' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  color: activeTab === 'admin' ? '#137fec' : '#64748b',
                }}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>!</span>
              </div>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label htmlFor="email" style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', fontFamily: "'Material Symbols Outlined'", pointerEvents: 'none' }}>mail</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  required
                  style={{
                    display: 'flex', width: '100%', borderRadius: '8px', color: '#0f172a',
                    border: '1px solid #e2e8f0', backgroundColor: '#fff', height: '48px',
                    paddingLeft: '48px', paddingRight: '16px', fontSize: '14px', fontWeight: 400,
                    outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px #137fec'; e.target.style.borderColor = 'transparent'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e2e8f0'; }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>
                  Password
                </label>
                <button type="button" style={{ color: '#137fec', fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', fontFamily: "'Material Symbols Outlined'", pointerEvents: 'none' }}>lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    display: 'flex', width: '100%', borderRadius: '8px', color: '#0f172a',
                    border: '1px solid #e2e8f0', backgroundColor: '#fff', height: '48px',
                    paddingLeft: '48px', paddingRight: '48px', fontSize: '14px', fontWeight: 400,
                    outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px #137fec'; e.target.style.borderColor = 'transparent'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = '#e2e8f0'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: '#137fec', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ color: '#475569', fontSize: '14px', cursor: 'pointer' }}>
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', display: 'flex', height: '48px', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', backgroundColor: '#137fec', color: '#fff', fontSize: '16px', fontWeight: 700,
                border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(19,127,236,0.2)',
                opacity: isSubmitting ? 0.6 : 1, marginTop: '8px', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.target as HTMLButtonElement).style.backgroundColor = '#1172d4'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#137fec'; }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Need an account */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Need an account?{' '}
              <a href="#" style={{ color: '#137fec', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.textDecoration = 'none'; }}
              >Contact school administration</a>
            </p>
          </div>
        </div>

        {/* Bottom Links */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Contact Support</a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ width: '100%', padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
        © 2024 Student Transport Solutions. All rights reserved.
      </footer>
    </div>
  );
}
