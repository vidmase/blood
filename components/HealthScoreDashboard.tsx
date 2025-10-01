import React, { useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useUserSettings } from '../context/UserSettingsContext';
import { useLocalization } from '../context/LocalizationContext';

interface HealthScoreDashboardProps {
  readings: BloodPressureReading[];
}

// Circular gauge component
const CircularGauge: React.FC<{
  value: number;
  max: number;
  size: number;
}> = ({ value, max, size }) => {
  const percentage = (value / max) * 100;
  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Color based on score
  const getColor = () => {
    if (value >= 80) return { from: '#10b981', to: '#059669', text: 'text-emerald-600' }; // Excellent
    if (value >= 60) return { from: '#3b82f6', to: '#2563eb', text: 'text-blue-600' }; // Good
    if (value >= 40) return { from: '#f59e0b', to: '#d97706', text: 'text-amber-600' }; // Fair
    return { from: '#ef4444', to: '#dc2626', text: 'text-red-600' }; // Needs Improvement
  };
  
  const color = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="20"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.from} />
            <stop offset="100%" stopColor={color.to} />
          </linearGradient>
        </defs>
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-6xl font-black ${color.text} drop-shadow-lg`}>
          {value}
        </span>
        <span className="text-lg font-bold text-slate-500">/ {max}</span>
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-1">
          Health Score
        </span>
      </div>
    </div>
  );
};

// Metric card for stats below gauge
const MetricCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  gradient: string;
}> = ({ icon, label, value, gradient }) => (
  <div className={`${gradient} rounded-xl p-4 shadow-lg`}>
    <div className="flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white drop-shadow-md">{value}</p>
      </div>
    </div>
  </div>
);

export const HealthScoreDashboard: React.FC<HealthScoreDashboardProps> = ({ readings }) => {
  const { settings } = useUserSettings();
  const { t } = useLocalization();

  // Safety check
  if (!settings || !settings.goals) {
    return null;
  }
  
  const healthData = useMemo(() => {
    if (readings.length === 0) {
      return {
        score: 0,
        trend: 0,
        onTargetPercentage: 0,
        streak: 0,
        category: 'No Data',
      };
    }

    const targets = settings.goals;
    const last30Days = readings.slice(0, 30);
    
    // Calculate on-target percentage
    const onTarget = last30Days.filter(r => 
      r.systolic <= targets.systolic && r.diastolic <= targets.diastolic
    ).length;
    const onTargetPercentage = Math.round((onTarget / last30Days.length) * 100);
    
    // Calculate consistency (unique days with readings in last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentReadings = readings.filter(r => new Date(r.date) >= thirtyDaysAgo);
    const uniqueDays = new Set(recentReadings.map(r => new Date(r.date).toDateString())).size;
    const consistencyScore = Math.round((uniqueDays / 30) * 100);
    
    // Calculate average deviation from target
    const avgSystolic = last30Days.reduce((sum, r) => sum + r.systolic, 0) / last30Days.length;
    const avgDiastolic = last30Days.reduce((sum, r) => sum + r.diastolic, 0) / last30Days.length;
    const systolicDeviation = Math.max(0, 100 - Math.abs(avgSystolic - targets.systolic) * 2);
    const diastolicDeviation = Math.max(0, 100 - Math.abs(avgDiastolic - targets.diastolic) * 2);
    
    // Calculate trend (compare last 15 days vs previous 15 days)
    const recent15 = last30Days.slice(0, 15);
    const previous15 = last30Days.slice(15, 30);
    
    if (previous15.length > 0) {
      const recentAvg = recent15.reduce((sum, r) => sum + r.systolic + r.diastolic, 0) / (recent15.length * 2);
      const previousAvg = previous15.reduce((sum, r) => sum + r.systolic + r.diastolic, 0) / (previous15.length * 2);
      const trend = Math.round(recentAvg - previousAvg);
      
      // Calculate streak (consecutive days with readings)
      let streak = 0;
      const sortedReadings = [...readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const readingDates = new Set(sortedReadings.map(r => new Date(r.date).toDateString()));
      
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      while (readingDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      // Calculate overall health score (weighted average)
      const score = Math.round(
        onTargetPercentage * 0.4 +
        consistencyScore * 0.3 +
        systolicDeviation * 0.15 +
        diastolicDeviation * 0.15
      );
      
      // Determine category
      let category = 'Needs Improvement';
      if (score >= 80) category = 'Excellent';
      else if (score >= 60) category = 'Good';
      else if (score >= 40) category = 'Fair';
      
      return {
        score: Math.min(100, Math.max(0, score)),
        trend,
        onTargetPercentage,
        streak,
        category,
      };
    }
    
    return {
      score: 50,
      trend: 0,
      onTargetPercentage,
      streak: 0,
      category: 'Insufficient Data',
    };
  }, [readings, settings.goals]);

  if (readings.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 rounded-3xl shadow-2xl border border-indigo-200/40 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🎯</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Health Score Yet</h3>
        <p className="text-slate-600">Start tracking your blood pressure to see your health score!</p>
      </div>
    );
  }

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
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
            <span className="text-3xl">🎯</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg tracking-tight">Your Health Score</h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">📊 Comprehensive wellness tracking</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Circular Gauge */}
        <div className="flex justify-center mb-8">
          <CircularGauge value={healthData.score} max={100} size={280} />
        </div>

        {/* Score Category */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg ${
            healthData.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
            healthData.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
            healthData.score >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
            'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <span className="text-2xl">
              {healthData.score >= 80 ? '🏆' : 
               healthData.score >= 60 ? '⭐' : 
               healthData.score >= 40 ? '💪' : '📈'}
            </span>
            <span className="text-xl font-black text-white drop-shadow-md">{healthData.category}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <MetricCard
            icon="📈"
            label="Trend"
            value={healthData.trend > 0 ? `+${healthData.trend}` : healthData.trend === 0 ? 'Stable' : healthData.trend}
            gradient={healthData.trend <= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-orange-500 to-red-500'}
          />
          <MetricCard
            icon="🎯"
            label="On Target"
            value={`${healthData.onTargetPercentage}%`}
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          />
          <MetricCard
            icon="🔥"
            label="Streak"
            value={`${healthData.streak} days`}
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          />
        </div>

        {/* Tips based on score */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
            Recommendations
          </h3>
          
          <div className="space-y-3">
            {healthData.score < 60 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Increase tracking consistency</p>
                  <p className="text-xs text-amber-700 mt-1">Try to measure your blood pressure at the same time each day for more accurate trends.</p>
                </div>
              </div>
            )}
            
            {healthData.onTargetPercentage < 70 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xl">🎯</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Work toward your targets</p>
                  <p className="text-xs text-blue-700 mt-1">Consider lifestyle changes like regular exercise, healthy diet, and stress management.</p>
                </div>
              </div>
            )}
            
            {healthData.streak === 0 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm font-semibold text-purple-900">Start your tracking streak</p>
                  <p className="text-xs text-purple-700 mt-1">Record at least one reading today to begin building a healthy habit!</p>
                </div>
              </div>
            )}
            
            {healthData.score >= 80 && (
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-xl">🌟</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Excellent work!</p>
                  <p className="text-xs text-emerald-700 mt-1">You're maintaining great health habits. Keep up the amazing work!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

