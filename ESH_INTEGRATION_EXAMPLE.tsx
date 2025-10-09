/**
 * ESH Classification Integration Examples
 * 
 * This file demonstrates how to integrate the ESH Blood Pressure Classification
 * system into existing components of the blood pressure tracking application.
 */

import React from 'react';
import type { BloodPressureReading } from './types';
import { ESH_BP_CATEGORIES } from './constants';
import { 
  classifyReading, 
  analyzeBloodPressure, 
  analyzeTrend,
  requiresUrgentCare,
  isEmergency
} from './utils/bpClassification';
import { ESHClassificationChart } from './components/ESHClassificationChart';

// ============================================================================
// Example 1: Update BloodPressureGauge to use ESH zones
// ============================================================================

export function getESHZonesForGauge() {
  return {
    systolicZones: [
      { min: 0, max: 119, color: '#10b981', label: 'Optimal' },
      { min: 120, max: 129, color: '#84cc16', label: 'Normal' },
      { min: 130, max: 139, color: '#fbbf24', label: 'High-Normal' },
      { min: 140, max: 159, color: '#fb923c', label: 'Grade 1 HTN' },
      { min: 160, max: 179, color: '#f87171', label: 'Grade 2 HTN' },
      { min: 180, max: 300, color: '#dc2626', label: 'Grade 3+ HTN' }
    ],
    diastolicZones: [
      { min: 0, max: 79, color: '#10b981', label: 'Optimal' },
      { min: 80, max: 84, color: '#84cc16', label: 'Normal' },
      { min: 85, max: 89, color: '#fbbf24', label: 'High-Normal' },
      { min: 90, max: 99, color: '#fb923c', label: 'Grade 1 HTN' },
      { min: 100, max: 109, color: '#f87171', label: 'Grade 2 HTN' },
      { min: 110, max: 200, color: '#dc2626', label: 'Grade 3+ HTN' }
    ]
  };
}

// ============================================================================
// Example 2: Enhanced Reading Card with ESH Classification
// ============================================================================

interface EnhancedReadingCardProps {
  reading: BloodPressureReading;
}

export const EnhancedReadingCard: React.FC<EnhancedReadingCardProps> = ({ reading }) => {
  const analysis = analyzeBloodPressure(reading.systolic, reading.diastolic);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4" 
         style={{ borderLeftColor: analysis.category.color }}>
      {/* Reading Values */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-3xl font-bold text-slate-800">
            {reading.systolic}/{reading.diastolic}
            <span className="text-sm font-normal text-slate-600 ml-2">mmHg</span>
          </div>
          <div className="text-sm text-slate-600">
            {new Date(reading.date).toLocaleString()}
          </div>
        </div>
        
        {/* Pulse */}
        <div className="text-right">
          <div className="text-2xl font-semibold text-pink-600">{reading.pulse}</div>
          <div className="text-xs text-slate-500">bpm</div>
        </div>
      </div>

      {/* ESH Classification Badge */}
      <div className="mb-3">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: `${analysis.category.color}20`,
            color: analysis.category.color
          }}
        >
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: analysis.category.color }}
          ></div>
          {analysis.category.category}
        </div>
        
        {/* Alert Badges */}
        {analysis.isEmergency && (
          <div className="inline-block ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
            ⚠️ EMERGENCY
          </div>
        )}
        {analysis.requiresUrgentCare && !analysis.isEmergency && (
          <div className="inline-block ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
            ⚠️ URGENT
          </div>
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600">MAP</div>
          <div className="font-semibold text-slate-800">
            {analysis.map} mmHg
            <span className={`ml-1 text-xs ${
              analysis.mapAssessment.category === 'normal' 
                ? 'text-green-600' 
                : 'text-amber-600'
            }`}>
              ({analysis.mapAssessment.category})
            </span>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded p-2">
          <div className="text-xs text-slate-600">Pulse Pressure</div>
          <div className="font-semibold text-slate-800">
            {analysis.pulsePressure} mmHg
            <span className={`ml-1 text-xs ${
              analysis.pulsePressureAssessment.category === 'normal' 
                ? 'text-green-600' 
                : 'text-amber-600'
            }`}>
              ({analysis.pulsePressureAssessment.category})
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {reading.notes && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-600">{reading.notes}</div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Example 3: Enhanced Analysis Summary with ESH Trend Analysis
// ============================================================================

interface ESHAnalysisSummaryProps {
  readings: BloodPressureReading[];
}

export const ESHAnalysisSummary: React.FC<ESHAnalysisSummaryProps> = ({ readings }) => {
  const trendAnalysis = analyzeTrend(readings);

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-slate-600">
        No readings available for analysis
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4">ESH Blood Pressure Analysis</h3>

      {/* Average Classification */}
      <div className="mb-6">
        <div className="text-sm text-slate-600 mb-2">Average Classification</div>
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold"
          style={{ 
            backgroundColor: `${trendAnalysis.averageCategory.color}20`,
            color: trendAnalysis.averageCategory.color
          }}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: trendAnalysis.averageCategory.color }}
          ></div>
          {trendAnalysis.averageCategory.category}
        </div>
        <p className="text-sm text-slate-600 mt-2">
          {trendAnalysis.averageCategory.description}
        </p>
      </div>

      {/* Trend Indicator */}
      <div className="mb-6">
        <div className="text-sm text-slate-600 mb-2">Trend</div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold ${
          trendAnalysis.trend === 'improving' 
            ? 'bg-green-100 text-green-700'
            : trendAnalysis.trend === 'worsening'
            ? 'bg-red-100 text-red-700'
            : trendAnalysis.trend === 'stable'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {trendAnalysis.trend === 'improving' && '📈 Improving'}
          {trendAnalysis.trend === 'worsening' && '📉 Worsening'}
          {trendAnalysis.trend === 'stable' && '➡️ Stable'}
          {trendAnalysis.trend === 'insufficient-data' && '📊 Insufficient Data'}
        </div>
        <p className="text-sm text-slate-600 mt-2">{trendAnalysis.trendDescription}</p>
      </div>

      {/* High Risk Readings Alert */}
      {trendAnalysis.highRiskReadingsCount > 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-800 font-semibold mb-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            High Risk Readings Detected
          </div>
          <p className="text-sm text-orange-700">
            {trendAnalysis.highRiskReadingsCount} of your {readings.length} readings require urgent medical attention (≥180/110 mmHg).
            {trendAnalysis.emergencyReadingsCount > 0 && (
              <> <strong>{trendAnalysis.emergencyReadingsCount} readings are in emergency range (≥220/120 mmHg).</strong></>
            )}
          </p>
          <button className="mt-2 text-sm text-orange-700 font-semibold underline">
            Consult Healthcare Provider
          </button>
        </div>
      )}

      {/* Recommendations */}
      <div className="pt-4 border-t border-slate-200">
        <div className="text-sm font-semibold text-slate-700 mb-2">Recommendations</div>
        <ul className="space-y-1">
          {trendAnalysis.averageCategory.recommendations.slice(0, 3).map((rec, idx) => (
            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// Example 4: Smart Alert Component
// ============================================================================

interface SmartAlertProps {
  reading: BloodPressureReading;
  onDismiss?: () => void;
  onSeekHelp?: () => void;
}

export const SmartAlert: React.FC<SmartAlertProps> = ({ 
  reading, 
  onDismiss, 
  onSeekHelp 
}) => {
  const category = classifyReading(reading);
  const urgent = requiresUrgentCare(reading.systolic, reading.diastolic);
  const emergency = isEmergency(reading.systolic, reading.diastolic);

  if (!urgent && !emergency) {
    return null; // No alert needed
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 ${
      emergency 
        ? 'bg-red-600' 
        : 'bg-orange-500'
    } text-white rounded-lg shadow-2xl p-4 animate-pulse`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">
            {emergency ? '🚨 MEDICAL EMERGENCY' : '⚠️ URGENT ATTENTION REQUIRED'}
          </h4>
          <p className="text-sm mb-2">
            Your blood pressure reading of {reading.systolic}/{reading.diastolic} mmHg 
            is classified as <strong>{category.category}</strong>.
          </p>
          <p className="text-sm font-semibold">
            {emergency 
              ? 'Call emergency services immediately. Do not wait.'
              : 'Contact your healthcare provider as soon as possible.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {emergency && (
          <button 
            onClick={onSeekHelp}
            className="flex-1 bg-white text-red-600 font-bold py-2 px-4 rounded hover:bg-red-50"
          >
            Call Emergency
          </button>
        )}
        {!emergency && onSeekHelp && (
          <button 
            onClick={onSeekHelp}
            className="flex-1 bg-white text-orange-600 font-semibold py-2 px-4 rounded hover:bg-orange-50"
          >
            Contact Doctor
          </button>
        )}
        {onDismiss && !emergency && (
          <button 
            onClick={onDismiss}
            className="px-4 py-2 text-white hover:bg-white/20 rounded"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Example 5: ESH Classification Reference Page/Modal
// ============================================================================

export const ESHReferencePage: React.FC<{ latestReading?: BloodPressureReading }> = ({ 
  latestReading 
}) => {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-2">Blood Pressure Classification</h1>
        <p className="text-indigo-100">
          European Society of Hypertension (ESH) 2023 Guidelines
        </p>
      </div>

      {/* Full Classification Chart */}
      <ESHClassificationChart 
        currentReading={latestReading}
        showDetailed={true}
      />

      {/* Educational Content */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3">
            Why ESH Standards?
          </h3>
          <p className="text-sm text-slate-600 mb-2">
            The European Society of Hypertension provides internationally recognized 
            guidelines for blood pressure classification and management.
          </p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• More granular classification (3 grades vs 2 stages)</li>
            <li>• Evidence-based treatment thresholds</li>
            <li>• Specific guidance for different age groups</li>
            <li>• Regular updates based on latest research</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3">
            Important Reminders
          </h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span>📏</span>
              <span>Always measure after 5 minutes of rest</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📊</span>
              <span>Multiple readings are more reliable than single measurements</span>
            </li>
            <li className="flex items-start gap-2">
              <span>👨‍⚕️</span>
              <span>Consult healthcare providers for diagnosis and treatment</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🚨</span>
              <span>Readings ≥180/110 require urgent medical attention</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Example 6: Export Utility for Reports with ESH Classification
// ============================================================================

export function generateESHReport(readings: BloodPressureReading[]): string {
  const trend = analyzeTrend(readings);
  
  let report = '=== BLOOD PRESSURE REPORT (ESH Classification) ===\n\n';
  report += `Report Generated: ${new Date().toLocaleString()}\n`;
  report += `Total Readings: ${readings.length}\n\n`;
  
  report += '--- OVERALL ANALYSIS ---\n';
  report += `Average Classification: ${trend.averageCategory.category}\n`;
  report += `Risk Level: ${trend.averageCategory.riskLevel}\n`;
  report += `Trend: ${trend.trend}\n`;
  report += `${trend.trendDescription}\n\n`;
  
  if (trend.highRiskReadingsCount > 0) {
    report += `⚠️ HIGH RISK READINGS: ${trend.highRiskReadingsCount}\n`;
  }
  if (trend.emergencyReadingsCount > 0) {
    report += `🚨 EMERGENCY READINGS: ${trend.emergencyReadingsCount}\n`;
  }
  
  report += '\n--- DETAILED READINGS ---\n';
  readings.forEach((reading, idx) => {
    const category = classifyReading(reading);
    const analysis = analyzeBloodPressure(reading.systolic, reading.diastolic);
    
    report += `\n${idx + 1}. ${new Date(reading.date).toLocaleString()}\n`;
    report += `   ${reading.systolic}/${reading.diastolic} mmHg | Pulse: ${reading.pulse} bpm\n`;
    report += `   Category: ${category.category}\n`;
    report += `   MAP: ${analysis.map} mmHg | PP: ${analysis.pulsePressure} mmHg\n`;
    if (reading.notes) {
      report += `   Notes: ${reading.notes}\n`;
    }
  });
  
  report += '\n--- RECOMMENDATIONS ---\n';
  trend.averageCategory.recommendations.forEach((rec, idx) => {
    report += `${idx + 1}. ${rec}\n`;
  });
  
  report += '\n=== END OF REPORT ===\n';
  report += '\nBased on: ESH Guidelines 2023\n';
  report += 'Disclaimer: This report is for informational purposes only. ';
  report += 'Consult healthcare professionals for medical advice.\n';
  
  return report;
}

// ============================================================================
// Example 7: Dashboard Widget
// ============================================================================

interface ESHDashboardWidgetProps {
  latestReading: BloodPressureReading;
  onClick?: () => void;
}

export const ESHDashboardWidget: React.FC<ESHDashboardWidgetProps> = ({ 
  latestReading,
  onClick 
}) => {
  const category = classifyReading(latestReading);
  const urgent = requiresUrgentCare(latestReading.systolic, latestReading.diastolic);

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-600">ESH Classification</h4>
        {urgent && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
            ⚠️ Urgent
          </span>
        )}
      </div>

      <div 
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{ backgroundColor: `${category.color}10` }}
      >
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        ></div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 truncate">
            {category.categoryShort}
          </div>
          <div className="text-xs text-slate-600">
            {latestReading.systolic}/{latestReading.diastolic} mmHg
          </div>
        </div>
        <svg 
          className="w-5 h-5 text-slate-400 flex-shrink-0" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

