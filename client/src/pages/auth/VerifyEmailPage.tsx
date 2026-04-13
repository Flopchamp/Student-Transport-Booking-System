import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, Bus } from 'lucide-react';
import api from '../../lib/api';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (err: unknown) {
        setStatus('error');
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          || 'Verification failed. The link may be invalid or expired.';
        setMessage(msg);
      }
    };

    verify();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-14 h-14 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-text-primary mb-2">Invalid Link</h1>
          <p className="text-sm text-text-secondary mb-6">No verification token provided.</p>
          <Link to="/login" className="px-5 py-2.5 border border-border rounded-lg text-text-secondary text-sm hover:bg-bg">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Bus className="w-7 h-7 text-white" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h1 className="text-xl font-bold text-text-primary mb-2">Verifying Email...</h1>
            <p className="text-sm text-text-secondary">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 mx-auto mb-4 text-green-500" />
            <h1 className="text-xl font-bold text-text-primary mb-2">Email Verified!</h1>
            <p className="text-sm text-text-secondary mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-bold text-text-primary mb-2">Verification Failed</h1>
            <p className="text-sm text-text-secondary mb-6">{message}</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 border border-border rounded-lg text-text-secondary text-sm hover:bg-bg"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
