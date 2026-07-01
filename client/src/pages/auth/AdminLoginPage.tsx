import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, Eye, EyeOff, Bus } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.');
        return;
      }
      navigate('/admin');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans">
      {/* Header */}
      <header className="flex w-full items-center justify-between px-6 md:px-20 py-5">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-white">
            <Bus size={20} />
          </div>
          <span className="text-white text-lg font-extrabold tracking-tight">EduTrans</span>
        </button>
        <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">Admin Portal</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        {/* Icon badge */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>

        <div className="w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-bold mb-1">Administrator Sign In</h1>
            <p className="text-slate-400 text-sm">Restricted access — authorised personnel only</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-2 mb-5">
              <label htmlFor="adminEmail" className="text-slate-300 text-sm font-semibold">
                Email Address
              </label>
              <input
                id="adminEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white h-12 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-500"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 mb-8">
              <div className="flex justify-between items-center">
                <label htmlFor="adminPassword" className="text-slate-300 text-sm font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-primary text-xs font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white h-12 pl-4 pr-12 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent border-none cursor-pointer p-0 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex h-12 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold border-none cursor-pointer transition-all shadow-lg shadow-primary/30 hover:bg-primary/90 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs">
              Not an administrator?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary bg-transparent border-none cursor-pointer p-0 hover:underline text-xs font-semibold"
              >
                Parent login
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-slate-700 text-xs">
        &copy; {new Date().getFullYear()} Student Transport Solutions. All rights reserved.
      </footer>
    </div>
  );
}
