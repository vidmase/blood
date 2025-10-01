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
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">{t('trends.title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600">{t('trends.recentPatterns')}</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                viewMode === 'cards' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 active:bg-slate-100'
              }`}
            >
              {t('trends.cards')}
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                viewMode === 'chart' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 active:bg-slate-100'
              }`}
            >
              {t('trends.chart')}
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                viewMode === 'compact' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 active:bg-slate-100'
              }`}
            >
              {t('trends.compact')}
            </button>
            <button
              onClick={() => setViewMode('gauge')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                viewMode === 'gauge' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-600 active:bg-slate-100'
              }`}
            >
              {t('trends.gauge')}
            </button>
          </div>
        </div>

        {/* Trend Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Systolic Card */}
          <div className="bg-white rounded-2xl shadow-md sm:shadow-lg border border-slate-200/60 p-4 sm:p-5 md:p-6 active:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-800">{t('trends.systolic')}</h4>
                  <p className="text-xs text-slate-500">{t('trends.upperPressure')}</p>
                </div>
              </div>
              <TrendIndicator {...systolicTrend} label="Systolic" color="#dc2626" />
            </div>
            <div className="mb-3 sm:mb-4">
              <Sparkline data={systolicData} color="#dc2626" height={50} />
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600">{t('trends.lastReadings', { count: 10 })}</span>
              <span className="font-semibold text-slate-800">
                {t('trends.average', { value: Math.round(systolicData.reduce((a, b) => a + b, 0) / systolicData.length) })}
              </span>
            </div>
          </div>

          {/* Diastolic Card */}
          <div className="bg-white rounded-2xl shadow-md sm:shadow-lg border border-slate-200/60 p-4 sm:p-5 md:p-6 active:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-800">{t('trends.diastolic')}</h4>
                  <p className="text-xs text-slate-500">{t('trends.lowerPressure')}</p>
                </div>
              </div>
              <TrendIndicator {...diastolicTrend} label="Diastolic" color="#2563eb" />
            </div>
            <div className="mb-3 sm:mb-4">
              <Sparkline data={diastolicData} color="#2563eb" height={50} />
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600">{t('trends.lastReadings', { count: 10 })}</span>
              <span className="font-semibold text-slate-800">
                {t('trends.average', { value: Math.round(diastolicData.reduce((a, b) => a + b, 0) / diastolicData.length) })}
              </span>
            </div>
          </div>

          {/* Pulse Card */}
          <div className="bg-white rounded-2xl shadow-md sm:shadow-lg border border-slate-200/60 p-4 sm:p-5 md:p-6 active:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-800">{t('trends.pulse')}</h4>
                  <p className="text-xs text-slate-500">{t('trends.heartRate')}</p>
                </div>
              </div>
              <TrendIndicator {...pulseTrend} label="Pulse" color="#db2777" />
            </div>
            <div className="mb-3 sm:mb-4">
              <Sparkline data={pulseData} color="#db2777" height={50} />
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
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
    const chartData = readings.slice(0, 15).reverse(); // Show last 15 readings for better trend visibility
    
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
    
    // Create separate scales with smart boundaries
    const bpMaxValue = Math.ceil((Math.max(maxSystolic + 15, 160)) / 10) * 10;
    const bpMinValue = Math.floor((Math.max(minDiastolic - 15, 40)) / 10) * 10;
    const bpRange = bpMaxValue - bpMinValue;
    
    const pulseMaxValue = Math.ceil((Math.max(maxPulse + 10, 100)) / 10) * 10;
    const pulseMinValue = Math.floor((Math.max(minPulse - 10, 50)) / 10) * 10;
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
      <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 rounded-3xl shadow-2xl border border-indigo-200/40 overflow-hidden backdrop-blur-sm">
        {/* Modern Gradient Header with Glass Effect */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-6 sm:py-8 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Animated Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            <div>
                <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg tracking-tight">{t('trends.title')}</h3>
                <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
                  📊 {chartData.length} readings • {new Date(chartData[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(chartData[chartData.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
            </div>
            </div>
            
            {/* Modern View Switcher */}
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-xl p-1.5 shadow-lg ring-1 ring-white/30">
              <button
                onClick={() => setViewMode('cards')}
                className="px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-white/80 hover:bg-white/20 hover:text-white transition-all active:scale-95"
              >
                📊 Cards
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className="px-3 py-2 rounded-lg text-xs sm:text-sm font-bold bg-white text-indigo-600 shadow-lg transition-all active:scale-95"
              >
                📈 Chart
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className="px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-white/80 hover:bg-white/20 hover:text-white transition-all active:scale-95"
              >
                ⚡ Compact
              </button>
              <button
                onClick={() => setViewMode('gauge')}
                className="px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-white/80 hover:bg-white/20 hover:text-white transition-all active:scale-95"
              >
                🎯 Gauge
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Premium Stats Cards with Glassmorphism */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Systolic Stats Card */}
              <div className="group relative bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                  </div>
                  <div>
                      <h4 className="text-sm font-bold text-white/90 uppercase tracking-wide">Systolic</h4>
                      <p className="text-xs text-white/70">Upper Pressure</p>
                  </div>
                </div>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-white drop-shadow-lg">{Math.round(allSystolic.reduce((a, b) => a + b, 0) / allSystolic.length)}</span>
                    <span className="text-lg font-bold text-white/80">mmHg</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold text-white/90">Target: &lt;120</span>
                    </div>
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold text-white/90">Range: {minSystolic}-{maxSystolic}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diastolic Stats Card */}
              <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                  </div>
                  <div>
                      <h4 className="text-sm font-bold text-white/90 uppercase tracking-wide">Diastolic</h4>
                      <p className="text-xs text-white/70">Lower Pressure</p>
                  </div>
                </div>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-white drop-shadow-lg">{Math.round(allDiastolic.reduce((a, b) => a + b, 0) / allDiastolic.length)}</span>
                    <span className="text-lg font-bold text-white/80">mmHg</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold text-white/90">Target: &lt;80</span>
                    </div>
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold text-white/90">Range: {minDiastolic}-{maxDiastolic}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pulse Stats Card */}
              <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div>
                      <h4 className="text-sm font-bold text-white/90 uppercase tracking-wide">Heart Rate</h4>
                      <p className="text-xs text-white/70">Pulse Rate</p>
                  </div>
                </div>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-white drop-shadow-lg">{Math.round(allPulse.reduce((a, b) => a + b, 0) / allPulse.length)}</span>
                    <span className="text-lg font-bold text-white/80">BPM</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold text-white/90">Target: 60-100</span>
                    </div>
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold text-white/90">Range: {minPulse}-{maxPulse}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Chart Container */}
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/50 overflow-hidden">
            {/* Decorative Corner Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-100/40 to-rose-100/40 rounded-tr-full"></div>
            
            {/* Chart Title */}
            <div className="relative mb-6 text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-2xl border border-indigo-200/50 shadow-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                <h4 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Trend Analysis
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-3 font-medium">
                📅 {new Date(chartData[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(chartData[chartData.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="relative">
              <svg 
                width="100%" 
                height="500" 
                viewBox="0 0 1000 500" 
                className="rounded-2xl" 
                style={{ background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}
              >
                {/* Definitions */}
                <defs>
                  {/* Gradients for area fills */}
                  <linearGradient id="systolicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="diastolicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
                  </linearGradient>
                  
                  {/* Shadow filter */}
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
                  </filter>
                  
                  {/* Glow filter */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Chart Area - Using proper coordinate system */}
                {(() => {
                  const padding = { left: 80, right: 40, top: 30, bottom: 80 };
                  const chartWidth = 1000 - padding.left - padding.right;
                  const chartHeight = 500 - padding.top - padding.bottom;
                  
                  // Calculate Y positions for BP values
                  const getY = (value: number) => {
                    return padding.top + ((bpMaxValue - value) / bpRange) * chartHeight;
                  };
                  
                  // Calculate X positions
                  const getX = (index: number) => {
                    return padding.left + (index / (chartData.length - 1)) * chartWidth;
                  };
                  
                  // Grid lines (horizontal)
                  const gridLines = [];
                  const gridStep = Math.ceil(bpRange / 5 / 10) * 10; // Round to nearest 10
                  for (let value = Math.floor(bpMinValue / gridStep) * gridStep; value <= bpMaxValue; value += gridStep) {
                    const y = getY(value);
                    gridLines.push(
                      <g key={`grid-${value}`}>
                      <line
                          x1={padding.left}
                          y1={y}
                          x2={1000 - padding.right}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                      />
                      <text
                          x={padding.left - 10}
                          y={y}
                          textAnchor="end"
                        dominantBaseline="middle"
                          className="fill-slate-600 text-sm font-semibold"
                      >
                        {value}
                      </text>
                    </g>
                  );
                  }
                  
                  return <>{gridLines}</>;
                })()}

                {/* Draw the actual chart data */}
                {(() => {
                  const padding = { left: 80, right: 40, top: 30, bottom: 80 };
                  const chartWidth = 1000 - padding.left - padding.right;
                  const chartHeight = 500 - padding.top - padding.bottom;
                  
                  const getY = (value: number) => {
                    return padding.top + ((bpMaxValue - value) / bpRange) * chartHeight;
                  };
                  
                  const getX = (index: number) => {
                    return padding.left + (index / (chartData.length - 1)) * chartWidth;
                  };
                  
                  // Create path strings
                  const systolicPath = chartData.map((reading, i) => {
                    const x = getX(i);
                    const y = getY(reading.systolic);
                    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                  }).join(' ');
                  
                  const diastolicPath = chartData.map((reading, i) => {
                    const x = getX(i);
                    const y = getY(reading.diastolic);
                    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                  }).join(' ');
                  
                  const pulsePath = chartData.map((reading, i) => {
                    const x = getX(i);
                    // Scale pulse to fit in the BP range for visualization
                    const pulseScaled = ((reading.pulse - pulseMinValue) / pulseRange) * bpRange + bpMinValue;
                    const y = getY(pulseScaled);
                    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                  }).join(' ');
                  
                  // Area fills
                  const systolicArea = `${systolicPath} L ${getX(chartData.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
                  const diastolicArea = `${diastolicPath} L ${getX(chartData.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
                  
                  return (
                    <>
                      {/* Area fills */}
                      <path d={systolicArea} fill="url(#systolicGradient)" opacity="0.6" />
                      <path d={diastolicArea} fill="url(#diastolicGradient)" opacity="0.6" />
                      
                      {/* Lines */}
                <path
                        d={systolicPath}
                  fill="none"
                        stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#shadow)"
                />
                <path
                        d={diastolicPath}
                  fill="none"
                        stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#shadow)"
                />
                <path
                        d={pulsePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                        strokeDasharray="6,3"
                  filter="url(#shadow)"
                      />
                      
                      {/* Data points with values */}
                      {chartData.map((reading, i) => {
                        const x = getX(i);
                        const sysY = getY(reading.systolic);
                        const diaY = getY(reading.diastolic);
                        const pulseScaled = ((reading.pulse - pulseMinValue) / pulseRange) * bpRange + bpMinValue;
                        const pulY = getY(pulseScaled);
                        
                        return (
                          <g key={`points-${i}`}>
                            {/* Systolic point */}
                            <circle cx={x} cy={sysY} r="6" fill="#ef4444" stroke="white" strokeWidth="2.5" filter="url(#shadow)" className="cursor-pointer hover:r-8 transition-all">
                              <title>{reading.systolic} mmHg (Systolic)</title>
                            </circle>
                            
                            {/* Diastolic point */}
                            <circle cx={x} cy={diaY} r="6" fill="#3b82f6" stroke="white" strokeWidth="2.5" filter="url(#shadow)" className="cursor-pointer hover:r-8 transition-all">
                              <title>{reading.diastolic} mmHg (Diastolic)</title>
                            </circle>
                            
                            {/* Pulse point */}
                            <circle cx={x} cy={pulY} r="5" fill="#10b981" stroke="white" strokeWidth="2" filter="url(#shadow)" className="cursor-pointer hover:r-7 transition-all">
                              <title>{reading.pulse} BPM (Pulse)</title>
                            </circle>
                            
                            {/* Value labels on data points */}
                            {(i === 0 || i === chartData.length - 1 || i % Math.ceil(chartData.length / 6) === 0) && (
                              <g>
                                {/* Systolic label */}
                                <text
                                  x={x}
                                  y={sysY - 15}
                                  textAnchor="middle"
                                  className="fill-red-600 text-xs font-bold"
                                  style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
                                >
                                  {reading.systolic}
                                </text>
                                
                                {/* Diastolic label */}
                                <text
                                  x={x}
                                  y={diaY + 20}
                                  textAnchor="middle"
                                  className="fill-blue-600 text-xs font-bold"
                                  style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
                                >
                                  {reading.diastolic}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                      
                      {/* X-axis labels (dates) */}
                      {chartData.map((reading, i) => {
                        const x = getX(i);
                        const y = padding.top + chartHeight + 20;
                        
                        // Show labels for first, last, and every few points
                        if (i === 0 || i === chartData.length - 1 || i % Math.ceil(chartData.length / 5) === 0) {
                          const date = new Date(reading.date);
                          return (
                            <g key={`xlabel-${i}`}>
                              <line
                                x1={x}
                                y1={padding.top + chartHeight}
                                x2={x}
                                y2={padding.top + chartHeight + 8}
                                stroke="#94a3b8"
                      strokeWidth="2"
                              />
                              <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                className="fill-slate-600 text-xs font-semibold"
                              >
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </text>
                              <text
                                x={x}
                                y={y + 15}
                                textAnchor="middle"
                                className="fill-slate-400 text-xs"
                              >
                                {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </text>
                            </g>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Axis labels */}
                      <text
                        x={padding.left - 60}
                        y={padding.top + chartHeight / 2}
                        textAnchor="middle"
                        className="fill-slate-700 text-sm font-bold"
                        transform={`rotate(-90, ${padding.left - 60}, ${padding.top + chartHeight / 2})`}
                      >
                        Blood Pressure (mmHg)
                      </text>
                      
                      {/* Chart Legend */}
                      <g transform="translate(820, 40)">
                        <rect x="0" y="0" width="160" height="95" fill="white" stroke="#e2e8f0" strokeWidth="2" rx="8" opacity="0.95" />
                        
                        {/* Systolic legend */}
                        <circle cx="15" cy="20" r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
                        <text x="28" y="24" className="fill-slate-700 text-sm font-semibold">Systolic</text>
                        
                        {/* Diastolic legend */}
                        <circle cx="15" cy="45" r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
                        <text x="28" y="49" className="fill-slate-700 text-sm font-semibold">Diastolic</text>
                        
                        {/* Pulse legend */}
                        <circle cx="15" cy="70" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                        <line x1="5" y1="70" x2="25" y2="70" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2" />
                        <text x="28" y="74" className="fill-slate-700 text-sm font-semibold">Pulse (scaled)</text>
                      </g>
                    </>
                  );
                })()}
              </svg>
                        </div>

            {/* Premium Health Zone Reference Cards */}
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <span className="text-xl">✅</span>
                      </div>
                  <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Normal</div>
                  <div className="text-lg font-black text-white drop-shadow-md">&lt;120/80</div>
              </div>
            </div>

              <div className="group relative bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚠️</span>
                </div>
                  <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Elevated</div>
                  <div className="text-lg font-black text-white drop-shadow-md">120-129/&lt;80</div>
              </div>
                </div>
              
              <div className="group relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔶</span>
              </div>
                  <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Stage 1</div>
                  <div className="text-lg font-black text-white drop-shadow-md">130-139/80-89</div>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <span className="text-xl">🚨</span>
                  </div>
                  <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">Stage 2</div>
                  <div className="text-lg font-black text-white drop-shadow-md">≥140/90</div>
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
