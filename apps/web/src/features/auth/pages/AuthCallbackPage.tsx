/**
 * Auth Callback Page
 * Handles Supabase auth redirects (invite acceptance, password reset, magic links).
 * Supabase appends tokens as URL hash fragments which the client auto-detects.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import apiClient from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth.store';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase auto-detects hash fragment and establishes session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError('Authentication failed. Please try again or request a new link.');
          return;
        }

        // Check the URL hash for the type of auth event
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');

        // For password recovery, redirect to the reset password page
        if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
          return;
        }

        // For login/invite, sync with our API to get internal user data
        const { data: user } = await apiClient.post('/auth/callback');
        setAuth(user);
        navigate('/dashboard', { replace: true });
      } catch {
        setError('Failed to complete authentication. Please try again.');
      }
    };

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Authentication Error</div>
          <p className="text-slate-600 mb-4">{error}</p>
          <a href="/login" className="btn btn-primary btn-md">
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message="Completing authentication..." />
    </div>
  );
}
