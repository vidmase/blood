import React, { useState } from 'react';
import { ESH_BP_CATEGORIES } from '../constants';
import type { BloodPressureReading } from '../types';
import { classifyReading, analyzeBloodPressure } from '../utils/bpClassification';

interface ESHClassificationChartProps {
  currentReading?: BloodPressureReading;
  showDetailed?: boolean;
}

export const ESHClassificationChart: React.FC<ESHClassificationChartProps> = ({
  currentReading,
  showDetailed = false
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // If current reading is provided, classify it
  const currentCategory = currentReading ? classifyReading(currentReading) : null;
  const analysis = currentReading
    ? analyzeBloodPressure(currentReading.systolic, currentReading.diastolic)
    : null;

  // Filter out ISH and Hypotension from main table (they're special cases)
  const mainCategories = ESH_BP_CATEGORIES.filter(
    cat => cat.categoryShort !== 'ISH' && cat.categoryShort !== 'Low'
  );

  const specialCategories = ESH_BP_CATEGORIES.filter(
    cat => cat.categoryShort === 'ISH' || cat.categoryShort === 'Low'
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-slate-200/60 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              ESH Blood Pressure Classification
            </h3>
            <p className="text-sm text-slate-600">
              European Society of Hypertension 2023 Guidelines
            </p>
          </div>
        </div>
      </div>

      {/* Current Reading Analysis */}
      {currentReading && analysis && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-slate-800">
              Your Current Reading Analysis
            </h4>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showAnalysis ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reading Values */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-slate-800 mb-1">
                {currentReading.systolic}/{currentReading.diastolic}
                <span className="text-sm font-normal text-slate-600 ml-2">mmHg</span>
              </div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${currentCategory?.color}20`,
                  color: currentCategory?.color
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentCategory?.color }}
                ></div>
                {currentCategory?.category}
              </div>
            </div>

            {/* Risk Level */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm font-medium text-slate-600 mb-1">Risk Level</div>
              <div className="text-lg font-semibold text-slate-800 capitalize mb-2">
                {currentCategory?.riskLevel.replace('-', ' ')}
              </div>
              {analysis.isEmergency && (
                <div className="text-red-700 text-sm font-medium bg-red-100 px-2 py-1 rounded">
                  ⚠️ Emergency - Seek immediate care
                </div>
              )}
              {analysis.requiresUrgentCare && !analysis.isEmergency && (
                <div className="text-orange-700 text-sm font-medium bg-orange-100 px-2 py-1 rounded">
                  ⚠️ Urgent medical attention advised
                </div>
              )}
            </div>
          </div>

          {/* Detailed Analysis */}
          {showAnalysis && (
            <div className="mt-4 space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-600 mb-2">
                  Additional Metrics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Mean Arterial Pressure:</span>{' '}
                    <span className="text-slate-600">{analysis.map} mmHg</span>
                    <span
                      className={`ml-2 text-xs ${
                        analysis.mapAssessment.category === 'normal'
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}
                    >
                      ({analysis.mapAssessment.category})
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Pulse Pressure:</span>{' '}
                    <span className="text-slate-600">{analysis.pulsePressure} mmHg</span>
                    <span
                      className={`ml-2 text-xs ${
                        analysis.pulsePressureAssessment.category === 'normal'
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}
                    >
                      ({analysis.pulsePressureAssessment.category})
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-600 mb-2">Description</div>
                <p className="text-sm text-slate-700">{currentCategory?.description}</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-600 mb-2">Recommendations</div>
                <ul className="space-y-1">
                  {currentCategory?.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Classification Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="text-left py-3 px-2 font-semibold text-slate-700">Category</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">
                  Systolic (mmHg)
                </th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">And/Or</th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">
                  Diastolic (mmHg)
                </th>
                <th className="text-center py-3 px-2 font-semibold text-slate-700">Risk</th>
                {showDetailed && (
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Details</th>
                )}
              </tr>
            </thead>
            <tbody>
              {mainCategories.map((category, index) => (
                <React.Fragment key={category.category}>
                  <tr
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                      currentCategory?.category === category.category ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-medium text-slate-800">{category.category}</span>
                        {currentCategory?.category === category.category && (
                          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 text-slate-700">
                      {category.systolicMin === 0 && category.systolicMax < 300
                        ? `< ${category.systolicMax + 1}`
                        : category.systolicMax === 300
                        ? `≥ ${category.systolicMin}`
                        : `${category.systolicMin} - ${category.systolicMax}`}
                    </td>
                    <td className="text-center py-3 px-2 text-slate-500 font-medium">
                      {category.categoryShort === 'Low' ? 'AND' : 'OR'}
                    </td>
                    <td className="text-center py-3 px-2 text-slate-700">
                      {category.diastolicMin === 0 && category.diastolicMax < 200
                        ? `< ${category.diastolicMax + 1}`
                        : category.diastolicMax === 200
                        ? `≥ ${category.diastolicMin}`
                        : `${category.diastolicMin} - ${category.diastolicMax}`}
                    </td>
                    <td className="text-center py-3 px-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          category.riskLevel === 'low'
                            ? 'bg-green-100 text-green-700'
                            : category.riskLevel === 'moderate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : category.riskLevel === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {category.riskLevel.replace('-', ' ')}
                      </span>
                    </td>
                    {showDetailed && (
                      <td className="text-center py-3 px-2">
                        <button
                          onClick={() => toggleCategory(category.category)}
                          className="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                        >
                          {expandedCategory === category.category ? 'Hide' : 'Show'}
                        </button>
                      </td>
                    )}
                  </tr>
                  {showDetailed && expandedCategory === category.category && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-700 mb-1">
                              Description
                            </div>
                            <p className="text-sm text-slate-600">{category.description}</p>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700 mb-2">
                              Recommendations
                            </div>
                            <ul className="space-y-1">
                              {category.recommendations.map((rec, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-slate-600 flex items-start gap-2"
                                >
                                  <span className="text-indigo-500">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Special Categories */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Special Categories</h4>
          <div className="space-y-3">
            {specialCategories.map(category => (
              <div
                key={category.category}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-semibold text-slate-800">{category.category}</span>
                    {currentCategory?.category === category.category && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      category.riskLevel === 'low'
                        ? 'bg-green-100 text-green-700'
                        : category.riskLevel === 'moderate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {category.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{category.description}</p>
                <div className="text-xs text-slate-500">
                  Systolic:{' '}
                  {category.systolicMax === 300
                    ? `≥ ${category.systolicMin}`
                    : `${category.systolicMin} - ${category.systolicMax}`}{' '}
                  mmHg, Diastolic:{' '}
                  {category.diastolicMax === 200
                    ? `≥ ${category.diastolicMin}`
                    : category.diastolicMax < 200
                    ? `< ${category.diastolicMax + 1}`
                    : `${category.diastolicMin} - ${category.diastolicMax}`}{' '}
                  mmHg
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="space-y-1 text-blue-700">
                <li>
                  • When systolic and diastolic fall into different categories, the higher risk
                  category applies
                </li>
                <li>
                  • These classifications are for adults (≥18 years) and may differ for children
                </li>
                <li>
                  • Blood pressure should be measured after 5 minutes of rest in a seated position
                </li>
                <li>• Multiple readings over time are more reliable than single measurements</li>
                <li>
                  • Always consult a healthcare professional for diagnosis and treatment decisions
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reference */}
        <div className="mt-4 text-xs text-slate-500 text-center">
          Based on: 2023 ESH Guidelines for the management of arterial hypertension
          <br />
          European Heart Journal (2023) 44, 3824-3877
        </div>
      </div>
    </div>
  );
};

