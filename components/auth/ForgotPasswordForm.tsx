import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reset link sent!</h3>
          <p className="text-sm text-gray-500 mb-4">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Check your email and click the link to reset your password. The link will expire in 1 hour.
          </p>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Reset password</h2>
        <p className="text-gray-600 mt-2">Enter your email to receive a reset link</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
};
