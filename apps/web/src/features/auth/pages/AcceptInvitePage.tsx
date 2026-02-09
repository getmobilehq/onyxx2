import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAcceptInvite } from '../api/auth.api';
import { OnyxLogo } from '../../../components/brand/OnyxIcons';
import { Spinner } from '../../../components/brand/OnyxIcons';
import { CheckCircle } from 'lucide-react';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const acceptInvite = useAcceptInvite();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await acceptInvite.mutateAsync({
        token: token!,
        data: { firstName, lastName },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation. The link may be expired or invalid.');
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
            Accept Invitation
          </h1>
          <p className="text-slate-600">
            Complete your account setup to get started
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Account Activated</h2>
              <p className="text-slate-600 mb-6">
                Your account has been set up successfully. You can now sign in.
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
                <label htmlFor="firstName" className="label block mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="input"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="lastName" className="label block mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={acceptInvite.isPending}
                className="btn btn-primary btn-md w-full"
              >
                {acceptInvite.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={20} />
                    Setting up account...
                  </span>
                ) : (
                  'Accept Invitation'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-onyx-600 hover:text-onyx-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
