import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bloodPressureService } from '../services/bloodPressureService';

export const DatabaseTest: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const testDatabaseConnection = async () => {
    if (!user) {
      setMessage('❌ Not authenticated - please sign in first');
      return;
    }

    setIsLoading(true);
    setMessage('🔄 Testing database connection...');

    try {
      // Test creating a reading
      const testReading = await bloodPressureService.createReading({
        systolic: 120,
        diastolic: 80,
        pulse: 72,
        reading_date: new Date().toISOString(),
        notes: 'Test reading from database test'
      });

      setMessage(`✅ Success! Created test reading with ID: ${testReading.id}`);

      // Clean up - delete the test reading
      setTimeout(async () => {
        try {
          await bloodPressureService.deleteReading(testReading.id.toString());
          setMessage(prev => prev + '\n🧹 Test reading cleaned up');
        } catch (err) {
          console.error('Error cleaning up test reading:', err);
        }
      }, 2000);

    } catch (error) {
      console.error('Database test failed:', error);
      setMessage(`❌ Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Database Test</h3>
        <p className="text-yellow-700">Please sign in to test database connection</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <h3 className="font-semibold text-gray-800 mb-3">Database Connection Test</h3>
      
      <div className="space-y-3">
        <div>
          <span className="font-medium">User ID: </span>
          <span className="text-sm font-mono text-gray-600">{user.id}</span>
        </div>
        
        <button
          onClick={testDatabaseConnection}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Database Connection'}
        </button>

        {message && (
          <div className="bg-gray-50 p-3 rounded border">
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
