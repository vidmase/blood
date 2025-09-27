import React, { useState } from 'react';
import type { BloodPressureReading } from '../types';
import { BloodPressureGauge } from './BloodPressureGauge';
import { useLocalization } from '../context/LocalizationContext';

interface BloodPressureTrendsProps {
  readings: BloodPressureReading[];
}

// Trend calculation helper
const calculateTrend = (readings: BloodPressureReading[], type: 'systolic' | 'diastolic' | 'pulse') => {
  if (readings.length < 2) return { direction: 'stable', change: 0, percentage: 0 };
  
  const recent = readings.slice(0, Math.ceil(readings.length / 2));
  const older = readings.slice(Math.ceil(readings.length / 2));
  
  const recentAvg = recent.reduce((sum, r) => sum + r[type], 0) / recent.length;
  const olderAvg = older.reduce((sum, r) => sum + r[type], 0) / older.length;
  
  const change = recentAvg - olderAvg;
  const percentage = Math.abs((change / olderAvg) * 100);
  
  return {
    direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
    change: Math.round(change),
    percentage: Math.round(percentage * 10) / 10
  };
};

// Mini sparkline component
const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({ 
  data, color, height = 40 
}) => {
  if (data.length < 2) return <div className={`w-full h-${height/4} bg-gray-100 rounded`}></div>;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((max - value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width="100%" height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = ((max - value) / range) * 100;
        return (
          <circle
            key={index}
            cx={`${x}%`}
            cy={`${y}%`}
            r="2"
            fill={color}
            className="opacity-60"
          />
        );
      })}
    </svg>
  );
};

// Trend indicator component
const TrendIndicator: React.FC<{ 
  direction: string; 
  change: number; 
  percentage: number; 
  label: string;
  color: string;
}> = ({ direction, change, percentage, label, color }) => {
  const getIcon = () => {
    switch (direction) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

  const getColorClass = () => {
    switch (direction) {
      case 'up': return 'text-red-600 bg-red-50 border-red-200';
      case 'down': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getColorClass()}`}>
      {getIcon()}
      <span>{Math.abs(change)}</span>
      <span className="text-xs opacity-75">({percentage}%)</span>
    </div>
  );
};

export const BloodPressureTrends: React.FC<BloodPressureTrendsProps> = ({ readings }) => {
  const { t } = useLocalization();
  const [viewMode, setViewMode] = useState<'cards' | 'chart' | 'compact' | 'gauge'>('cards');
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
    date: string;
  }>({ visible: false, x: 0, y: 0, content: '', date: '' });
  
  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('trends.noDataTitle')}</h3>
        <p className="text-slate-600">{t('trends.noDataMessage')}</p>
      </div>
    );
  }

  const systolicTrend = calculateTrend(readings, 'systolic');
  const diastolicTrend = calculateTrend(readings, 'diastolic');
  const pulseTrend = calculateTrend(readings, 'pulse');

  const systolicData = readings.slice(0, 10).reverse().map(r => r.systolic);
  const diastolicData = readings.slice(0, 10).reverse().map(r => r.diastolic);
  const pulseData = readings.slice(0, 10).reverse().map(r => r.pulse);

  // Cards View
  if (viewMode === 'cards') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{t('trends.title')}</h3>
            <p className="text-sm text-slate-600">{t('trends.recentPatterns')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('trends.cards')}
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'chart' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('trends.chart')}
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'compact' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('trends.compact')}
            </button>
            <button
              onClick={() => setViewMode('gauge')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'gauge' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('trends.gauge')}
            </button>
          </div>
        </div>

        {/* Trend Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Systolic Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{t('trends.systolic')}</h4>
                  <p className="text-xs text-slate-500">{t('trends.upperPressure')}</p>
                </div>
              </div>
              <TrendIndicator {...systolicTrend} label="Systolic" color="#dc2626" />
            </div>
            <div className="mb-4">
              <Sparkline data={systolicData} color="#dc2626" height={50} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t('trends.lastReadings', { count: 10 })}</span>
              <span className="font-semibold text-slate-800">
                {t('trends.average', { value: Math.round(systolicData.reduce((a, b) => a + b, 0) / systolicData.length) })}
              </span>
            </div>
          </div>

          {/* Diastolic Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{t('trends.diastolic')}</h4>
                  <p className="text-xs text-slate-500">{t('trends.lowerPressure')}</p>
                </div>
              </div>
              <TrendIndicator {...diastolicTrend} label="Diastolic" color="#2563eb" />
            </div>
            <div className="mb-4">
              <Sparkline data={diastolicData} color="#2563eb" height={50} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t('trends.lastReadings', { count: 10 })}</span>
              <span className="font-semibold text-slate-800">
                {t('trends.average', { value: Math.round(diastolicData.reduce((a, b) => a + b, 0) / diastolicData.length) })}
              </span>
            </div>
          </div>

          {/* Pulse Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{t('trends.pulse')}</h4>
                  <p className="text-xs text-slate-500">{t('trends.heartRate')}</p>
                </div>
              </div>
              <TrendIndicator {...pulseTrend} label="Pulse" color="#db2777" />
            </div>
            <div className="mb-4">
              <Sparkline data={pulseData} color="#db2777" height={50} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t('trends.lastReadings', { count: 10 })}</span>
              <span className="font-semibold text-slate-800">
                {t('trends.average', { value: Math.round(pulseData.reduce((a, b) => a + b, 0) / pulseData.length) })} {t('trends.bpm')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gauge View
  if (viewMode === 'gauge') {
    return <BloodPressureGauge readings={readings} />;
  }

  // Modern Enhanced Chart View
  if (viewMode === 'chart') {
    const chartData = readings.slice(0, 12).reverse(); // Show last 12 readings for cleaner display
    
    // Smart scaling for better visualization
    const allSystolic = chartData.map(r => r.systolic);
    const allDiastolic = chartData.map(r => r.diastolic);
    const allPulse = chartData.map(r => r.pulse);
    
    const maxSystolic = Math.max(...allSystolic);
    const minSystolic = Math.min(...allSystolic);
    const maxDiastolic = Math.max(...allDiastolic);
    const minDiastolic = Math.min(...allDiastolic);
    const maxPulse = Math.max(...allPulse);
    const minPulse = Math.min(...allPulse);
    
    // Create separate scales for better visualization
    const bpMaxValue = Math.max(maxSystolic + 15, 160);
    const bpMinValue = Math.max(minDiastolic - 15, 40);
    const bpRange = bpMaxValue - bpMinValue;
    
    const pulseMaxValue = Math.max(maxPulse + 10, 100);
    const pulseMinValue = Math.max(minPulse - 10, 50);
    const pulseRange = pulseMaxValue - pulseMinValue;

    // Create chart points with improved positioning
    const createBPPoints = (data: number[]) => {
      return data.map((value, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        const y = ((bpMaxValue - value) / bpRange) * 100;
        return { x, y, value, index };
      });
    };

    const createPulsePoints = (data: number[]) => {
      return data.map((value, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        // Map pulse to the same visual space as BP for comparison
        const normalizedValue = ((value - pulseMinValue) / pulseRange) * bpRange + bpMinValue;
        const y = ((bpMaxValue - normalizedValue) / bpRange) * 100;
        return { x, y, value, index };
      });
    };

    const systolicPoints = createBPPoints(allSystolic);
    const diastolicPoints = createBPPoints(allDiastolic);
    const pulsePoints = createPulsePoints(allPulse);

    return (
      <div className="bg-gradient-to-br from-white to-slate-50/30 rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-slate-200/60 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{t('trends.title')}</h3>
              <p className="text-sm text-slate-600 mt-1">{t('trends.interactiveChart', { count: chartData.length })}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/60 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm transition-all"
              >
                {t('trends.cards')}
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-indigo-700 shadow-sm"
              >
                {t('trends.chart')}
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm transition-all"
              >
                {t('trends.compact')}
              </button>
              <button
                onClick={() => setViewMode('gauge')}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm transition-all"
              >
                {t('trends.gauge')}
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Modern Legend with Health Zones */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Systolic Legend Card */}
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-4 border border-red-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700">{t('trends.systolic')}</h4>
                    <p className="text-xs text-red-600">{t('trends.upperPressure')}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('trends.currentAvg')}:</span>
                    <span className="font-bold text-red-700">{Math.round(allSystolic.reduce((a, b) => a + b, 0) / allSystolic.length)} mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('gauge.normal')}:</span>
                    <span className="text-slate-500">&lt;120 mmHg</span>
                  </div>
                </div>
              </div>

              {/* Diastolic Legend Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-700">Diastolic Pressure</h4>
                    <p className="text-xs text-blue-600">Lower reading</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Avg:</span>
                    <span className="font-bold text-blue-700">{Math.round(allDiastolic.reduce((a, b) => a + b, 0) / allDiastolic.length)} mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Normal:</span>
                    <span className="text-slate-500">&lt;80 mmHg</span>
                  </div>
                </div>
              </div>

              {/* Pulse Legend Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-700">Heart Rate</h4>
                    <p className="text-xs text-emerald-600">Pulse rate</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Avg:</span>
                    <span className="font-bold text-emerald-700">{Math.round(allPulse.reduce((a, b) => a + b, 0) / allPulse.length)} BPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Normal:</span>
                    <span className="text-slate-500">60-100 BPM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Professional Chart */}
          <div className="relative bg-gradient-to-br from-white to-slate-50/30 rounded-2xl p-8 shadow-xl border border-slate-200/60">
            {/* Chart Title */}
            <div className="mb-6 text-center">
              <h4 className="text-lg font-bold text-slate-800 mb-2">Blood Pressure Trend Analysis</h4>
              <p className="text-sm text-slate-600">Last {chartData.length} readings • {new Date(chartData[0]?.date).toLocaleDateString()} - {new Date(chartData[chartData.length - 1]?.date).toLocaleDateString()}</p>
            </div>

            <div className="relative h-96">
              <svg width="100%" height="100%" className="overflow-visible" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 100%)' }}>
                {/* Enhanced Background Grid */}
                <defs>
                  <linearGradient id="chartBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.9"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </filter>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#chartBg)" rx="12"/>

                {/* Professional Grid Lines */}
                {[0, 20, 40, 60, 80, 100].map((percent, index) => {
                  const value = Math.round(bpMaxValue - (percent / 100) * bpRange);
                  const isMainLine = percent === 0 || percent === 100 || percent === 50;
                  return (
                    <g key={percent}>
                      <line
                        x1="5%"
                        y1={`${percent}%`}
                        x2="95%"
                        y2={`${percent}%`}
                        stroke={isMainLine ? "#cbd5e1" : "#e2e8f0"}
                        strokeWidth={isMainLine ? "1.5" : "0.8"}
                        strokeDasharray={isMainLine ? "none" : "4,4"}
                        opacity={isMainLine ? "0.8" : "0.4"}
                      />
                      <text
                        x="2%"
                        y={`${percent}%`}
                        textAnchor="start"
                        dominantBaseline="middle"
                        className="text-xs fill-slate-600 font-semibold"
                        style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}

                {/* Enhanced Gradient Definitions */}
                <defs>
                  <linearGradient id="systolicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                    <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="diastolicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                
                {/* Systolic Area with Enhanced Gradient */}
                <path
                  d={`M 5,100% ${systolicPoints.map(p => `L ${5 + (p.x * 0.9)}%,${p.y}%`).join(' ')} L 95%,100% Z`}
                  fill="url(#systolicGradient)"
                  opacity="0.8"
                />
                
                {/* Diastolic Area with Enhanced Gradient */}
                <path
                  d={`M 5,100% ${diastolicPoints.map(p => `L ${5 + (p.x * 0.9)}%,${p.y}%`).join(' ')} L 95%,100% Z`}
                  fill="url(#diastolicGradient)"
                  opacity="0.8"
                />
                
                {/* Modern Systolic Line */}
                <path
                  d={`M ${systolicPoints.map(p => `${5 + (p.x * 0.9)},${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke="url(#systolicLineGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#shadow)"
                />
                
                {/* Modern Diastolic Line */}
                <path
                  d={`M ${diastolicPoints.map(p => `${5 + (p.x * 0.9)},${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke="url(#diastolicLineGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#shadow)"
                />

                {/* Modern Pulse Line */}
                <path
                  d={`M ${pulsePoints.map(p => `${5 + (p.x * 0.9)},${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8,4"
                  filter="url(#shadow)"
                  opacity="0.9"
                />

                {/* Line Gradients */}
                <defs>
                  <linearGradient id="systolicLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#dc2626"/>
                    <stop offset="50%" stopColor="#ef4444"/>
                    <stop offset="100%" stopColor="#f87171"/>
                  </linearGradient>
                  <linearGradient id="diastolicLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1d4ed8"/>
                    <stop offset="50%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#60a5fa"/>
                  </linearGradient>
                </defs>

                {/* Enhanced Data Points with Tooltip */}
                {systolicPoints.map((point, index) => (
                  <g key={`systolic-${index}`}>
                    <circle
                      cx={`${5 + (point.x * 0.9)}%`}
                      cy={`${point.y}%`}
                      r="8"
                      fill="#ef4444"
                      fillOpacity="0.2"
                      stroke="none"
                    />
                    <circle
                      cx={`${5 + (point.x * 0.9)}%`}
                      cy={`${point.y}%`}
                      r="5"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="3"
                      filter="url(#shadow)"
                      className="hover:r-7 transition-all cursor-pointer"
                      title=""
                    />
                  </g>
                ))}

                {diastolicPoints.map((point, index) => (
                  <g key={`diastolic-${index}`}>
                    <circle
                      cx={`${5 + (point.x * 0.9)}%`}
                      cy={`${point.y}%`}
                      r="8"
                      fill="#3b82f6"
                      fillOpacity="0.2"
                      stroke="none"
                    />
                    <circle
                      cx={`${5 + (point.x * 0.9)}%`}
                      cy={`${point.y}%`}
                      r="5"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="3"
                      filter="url(#shadow)"
                      className="hover:r-7 transition-all cursor-pointer"
                      title=""
                    />
                  </g>
                ))}

                {pulsePoints.map((point, index) => (
                  <g key={`pulse-${index}`}>
                    <circle
                      cx={`${5 + (point.x * 0.9)}%`}
                      cy={`${point.y}%`}
                      r="6"
                      fill="#10b981"
                      fillOpacity="0.2"
                      stroke="none"
                    />
                    <circle
                      cx={`${5 + (point.x * 0.9)}%`}
                      cy={`${point.y}%`}
                      r="4"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                      filter="url(#shadow)"
                      className="hover:r-6 transition-all cursor-pointer"
                      title=""
                    />
                  </g>
                ))}
              </svg>

              {/* Y-axis label */}
              <div className="absolute -left-12 top-1/2 transform -rotate-90 -translate-y-1/2">
                <span className="text-xs font-medium text-slate-600">mmHg / BPM</span>
              </div>
            </div>

            {/* Enhanced X-axis with Better Date Display */}
            <div className="mt-6 px-4">
              <div className="flex justify-between items-center">
                {chartData.map((reading, index) => {
                  const showLabel = index === 0 || index === chartData.length - 1 || index % Math.ceil(chartData.length / 4) === 0;
                  if (!showLabel) return <div key={index} className="w-1"></div>;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-0.5 h-3 bg-slate-300 mb-2"></div>
                      <div className="text-xs font-semibold text-slate-600 text-center">
                        <div>{new Date(reading.date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric' 
                        })}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(reading.date).toLocaleTimeString(undefined, { 
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health Zone Indicators */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-200/60">
                <div className="text-center">
                  <div className="text-xs font-semibold text-emerald-700 mb-1">Optimal BP</div>
                  <div className="text-sm font-bold text-emerald-800">&lt;120/80</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-xl p-3 border border-yellow-200/60">
                <div className="text-center">
                  <div className="text-xs font-semibold text-yellow-700 mb-1">Elevated</div>
                  <div className="text-sm font-bold text-yellow-800">120-129/&lt;80</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-3 border border-orange-200/60">
                <div className="text-center">
                  <div className="text-xs font-semibold text-orange-700 mb-1">High Stage 1</div>
                  <div className="text-sm font-bold text-orange-800">130-139/80-89</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl p-3 border border-red-200/60">
                <div className="text-center">
                  <div className="text-xs font-semibold text-red-700 mb-1">High Stage 2</div>
                  <div className="text-sm font-bold text-red-800">≥140/90</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Compact View
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{t('trends.quickTrends')}</h3>
          <p className="text-sm text-slate-600">{t('trends.atGlanceOverview')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {t('trends.cards')}
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {t('trends.chart')}
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700"
          >
            {t('trends.compact')}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Systolic Row */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-800">{t('trends.systolic')}</span>
              <div className="text-xs text-slate-500">{t('trends.upperPressure')}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-8">
              <Sparkline data={systolicData.slice(-5)} color="#dc2626" height={32} />
            </div>
            <TrendIndicator {...systolicTrend} label="Systolic" color="#dc2626" />
          </div>
        </div>

        {/* Diastolic Row */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-800">{t('trends.diastolic')}</span>
              <div className="text-xs text-slate-500">{t('trends.lowerPressure')}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-8">
              <Sparkline data={diastolicData.slice(-5)} color="#2563eb" height={32} />
            </div>
            <TrendIndicator {...diastolicTrend} label="Diastolic" color="#2563eb" />
          </div>
        </div>

        {/* Pulse Row */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-800">{t('trends.pulse')}</span>
              <div className="text-xs text-slate-500">{t('trends.heartRate')}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-8">
              <Sparkline data={pulseData.slice(-5)} color="#db2777" height={32} />
            </div>
            <TrendIndicator {...pulseTrend} label="Pulse" color="#db2777" />
          </div>
        </div>
      </div>
    </div>
  );
};
