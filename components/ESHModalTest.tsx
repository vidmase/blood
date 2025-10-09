import React, { useState } from 'react';
import { ESHClassificationButton } from './ESHClassificationButton';
import ESHClassificationModal from './ESHClassificationModal';

/**
 * Test component to verify ESH Modal works correctly
 * This can be temporarily added to App.tsx for testing
 */
export const ESHModalTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">ESH Modal Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Test 1: Button Component</h2>
          <ESHClassificationButton>
            Test ESH Button
          </ESHClassificationButton>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Test 2: Direct Modal</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open Modal Directly
          </button>
          
          <ESHClassificationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Test 3: Quick Button</h2>
          <ESHClassificationButton variant="minimal" size="sm">
            Quick Test
          </ESHClassificationButton>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
        <p className="text-sm text-yellow-700">
          If you can see this text, the modal should appear as a centered dialog when you click any button above.
          If the modal appears in the header instead of the center, there's a CSS conflict.
        </p>
      </div>
    </div>
  );
};
