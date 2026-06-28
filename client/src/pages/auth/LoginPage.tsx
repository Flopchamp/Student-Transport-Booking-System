import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bus, Eye, EyeOff, HelpCircle, User, Phone } from 'lucide-react';

type LoginTab = 'parent' | 'admin';
type PageMode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<PageMode>('login');
  const [activeTab, setActiveTab] = useState<LoginTab>('parent');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration-only fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  /** Reset form fields when switching mode */
  const switchMode = (newMode: PageMode) => {
    setMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') navigate('/admin');
      else if (loggedInUser.role === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side quick checks before hitting the API
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } };
      // Show first validation error if array is present, otherwise generic message
      const firstValidation = error.response?.data?.errors?.[0]?.msg;
      setError(firstValidation || error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg font-sans">
      {/* Header */}
      <header className="flex w-full items-center justify-between border-b border-border px-6 md:px-20 py-4 bg-white">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-white">
            <Bus size={20} />
          </div>
          <h2 className="text-lg font-extrabold text-text leading-tight tracking-tight">EduTrans</h2>
        </div>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 text-slate-500 border-none cursor-pointer hover:bg-slate-200 transition-colors">
          <HelpCircle size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-6 py-12">
        <div className="w-full max-w-[480px] bg-white p-8 rounded-xl border border-border shadow-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-text text-3xl font-bold leading-tight mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-text-secondary text-base">
              {mode === 'login'
                ? 'Please enter your details to sign in'
                : 'Register as a parent to book transport'}
            </p>
          </div>

          {/* Role Toggle — only visible on login */}
          {mode === 'login' && (
            <div className="flex mb-8">
              <div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('parent')}
                  className={`flex h-full flex-1 items-center justify-center rounded-md px-4 border-none cursor-pointer text-sm font-semibold transition-all ${
                    activeTab === 'parent'
                      ? 'bg-white shadow-sm text-primary'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Parent
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`flex h-full flex-1 items-center justify-center rounded-md px-4 border-none cursor-pointer text-sm font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-white shadow-sm text-primary'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-500 text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* ==================== LOGIN FORM ==================== */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="flex flex-col gap-2 mb-5">
                <label htmlFor="email" className="text-text text-sm font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-['Material_Symbols_Outlined'] pointer-events-none">mail</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    required
                    className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-12 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2 mb-5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-text text-sm font-semibold">
                    Password
                  </label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary text-xs font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-['Material_Symbols_Outlined'] pointer-events-none">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-12 pr-12 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent border-none cursor-pointer p-0 flex hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex h-12 items-center justify-center rounded-lg bg-primary text-white text-base font-bold border-none cursor-pointer transition-all shadow-md shadow-primary/20 mt-2 hover:bg-primary/90 ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          )}

          {/* ==================== REGISTER FORM ==================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className="text-text text-sm font-semibold">
                    First Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                      minLength={2}
                      maxLength={50}
                      className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className="text-text text-sm font-semibold">
                    Last Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                      minLength={2}
                      maxLength={50}
                      className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2 mb-5">
                <label htmlFor="regEmail" className="text-text text-sm font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-['Material_Symbols_Outlined'] pointer-events-none">mail</span>
                  <input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    required
                    className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-12 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2 mb-5">
                <label htmlFor="phone" className="text-text text-sm font-semibold">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    required
                    minLength={10}
                    maxLength={20}
                    className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2 mb-5">
                <label htmlFor="regPassword" className="text-text text-sm font-semibold">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-['Material_Symbols_Outlined'] pointer-events-none">lock</span>
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-12 pr-12 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent border-none cursor-pointer p-0 flex hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Min 8 chars, with uppercase, lowercase, number &amp; special character.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2 mb-6">
                <label htmlFor="confirmPassword" className="text-text text-sm font-semibold">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-['Material_Symbols_Outlined'] pointer-events-none">lock</span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="flex w-full rounded-lg text-text border border-border bg-white h-12 pl-12 pr-12 text-sm outline-none transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 bg-transparent border-none cursor-pointer p-0 flex hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex h-12 items-center justify-center rounded-lg bg-primary text-white text-base font-bold border-none cursor-pointer transition-all shadow-md shadow-primary/20 hover:bg-primary/90 ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Toggle between Login / Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            {mode === 'login' ? (
              <p className="text-slate-500 text-sm">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-primary font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 flex gap-6">
          <a href="#" className="text-slate-400 text-xs no-underline hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="text-slate-400 text-xs no-underline hover:text-slate-600 transition-colors">Terms of Service</a>
          <a href="#" className="text-slate-400 text-xs no-underline hover:text-slate-600 transition-colors">Contact Support</a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} Student Transport Solutions. All rights reserved.
      </footer>
    </div>
  );
}
