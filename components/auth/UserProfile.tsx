import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserSettings } from '../../context/UserSettingsContext';

export const UserProfile: React.FC = () => {
  const { user, signOut, updateProfile, loading } = useAuth();
  const { targets, updateTargets, resetToDefaults, loading: targetsLoading } = useUserSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [targetData, setTargetData] = useState({
    systolic: targets.systolic,
    diastolic: targets.diastolic,
    pulse: targets.pulse,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTargetData({
      ...targetData,
      [e.target.name]: value,
    });
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await updateTargets(targetData);
      setSuccess('Target values updated successfully!');
      setIsEditingTargets(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update target values');
    }
  };

  const handleResetTargets = async () => {
    try {
      await resetToDefaults();
      setTargetData({
        systolic: 120,
        diastolic: 80,
        pulse: 70,
      });
      setSuccess('Target values reset to defaults!');
    } catch (err: any) {
      setError(err.message || 'Failed to reset target values');
    }
  };

  // Sync target data when targets change
  React.useEffect(() => {
    setTargetData({
      systolic: targets.systolic,
      diastolic: targets.diastolic,
      pulse: targets.pulse,
    });
  }, [targets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }

    setUpdateLoading(true);
    try {
      const updates: any = {};
      
      if (formData.fullName !== (user?.user_metadata?.full_name || '')) {
        updates.full_name = formData.fullName;
      }
      
      if (formData.email !== user?.email) {
        updates.email = formData.email;
      }
      
      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }

      await updateProfile(updates);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setFormData({
        ...formData,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-full sm:max-w-md md:max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-full sm:max-w-md md:max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
      <div className="text-center mb-6 sm:mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
          <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account information</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {user?.user_metadata?.full_name || 'Not set'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {user?.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>

          {/* Target Values Section */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Target Values</h3>
              {!isEditingTargets && (
                <button
                  onClick={() => setIsEditingTargets(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Edit Targets
                </button>
              )}
            </div>
            
            {!isEditingTargets ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">Systolic</div>
                  <div className="text-xl font-bold text-red-600">{targets.systolic}</div>
                  <div className="text-xs text-gray-500">mmHg</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-gray-700 mb-1">Diastolic</div>
                  <div className="text-xl font-bold text-blue-600">{targets.diastolic}</div>
                  <div className="text-xs text-gray-500">mmHg</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTargetSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="systolic" className="block text-sm font-medium text-gray-700 mb-1">
                      Systolic Target
                    </label>
                    <input
                      id="systolic"
                      name="systolic"
                      type="number"
                      min="80"
                      max="200"
                      value={targetData.systolic}
                      onChange={handleTargetChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="120"
                    />
                    <div className="text-xs text-gray-500 mt-1">80-200 mmHg</div>
                  </div>
                  <div>
                    <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700 mb-1">
                      Diastolic Target
                    </label>
                    <input
                      id="diastolic"
                      name="diastolic"
                      type="number"
                      min="50"
                      max="120"
                      value={targetData.diastolic}
                      onChange={handleTargetChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="80"
                    />
                    <div className="text-xs text-gray-500 mt-1">50-120 mmHg</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 md:gap-8">
                  <button
                    type="submit"
                    disabled={targetsLoading}
                    className="w-full sm:w-1/2 md:w-1/3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-colors"
                  >
                    {targetsLoading ? 'Saving...' : 'Save Targets'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTargets}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTargets(false);
                      setTargetData({
                        systolic: targets.systolic,
                        diastolic: targets.diastolic,
                        pulse: targets.pulse,
                      });
                      setError(null);
                      setSuccess(null);
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Edit Profile
            </button>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password (optional)
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          {formData.newPassword && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={updateLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {updateLoading ? 'Updating...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  fullName: user?.user_metadata?.full_name || '',
                  email: user?.email || '',
                  newPassword: '',
                  confirmPassword: '',
                });
                setError(null);
                setSuccess(null);
              }}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
