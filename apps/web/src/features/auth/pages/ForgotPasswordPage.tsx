import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../api/auth.api';
import { OnyxLogo } from '../../../components/brand/OnyxIcons';
import { Spinner } from '../../../components/brand/OnyxIcons';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await forgotPassword.mutateAsync({ email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-onyx-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <OnyxLogo variant="color" width={240} height={56} />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
            Forgot Password
          </h1>
          <p className="text-slate-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="card">
          {submitted ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Check Your Email</h2>
              <p className="text-slate-600 mb-6">
                If an account with that email exists, we've sent a password reset link.
                Please check your inbox.
              </p>
              <Link to="/login" className="btn btn-primary btn-md w-full">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="label block mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="btn btn-primary btn-md w-full"
              >
                {forgotPassword.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={20} />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-onyx-600 hover:text-onyx-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
