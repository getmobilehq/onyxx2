import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResetPassword } from '../api/auth.api';
import { OnyxLogo } from '../../../components/brand/OnyxIcons';
import { Spinner } from '../../../components/brand/OnyxIcons';
import { CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const resetPassword = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await resetPassword.mutateAsync({
        token: token!,
        data: { password },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be expired or invalid.');
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
            Reset Password
          </h1>
          <p className="text-slate-600">
            Enter your new password below
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Password Reset Successfully</h2>
              <p className="text-slate-600 mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link to="/login" className="btn btn-primary btn-md w-full">
                Sign In
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
                <label htmlFor="password" className="label block mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input"
                  required
                  minLength={8}
                  autoFocus
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label block mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="input"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={resetPassword.isPending}
                className="btn btn-primary btn-md w-full"
              >
                {resetPassword.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={20} />
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
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
