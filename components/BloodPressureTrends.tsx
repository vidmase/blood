import React, { useState } from 'react';
import type { BloodPressureReading } from '../types';
import { BloodPressureGauge } from './BloodPressureGauge';

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
  const [viewMode, setViewMode] = useState<'cards' | 'chart' | 'compact' | 'gauge'>('cards');
  
  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Trend Data Available</h3>
        <p className="text-slate-600">Add more readings to see blood pressure trends</p>
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
            <h3 className="text-xl font-bold text-slate-800">Blood Pressure Trends</h3>
            <p className="text-sm text-slate-600">Recent patterns and changes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'chart' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'compact' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setViewMode('gauge')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'gauge' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Gauge
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
                  <h4 className="font-semibold text-slate-800">Systolic</h4>
                  <p className="text-xs text-slate-500">Upper pressure</p>
                </div>
              </div>
              <TrendIndicator {...systolicTrend} label="Systolic" color="#dc2626" />
            </div>
            <div className="mb-4">
              <Sparkline data={systolicData} color="#dc2626" height={50} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Last 10 readings</span>
              <span className="font-semibold text-slate-800">
                Avg: {Math.round(systolicData.reduce((a, b) => a + b, 0) / systolicData.length)}
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
                  <h4 className="font-semibold text-slate-800">Diastolic</h4>
                  <p className="text-xs text-slate-500">Lower pressure</p>
                </div>
              </div>
              <TrendIndicator {...diastolicTrend} label="Diastolic" color="#2563eb" />
            </div>
            <div className="mb-4">
              <Sparkline data={diastolicData} color="#2563eb" height={50} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Last 10 readings</span>
              <span className="font-semibold text-slate-800">
                Avg: {Math.round(diastolicData.reduce((a, b) => a + b, 0) / diastolicData.length)}
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
                  <h4 className="font-semibold text-slate-800">Pulse</h4>
                  <p className="text-xs text-slate-500">Heart rate</p>
                </div>
              </div>
              <TrendIndicator {...pulseTrend} label="Pulse" color="#db2777" />
            </div>
            <div className="mb-4">
              <Sparkline data={pulseData} color="#db2777" height={50} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Last 10 readings</span>
              <span className="font-semibold text-slate-800">
                Avg: {Math.round(pulseData.reduce((a, b) => a + b, 0) / pulseData.length)} BPM
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

  // Chart View
  if (viewMode === 'chart') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Blood Pressure Chart</h3>
            <p className="text-sm text-slate-600">Combined trend visualization</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700"
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Compact
            </button>
            <button
              onClick={() => setViewMode('gauge')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Gauge
            </button>
          </div>
        </div>

        <div className="relative h-64 mb-6">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}
            
            {/* Systolic line */}
            <Sparkline data={systolicData} color="#dc2626" height={256} />
            
            {/* Diastolic line */}
            <Sparkline data={diastolicData} color="#2563eb" height={256} />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">Systolic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">Diastolic</span>
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
          <h3 className="text-xl font-bold text-slate-800">Quick Trends</h3>
          <p className="text-sm text-slate-600">At-a-glance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Chart
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700"
          >
            Compact
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
              <span className="font-semibold text-slate-800">Systolic</span>
              <div className="text-xs text-slate-500">Upper pressure</div>
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
              <span className="font-semibold text-slate-800">Diastolic</span>
              <div className="text-xs text-slate-500">Lower pressure</div>
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
              <span className="font-semibold text-slate-800">Pulse</span>
              <div className="text-xs text-slate-500">Heart rate</div>
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
