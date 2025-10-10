import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthPage } from './AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f1f5] via-white to-[#d5f0f0] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16476A]"></div>
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};
