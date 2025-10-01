import React, { useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useUserSettings } from '../context/UserSettingsContext';
import { useLocalization } from '../context/LocalizationContext';

interface QuickStatsWidgetProps {
  readings: BloodPressureReading[];
}

// Stat row component
const StatRow: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  highlight?: boolean;
  gradient?: string;
}> = ({ icon, label, value, highlight = false, gradient }) => (
  <div className={`
    flex items-center justify-between p-4 rounded-xl transition-all duration-300
    ${highlight && gradient ? `${gradient} shadow-lg` : 'bg-slate-50 hover:bg-slate-100'}
  `}>
    <div className="flex items-center gap-3">
      <span className={`text-2xl ${highlight ? 'drop-shadow-md' : ''}`}>{icon}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-white' : 'text-slate-700'}`}>
        {label}
      </span>
    </div>
    <span className={`text-lg font-black ${highlight ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>
      {value}
    </span>
  </div>
);

export const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({ readings }) => {
  const { settings } = useUserSettings();
  const { t } = useLocalization();

  // Safety check
  if (!settings || !settings.goals) {
    return null;
  }
  
  const todayStats = useMemo(() => {
    if (readings.length === 0) {
      return {
        todayReadings: 0,
        avgSystolic: 0,
        avgDiastolic: 0,
        avgPulse: 0,
        streak: 0,
        onTarget: 0,
        lastReading: null,
      };
    }

    // Get today's readings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayReadings = readings.filter(r => {
      const readingDate = new Date(r.date);
      readingDate.setHours(0, 0, 0, 0);
      return readingDate.getTime() === today.getTime();
    });

    // Calculate today's averages
    const avgSystolic = todayReadings.length > 0
      ? Math.round(todayReadings.reduce((sum, r) => sum + r.systolic, 0) / todayReadings.length)
      : 0;
    
    const avgDiastolic = todayReadings.length > 0
      ? Math.round(todayReadings.reduce((sum, r) => sum + r.diastolic, 0) / todayReadings.length)
      : 0;
    
    const avgPulse = todayReadings.length > 0
      ? Math.round(todayReadings.reduce((sum, r) => sum + r.pulse, 0) / todayReadings.length)
      : 0;

    // Calculate streak
    let streak = 0;
    const sortedReadings = [...readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const readingDates = new Set(sortedReadings.map(r => {
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);
      return d.toDateString();
    }));
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    while (readingDates.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Calculate on-target today
    const targets = settings.goals;
    const onTarget = todayReadings.filter(r => 
      r.systolic <= targets.systolic && r.diastolic <= targets.diastolic
    ).length;

    // Get last reading
    const lastReading = readings[0];

    return {
      todayReadings: todayReadings.length,
      avgSystolic,
      avgDiastolic,
      avgPulse,
      streak,
      onTarget,
      lastReading,
    };
  }, [readings, settings.goals]);

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/30 to-indigo-50/20 rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden backdrop-blur-sm animate-fadeInUp">
      {/* Compact Premium Header */}
      <div className="relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-5 overflow-hidden">
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}></div>
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white drop-shadow-lg">Today's Summary</h2>
              <p className="text-xs text-white/70 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <span className="text-xs font-bold text-white/90">LIVE</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {/* Readings Count - Highlighted */}
        <StatRow
          icon="📝"
          label="Readings Today"
          value={todayStats.todayReadings}
          highlight={todayStats.todayReadings > 0}
          gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
        />

        {/* Average BP */}
        {todayStats.todayReadings > 0 && (
          <StatRow
            icon="💓"
            label="Average BP"
            value={`${todayStats.avgSystolic}/${todayStats.avgDiastolic}`}
            highlight={true}
            gradient="bg-gradient-to-r from-rose-500 to-red-600"
          />
        )}

        {/* Pulse */}
        {todayStats.todayReadings > 0 && (
          <StatRow
            icon="💗"
            label="Average Pulse"
            value={`${todayStats.avgPulse} BPM`}
          />
        )}

        {/* Streak */}
        <StatRow
          icon="🔥"
          label="Current Streak"
          value={`${todayStats.streak} ${todayStats.streak === 1 ? 'day' : 'days'}`}
          highlight={todayStats.streak >= 7}
          gradient="bg-gradient-to-r from-orange-500 to-red-500"
        />

        {/* On Target */}
        {todayStats.todayReadings > 0 && (
          <StatRow
            icon="🎯"
            label="On Target Today"
            value={`${todayStats.onTarget}/${todayStats.todayReadings}`}
            highlight={todayStats.onTarget === todayStats.todayReadings && todayStats.todayReadings > 0}
            gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
          />
        )}

        {/* Last Reading Time */}
        {todayStats.lastReading && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Last Reading</span>
              <span className="font-bold text-slate-900">
                {new Date(todayStats.lastReading.date).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {todayStats.todayReadings === 0 && (
          <div className="mt-4 text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">No readings today</p>
            <p className="text-xs text-slate-500">Add your first reading to start tracking!</p>
          </div>
        )}

        {/* Quick Tip */}
        {todayStats.streak > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-xs font-bold text-amber-900">Tip of the Day</p>
                <p className="text-xs text-amber-700 mt-1">
                  {todayStats.streak >= 7 
                    ? "Amazing streak! Consistency is key to understanding your health patterns."
                    : "Keep building your streak! Daily tracking helps identify trends early."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

