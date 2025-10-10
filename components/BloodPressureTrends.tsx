import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BloodPressureTrendsProps {
  readings: BloodPressureReading[];
}

// Modern trend indicator
const ModernTrendIndicator: React.FC<{ 
  change: number;
  type: 'systolic' | 'diastolic' | 'pulse';
}> = ({ change, type }) => {
  const isUp = change > 2;
  const isDown = change < -2;
  
  const getStyles = () => {
    if (isUp) return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
    if (isDown) return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white';
    return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
  };
  
  const getIcon = () => {
    if (isUp) return '↗';
    if (isDown) return '↘';
    return '→';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-lg ${getStyles()} animate-pulse-subtle`}>
      <span className="text-base">{getIcon()}</span>
      <span>{Math.abs(change)}</span>
    </div>
  );
};

export const BloodPressureTrends: React.FC<BloodPressureTrendsProps> = ({ readings }) => {
  // Safety check for readings - MUST be before any hooks
  if (!readings || readings.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 rounded-3xl shadow-2xl border border-indigo-200/40 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Trends Data</h3>
        <p className="text-slate-600">Start tracking to see your blood pressure trends!</p>
      </div>
    );
  }

  const { t } = useLocalization();
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  // Prepare data for charts with safety checks
  const chartData = useMemo(() => {
    try {
      const last10 = readings.slice(0, 10).reverse();
      
      const labels = last10.map((r) => {
        const date = new Date(r.date);
        const isToday = new Date().toDateString() === date.toDateString();
        if (isToday) return 'Today';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      return {
        labels,
        systolicData: last10.map(r => r.systolic || 0),
        diastolicData: last10.map(r => r.diastolic || 0),
        pulseData: last10.map(r => r.pulse || 0),
      };
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return {
        labels: [''],
        systolicData: [0],
        diastolicData: [0],
        pulseData: [0],
      };
    }
  }, [readings]);

  // Calculate trends
  const calculateTrend = (type: 'systolic' | 'diastolic' | 'pulse') => {
    if (readings.length < 2) return 0;
    const recent = readings.slice(0, Math.min(5, readings.length));
    const older = readings.slice(5, Math.min(10, readings.length));
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, r) => sum + r[type], 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r[type], 0) / older.length;
    return Math.round(recentAvg - olderAvg);
  };

  const systolicTrend = calculateTrend('systolic');
  const diastolicTrend = calculateTrend('diastolic');
  const pulseTrend = calculateTrend('pulse');

  const avgSystolic = chartData.systolicData.length > 0 
    ? Math.round(chartData.systolicData.reduce((a, b) => a + b, 0) / chartData.systolicData.length)
    : 0;
  const avgDiastolic = chartData.diastolicData.length > 0
    ? Math.round(chartData.diastolicData.reduce((a, b) => a + b, 0) / chartData.diastolicData.length)
    : 0;
  const avgPulse = chartData.pulseData.length > 0
    ? Math.round(chartData.pulseData.reduce((a, b) => a + b, 0) / chartData.pulseData.length)
    : 0;

  // Chart.js configuration for Systolic
  const systolicChartData = useMemo(() => ({
    labels: chartData.labels,
    datasets: [
      {
        label: 'Systolic',
        data: chartData.systolicData,
        borderColor: 'rgb(191, 9, 47)',
        backgroundColor: 'rgba(191, 9, 47, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgb(191, 9, 47)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(191, 9, 47)',
        pointHoverBorderWidth: 4,
      },
    ],
  }), [chartData.labels, chartData.systolicData]);

  // Chart.js configuration for Diastolic
  const diastolicChartData = useMemo(() => ({
    labels: chartData.labels,
    datasets: [
      {
        label: 'Diastolic',
        data: chartData.diastolicData,
        borderColor: 'rgb(22, 71, 106)',
        backgroundColor: 'rgba(22, 71, 106, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgb(22, 71, 106)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(22, 71, 106)',
        pointHoverBorderWidth: 4,
      },
    ],
  }), [chartData.labels, chartData.diastolicData]);

  // Chart.js configuration for Pulse
  const pulseChartData = useMemo(() => ({
    labels: chartData.labels,
    datasets: [
      {
        label: 'Pulse',
        data: chartData.pulseData,
        borderColor: 'rgb(59, 151, 151)',
        backgroundColor: 'rgba(59, 151, 151, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgb(59, 151, 151)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 151, 151)',
        pointHoverBorderWidth: 4,
      },
    ],
  }), [chartData.labels, chartData.pulseData]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} ${context.dataset.label === 'Pulse' ? 'BPM' : 'mmHg'}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
            weight: 'bold' as const,
          },
          padding: 8,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  if (viewMode === 'cards') {
    return (
      <div className="bg-gradient-to-br from-white via-slate-50/30 to-indigo-50/20 rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden backdrop-blur-sm animate-fadeInUp">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 sm:px-8 py-6 sm:py-8 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
          <div>
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg tracking-tight">Quick Trends</h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">📊 At-a-glance overview</p>
              </div>
          </div>
            
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl ring-2 ring-white/20">
            <button
              onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Cards
            </button>
            <button
              onClick={() => setViewMode('compact')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  viewMode === 'compact' 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Compact
            </button>
            </div>
          </div>
        </div>

        {/* Chart Cards */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Systolic Card */}
          <div className="group relative bg-gradient-to-br from-rose-50 via-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">Systolic</h3>
                    <p className="text-xs text-slate-600 font-semibold">Upper pressure</p>
                </div>
              </div>
                <ModernTrendIndicator change={systolicTrend} type="systolic" />
            </div>
              
            <div className="mb-4">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600 drop-shadow-sm">
                  {avgSystolic}
                </div>
                <div className="text-sm font-bold text-slate-600 mt-1">mmHg average</div>
              </div>
              
              <div className="mb-3 h-32">
                <Line data={systolicChartData} options={chartOptions} />
            </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Last 10 readings</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                  {chartData.systolicData[chartData.systolicData.length - 1]} mmHg
              </span>
              </div>
            </div>
          </div>

          {/* Diastolic Card */}
          <div className="group relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">Diastolic</h3>
                    <p className="text-xs text-slate-600 font-semibold">Lower pressure</p>
                </div>
              </div>
                <ModernTrendIndicator change={diastolicTrend} type="diastolic" />
            </div>
              
            <div className="mb-4">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">
                  {avgDiastolic}
                </div>
                <div className="text-sm font-bold text-slate-600 mt-1">mmHg average</div>
              </div>
              
              <div className="mb-3 h-32">
                <Line data={diastolicChartData} options={chartOptions} />
            </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Last 10 readings</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                  {chartData.diastolicData[chartData.diastolicData.length - 1]} mmHg
              </span>
              </div>
            </div>
          </div>

          {/* Pulse Card */}
          <div className="group relative bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-pink-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-heart">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">Pulse</h3>
                    <p className="text-xs text-slate-600 font-semibold">Heart rate</p>
                </div>
              </div>
                <ModernTrendIndicator change={pulseTrend} type="pulse" />
        </div>

              <div className="mb-4">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 drop-shadow-sm">
                  {avgPulse}
                  </div>
                <div className="text-sm font-bold text-slate-600 mt-1">BPM average</div>
              </div>

              <div className="mb-3 h-32">
                <Line data={pulseChartData} options={chartOptions} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Last 10 readings</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-bold">
                  {chartData.pulseData[chartData.pulseData.length - 1]} BPM
                </span>
                  </div>
                </div>
              </div>
        </div>
      </div>
    );
  }

  // Compact View
  return (
    <div className="bg-gradient-to-br from-white via-slate-50/30 to-indigo-50/20 rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden backdrop-blur-sm animate-fadeInUp">
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 sm:px-8 py-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
        <div>
              <h2 className="text-xl font-black text-white drop-shadow-lg">Quick Trends</h2>
              <p className="text-xs text-white/90 font-medium">At-a-glance overview</p>
            </div>
        </div>
          
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl ring-2 ring-white/20">
          <button
            onClick={() => setViewMode('cards')}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              Cards
          </button>
          <button
            onClick={() => setViewMode('compact')}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-white text-indigo-600 shadow-lg"
          >
              Compact
          </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Systolic */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black text-slate-800">Systolic</span>
              <ModernTrendIndicator change={systolicTrend} type="systolic" />
            </div>
            <div className="h-16">
              <Line data={systolicChartData} options={chartOptions} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
              {avgSystolic}
            </div>
            <div className="text-xs font-semibold text-slate-600">mmHg</div>
          </div>
        </div>

        {/* Diastolic */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black text-slate-800">Diastolic</span>
              <ModernTrendIndicator change={diastolicTrend} type="diastolic" />
            </div>
            <div className="h-16">
              <Line data={diastolicChartData} options={chartOptions} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {avgDiastolic}
            </div>
            <div className="text-xs font-semibold text-slate-600">mmHg</div>
          </div>
        </div>

        {/* Pulse */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 animate-pulse-heart">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black text-slate-800">Pulse</span>
              <ModernTrendIndicator change={pulseTrend} type="pulse" />
            </div>
            <div className="h-16">
              <Line data={pulseChartData} options={chartOptions} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
              {avgPulse}
            </div>
            <div className="text-xs font-semibold text-slate-600">BPM</div>
          </div>
        </div>
      </div>
    </div>
  );
};
