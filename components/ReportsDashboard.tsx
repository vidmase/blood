import React, { useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface ReportsDashboardProps {
  readings: BloodPressureReading[];
  startDate: string;
  endDate: string;
}

// Premium Stat Card with Gradients
const PremiumStatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
}> = ({ title, value, icon, gradient, subtitle }) => (
  <div className={`
    group relative rounded-2xl p-5 shadow-xl hover:shadow-2xl
    transition-all duration-300 hover:scale-105 overflow-hidden ${gradient}
  `}>
    {/* Animated Background Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative">
      {/* Icon */}
      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 shadow-lg ring-2 ring-white/30">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">{title}</h3>
      
      {/* Value */}
      <p className="text-3xl font-black text-white drop-shadow-lg mb-1">{value}</p>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-white/70 font-medium mt-2 truncate">{subtitle}</p>
      )}
    </div>
  </div>
);

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ readings, startDate, endDate }) => {
  const { t } = useLocalization();

  const stats = useMemo(() => {
    if (readings.length === 0) return null;

    const totalSystolic = readings.reduce((sum, r) => sum + r.systolic, 0);
    const totalDiastolic = readings.reduce((sum, r) => sum + r.diastolic, 0);
    const highSystolic = Math.max(...readings.map(r => r.systolic));
    const highDiastolic = Math.max(...readings.map(r => r.diastolic));

    const highestSystolicReading = readings.find(r => r.systolic === highSystolic);
    const highestDiastolicReading = readings.find(r => r.diastolic === highDiastolic);
    
    const timeOfDayData: { [key: string]: { sys: number[], dia: number[] } } = {
      Morning: { sys: [], dia: [] },
      Afternoon: { sys: [], dia: [] },
      Evening: { sys: [], dia: [] },
      Night: { sys: [], dia: [] },
    };

    readings.forEach(r => {
      const hour = new Date(r.date).getHours();
      if (hour >= 5 && hour < 12) {
        timeOfDayData.Morning.sys.push(r.systolic);
        timeOfDayData.Morning.dia.push(r.diastolic);
      } else if (hour >= 12 && hour < 17) {
        timeOfDayData.Afternoon.sys.push(r.systolic);
        timeOfDayData.Afternoon.dia.push(r.diastolic);
      } else if (hour >= 17 && hour < 21) {
        timeOfDayData.Evening.sys.push(r.systolic);
        timeOfDayData.Evening.dia.push(r.diastolic);
      } else {
        timeOfDayData.Night.sys.push(r.systolic);
        timeOfDayData.Night.dia.push(r.diastolic);
      }
    });

    const calculateAvg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b) / arr.length) : 0;
    
    const chartData = Object.entries(timeOfDayData).map(([name, data]) => ({
      name: t(`reports.time.${name.toLowerCase()}`),
      systolic: calculateAvg(data.sys),
      diastolic: calculateAvg(data.dia),
      count: data.sys.length,
    })).filter(d => d.systolic > 0);

    const start = startDate ? new Date(startDate) : new Date(readings[readings.length - 1].date);
    const end = endDate ? new Date(endDate) : new Date(readings[0].date);
    
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    const totalDaysInRange = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const uniqueDaysWithReadings = new Set(readings.map(r => new Date(r.date).toDateString())).size;
    const consistency = Math.min(100, Math.round((uniqueDaysWithReadings / totalDaysInRange) * 100));

    return {
      avgSystolic: Math.round(totalSystolic / readings.length),
      avgDiastolic: Math.round(totalDiastolic / readings.length),
      highSystolic,
      highDiastolic,
      highestSystolicDate: highestSystolicReading?.date,
      highestDiastolicDate: highestDiastolicReading?.date,
      totalReadings: readings.length,
      chartData,
      consistency,
    };
  }, [readings, startDate, endDate, t]);

  if (!stats) {
    return null;
  }

  const { avgSystolic, avgDiastolic, highSystolic, highDiastolic, highestSystolicDate, highestDiastolicDate, totalReadings, chartData, consistency } = stats;

  // Calculate max value for chart scaling
  const maxValue = Math.max(...chartData.flatMap(d => [d.systolic, d.diastolic]), 140);
  const chartHeight = 300;
  const chartWidth = 800;
  const padding = { left: 60, right: 40, top: 30, bottom: 60 };
  const barWidth = (chartWidth - padding.left - padding.right) / (chartData.length * 2.5);

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 rounded-3xl shadow-2xl border border-indigo-200/40 overflow-hidden backdrop-blur-sm animate-fadeInUp">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 sm:px-8 py-6 sm:py-8 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        <div className="relative flex items-center gap-4">
          {/* Animated Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg tracking-tight">{t('reports.title')}</h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">📊 Comprehensive health analytics</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Premium Stat Cards */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
            {t('reports.summaryTitle')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PremiumStatCard
              title={t('reports.stat.avg')}
              value={`${avgSystolic}/${avgDiastolic}`}
              gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              subtitle="mmHg average"
            />
            <PremiumStatCard
              title={t('reports.stat.highSystolic')}
              value={highSystolic}
              gradient="bg-gradient-to-br from-rose-500 to-red-600"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              }
              subtitle={highestSystolicDate ? new Date(highestSystolicDate).toLocaleDateString() : undefined}
            />
            <PremiumStatCard
              title={t('reports.stat.highDiastolic')}
              value={highDiastolic}
              gradient="bg-gradient-to-br from-orange-500 to-red-500"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              }
              subtitle={highestDiastolicDate ? new Date(highestDiastolicDate).toLocaleDateString() : undefined}
            />
            <PremiumStatCard
              title={t('reports.stat.total')}
              value={totalReadings}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
              subtitle="readings recorded"
            />
          </div>
        </div>

        {/* Custom SVG Chart - Time of Day Analysis */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
              {t('reports.timeOfDayTitle')}
            </h3>
            
            <div className="relative">
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="overflow-visible"
              >
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((percent) => {
                  const value = Math.round(maxValue * (1 - percent / 100));
                  const y = padding.top + (percent / 100) * (chartHeight - padding.top - padding.bottom);
                  return (
                    <g key={percent}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
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
                        className="text-xs fill-slate-600 font-semibold"
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {chartData.map((data, index) => {
                  const x = padding.left + (index * (chartWidth - padding.left - padding.right) / chartData.length);
                  const systolicHeight = ((data.systolic / maxValue) * (chartHeight - padding.top - padding.bottom));
                  const diastolicHeight = ((data.diastolic / maxValue) * (chartHeight - padding.top - padding.bottom));
                  const systolicY = chartHeight - padding.bottom - systolicHeight;
                  const diastolicY = chartHeight - padding.bottom - diastolicHeight;

                  return (
                    <g key={index}>
                      {/* Systolic Bar */}
                      <defs>
                        <linearGradient id={`systolic-grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id={`diastolic-grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      
                      <rect
                        x={x + 10}
                        y={systolicY}
                        width={barWidth}
                        height={systolicHeight}
                        fill={`url(#systolic-grad-${index})`}
                        rx="4"
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      >
                        <title>{`Systolic: ${data.systolic} mmHg (${data.count} readings)`}</title>
                      </rect>
                      
                      {/* Diastolic Bar */}
                      <rect
                        x={x + barWidth + 15}
                        y={diastolicY}
                        width={barWidth}
                        height={diastolicHeight}
                        fill={`url(#diastolic-grad-${index})`}
                        rx="4"
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      >
                        <title>{`Diastolic: ${data.diastolic} mmHg (${data.count} readings)`}</title>
                      </rect>

                      {/* Labels */}
                      <text
                        x={x + barWidth + 10}
                        y={chartHeight - padding.bottom + 20}
                        textAnchor="middle"
                        className="text-xs fill-slate-700 font-semibold"
                      >
                        {data.name}
                      </text>
                      <text
                        x={x + barWidth + 10}
                        y={chartHeight - padding.bottom + 35}
                        textAnchor="middle"
                        className="text-xs fill-slate-500"
                      >
                        {data.count} {data.count === 1 ? 'reading' : 'readings'}
                      </text>
                    </g>
                  );
                })}

                {/* Y-axis label */}
                <text
                  x={20}
                  y={chartHeight / 2}
                  textAnchor="middle"
                  className="text-xs fill-slate-600 font-bold"
                  transform={`rotate(-90, 20, ${chartHeight / 2})`}
                >
                  Blood Pressure (mmHg)
                </text>

                {/* Legend */}
                <g transform={`translate(${chartWidth - 200}, 20)`}>
                  <rect x="0" y="0" width="180" height="60" fill="white" stroke="#e2e8f0" strokeWidth="2" rx="8" opacity="0.95" />
                  
                  <rect x="15" y="15" width="20" height="12" fill="url(#systolic-grad-0)" rx="2" />
                  <text x="40" y="24" className="text-xs fill-slate-700 font-semibold">Systolic</text>
                  
                  <rect x="15" y="35" width="20" height="12" fill="url(#diastolic-grad-0)" rx="2" />
                  <text x="40" y="44" className="text-xs fill-slate-700 font-semibold">Diastolic</text>
                </g>
              </svg>
            </div>
          </div>
        )}
        
        {/* Consistency Tracker with Premium Design */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
            {t('reports.consistencyTitle')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 font-medium">{t('reports.consistencyDesc')}</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                {consistency}%
              </span>
            </div>
            
            <div className="relative w-full h-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${consistency}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
            
            {/* Consistency Indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {consistency >= 80 ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="text-2xl">🏆</span>
                  <span className="text-sm font-bold">Excellent tracking!</span>
                </div>
              ) : consistency >= 60 ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="text-2xl">⭐</span>
                  <span className="text-sm font-bold">Good progress!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-2xl">📈</span>
                  <span className="text-sm font-bold">Keep going!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
