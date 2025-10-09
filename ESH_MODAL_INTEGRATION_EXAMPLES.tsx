/**
 * ESH Classification Modal Integration Examples
 * 
 * This file shows how to integrate the ESH Classification Modal
 * into existing components of your blood pressure tracking application.
 */

import React from 'react';
import { ESHClassificationButton, ESHQuickButton, ESHHeaderButton } from './components/ESHClassificationButton';

// ============================================================================
// Example 1: Add to Header Component
// ============================================================================

export const HeaderWithESHButton: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">My Blood Pressure</h1>
          <div className="hidden md:block text-sm text-slate-600">
            Track your health with ESH standards
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* ESH Classification Button */}
          <ESHHeaderButton />
          
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Add Reading
          </button>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// Example 2: Add to Dashboard Widget
// ============================================================================

export const DashboardWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Blood Pressure Overview</h3>
        <ESHQuickButton />
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-800">145/92</div>
          <div className="text-sm text-slate-600">mmHg</div>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 mt-2">
            Grade 1 HTN
          </div>
        </div>
        
        <div className="text-xs text-slate-500 text-center">
          Tap the ESH Guide button above for classification details
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Example 3: Add to Settings/Help Section
// ============================================================================

export const SettingsPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Help & Information</h3>
      
      <div className="space-y-3">
        <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-slate-700">Blood Pressure Classification Guide</span>
          </div>
          <ESHQuickButton />
        </button>
        
        <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-medium text-slate-700">User Manual</span>
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Example 4: Add to ReadingsTable Header
// ============================================================================

export const ReadingsTableWithESH: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-slate-200/60 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Blood Pressure History</h3>
            <p className="text-sm text-slate-600 mt-1">Showing 15 readings</p>
          </div>
          <div className="flex items-center gap-3">
            <ESHClassificationButton variant="secondary" size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Classification Guide
            </ESHClassificationButton>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Reading
            </button>
          </div>
        </div>
      </div>
      
      {/* Table content would go here */}
      <div className="p-6">
        <p className="text-slate-600">Table content with ESH classifications...</p>
      </div>
    </div>
  );
};

// ============================================================================
// Example 5: Floating Action Button
// ============================================================================

export const FloatingESHButton: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <ESHClassificationButton
        variant="primary"
        size="lg"
        className="rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        ESH Guide
      </ESHClassificationButton>
    </div>
  );
};

// ============================================================================
// Example 6: Inline Help Text with Button
// ============================================================================

export const HelpTextWithESH: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-800 mb-1">Understanding Your Readings</h4>
          <p className="text-sm text-blue-700 mb-3">
            Your blood pressure readings are classified according to European Society of Hypertension (ESH) 2023 Guidelines. 
            Each reading is categorized based on both systolic and diastolic values.
          </p>
          <ESHClassificationButton variant="minimal" size="sm">
            View Complete Classification Guide
          </ESHClassificationButton>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Example 7: Mobile-Optimized Button
// ============================================================================

export const MobileESHButton: React.FC = () => {
  return (
    <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3">
      <ESHClassificationButton
        variant="secondary"
        size="md"
        className="w-full justify-center"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        ESH Classification Guide
      </ESHClassificationButton>
    </div>
  );
};

// ============================================================================
// Example 8: Integration with Existing Components
// ============================================================================

// How to add to existing Header component
export const addESHToHeader = `
// In your existing Header.tsx file, add:

import { ESHHeaderButton } from './ESHClassificationButton';

// Then in your header JSX:
<div className="flex items-center gap-3">
  <ESHHeaderButton />
  {/* your existing buttons */}
</div>
`;

// How to add to existing ReadingsTable component
export const addESHToReadingsTable = `
// In your existing ReadingsTable.tsx file, add:

import { ESHClassificationButton } from './ESHClassificationButton';

// Then in your table header section:
<div className="flex items-center gap-3">
  <ESHClassificationButton variant="secondary" size="sm">
    Classification Guide
  </ESHClassificationButton>
  {/* your existing header buttons */}
</div>
`;

// How to add to existing AnalysisSummary component
export const addESHToAnalysisSummary = `
// In your existing AnalysisSummary.tsx file, add:

import { ESHQuickButton } from './ESHClassificationButton';

// Then in your component header:
<div className="flex items-center justify-between mb-4">
  <h2 className="text-2xl font-bold">Analysis</h2>
  <ESHQuickButton />
</div>
`;

// ============================================================================
// Usage Instructions
// ============================================================================

export const USAGE_INSTRUCTIONS = `
# ESH Classification Modal Integration

## Quick Setup

1. Import the components:
   import { ESHClassificationButton, ESHQuickButton, ESHHeaderButton } from './components/ESHClassificationButton';

2. Add to any component:
   <ESHClassificationButton>View ESH Guide</ESHClassificationButton>

## Button Variants

- **ESHClassificationButton**: Full customizable button
- **ESHQuickButton**: Small minimal button for headers
- **ESHHeaderButton**: Medium secondary button for main headers

## Variants

- **primary**: Gradient blue/purple (default)
- **secondary**: White with blue border
- **minimal**: Text-only with hover background

## Sizes

- **sm**: Small (px-3 py-1.5 text-xs)
- **md**: Medium (px-4 py-2 text-sm) - default
- **lg**: Large (px-6 py-3 text-base)

## Examples

// Small help button in corner
<ESHQuickButton />

// Main header button
<ESHHeaderButton />

// Custom button
<ESHClassificationButton variant="primary" size="lg">
  View ESH Classification
</ESHClassificationButton>

// Floating action button
<ESHClassificationButton 
  variant="primary" 
  size="lg"
  className="fixed bottom-6 right-6 rounded-full shadow-xl"
>
  ESH Guide
</ESHClassificationButton>
`;
