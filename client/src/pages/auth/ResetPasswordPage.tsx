import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
        confirm_password: confirmPassword,
      });

      // Store the new JWT so the user is logged in immediately
      const newToken = res.data?.data?.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
      }

      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } };
      const firstValidation = error.response?.data?.errors?.[0]?.msg;
      setError(firstValidation || error.response?.data?.message || 'Reset failed. The link may be expired.');
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
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-6 py-12">
        <div className="w-full max-w-[480px] bg-white p-8 rounded-xl border border-border shadow-sm">
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-sm text-slate-500 bg-transparent border-none cursor-pointer p-0 mb-6 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          {!success ? (
            <>
              {/* Title */}
              <div className="mb-8">
                <h1 className="text-text text-2xl font-bold leading-tight mb-2">
                  Reset Password
                </h1>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Enter your new password below. It must be at least 8 characters with uppercase,
                  lowercase, number, and special character.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="flex flex-col gap-2 mb-5">
                  <label htmlFor="password" className="text-text text-sm font-semibold">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-['Material_Symbols_Outlined'] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="password"
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-['Material_Symbols_Outlined'] pointer-events-none">
                      lock
                    </span>
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
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-text text-xl font-bold mb-2">Password Reset!</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex h-12 items-center justify-center rounded-lg bg-primary text-white text-base font-bold border-none cursor-pointer transition-all shadow-md shadow-primary/20 hover:bg-primary/90"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} Student Transport Solutions. All rights reserved.
      </footer>
    </div>
  );
}
