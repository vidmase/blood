import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onToggleMode={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        );
      case 'signup':
        return (
          <SignUpForm
            onToggleMode={() => setMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBack={() => setMode('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderForm()}
      </div>
    </div>
  );
};
