import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthTest: React.FC = () => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-8">
        <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
      
      <div className="space-y-3">
        <div>
          <span className="font-medium">Status: </span>
          <span className={`px-2 py-1 rounded text-sm ${
            user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>

        {user && (
          <>
            <div>
              <span className="font-medium">User ID: </span>
              <span className="text-gray-600 text-sm font-mono">{user.id}</span>
            </div>
            
            <div>
              <span className="font-medium">Email: </span>
              <span className="text-gray-600">{user.email}</span>
            </div>
            
            <div>
              <span className="font-medium">Email Verified: </span>
              <span className={`px-2 py-1 rounded text-sm ${
                user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </span>
            </div>

            {user.user_metadata?.full_name && (
              <div>
                <span className="font-medium">Full Name: </span>
                <span className="text-gray-600">{user.user_metadata.full_name}</span>
              </div>
            )}

            <div>
              <span className="font-medium">Created: </span>
              <span className="text-gray-600 text-sm">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="font-medium">Last Sign In: </span>
              <span className="text-gray-600 text-sm">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </>
        )}

        {session && (
          <div>
            <span className="font-medium">Session Expires: </span>
            <span className="text-gray-600 text-sm">
              {new Date(session.expires_at! * 1000).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
