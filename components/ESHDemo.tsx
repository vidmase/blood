import React from 'react';
import { ESHClassificationButton, ESHQuickButton, ESHHeaderButton } from './ESHClassificationButton';

/**
 * Demo component showing the ESH Classification Modal in action
 * This can be used for testing or as a reference
 */
export const ESHDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            ESH Classification Modal Demo
          </h1>
          <p className="text-lg text-slate-600">
            Click any button below to see the ESH Blood Pressure Classification table
          </p>
        </div>

        {/* Button Variants Demo */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Button Variants</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Primary Button */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Primary Button</h3>
              <ESHClassificationButton variant="primary" size="md">
                View ESH Guide
              </ESHClassificationButton>
            </div>

            {/* Secondary Button */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Secondary Button</h3>
              <ESHClassificationButton variant="secondary" size="md">
                Classification Guide
              </ESHClassificationButton>
            </div>

            {/* Minimal Button */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Minimal Button</h3>
              <ESHClassificationButton variant="minimal" size="md">
                ESH Info
              </ESHClassificationButton>
            </div>
          </div>
        </div>

        {/* Size Variants Demo */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Size Variants</h2>
          
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <ESHClassificationButton variant="primary" size="sm">
              Small
            </ESHClassificationButton>
            <ESHClassificationButton variant="primary" size="md">
              Medium
            </ESHClassificationButton>
            <ESHClassificationButton variant="primary" size="lg">
              Large
            </ESHClassificationButton>
          </div>
        </div>

        {/* Quick Buttons Demo */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Access Buttons</h2>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <ESHQuickButton />
            <ESHHeaderButton />
          </div>
        </div>

        {/* Real-world Examples */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Real-world Examples</h2>
          
          {/* Dashboard Widget */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Blood Pressure Dashboard</h3>
              <ESHQuickButton />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">145/92</div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                Grade 1 HTN
              </div>
            </div>
          </div>

          {/* Header Example */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">App Header</h3>
              <div className="flex items-center gap-3">
                <ESHHeaderButton />
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Add Reading
                </button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 mb-2">Need Help Understanding Your Readings?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Our blood pressure classifications follow the European Society of Hypertension (ESH) 2023 Guidelines.
                  Click the button below to see the complete classification table.
                </p>
                <ESHClassificationButton variant="minimal" size="sm">
                  View ESH Classification Guide
                </ESHClassificationButton>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">How to Use</h2>
          
          <div className="prose max-w-none">
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">1. Import the Components</h3>
              <pre className="text-sm text-slate-700 bg-white p-3 rounded border overflow-x-auto">
{`import { 
  ESHClassificationButton, 
  ESHQuickButton, 
  ESHHeaderButton 
} from './components/ESHClassificationButton';`}
              </pre>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">2. Add to Your Component</h3>
              <pre className="text-sm text-slate-700 bg-white p-3 rounded border overflow-x-auto">
{`<ESHClassificationButton variant="primary" size="md">
  View ESH Guide
</ESHClassificationButton>`}
              </pre>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">3. Available Props</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li><strong>variant:</strong> 'primary' | 'secondary' | 'minimal'</li>
                <li><strong>size:</strong> 'sm' | 'md' | 'lg'</li>
                <li><strong>className:</strong> Custom CSS classes</li>
                <li><strong>children:</strong> Button text content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-600">
          <p>Click any button above to see the ESH Blood Pressure Classification Modal</p>
        </div>
      </div>
    </div>
  );
};
