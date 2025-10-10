import React, { useMemo } from 'react';
import type { BloodPressureReading } from '../types';
import { useUserSettings } from '../context/UserSettingsContext';
import { useLocalization } from '../context/LocalizationContext';

interface GoalsProgressProps {
  readings: BloodPressureReading[];
}

// Progress bar component
const ProgressBar: React.FC<{
  label: string;
  current: number;
  target: number;
  unit: string;
  gradient: string;
  reverse?: boolean; // For values where lower is better
}> = ({ label, current, target, unit, gradient, reverse = false }) => {
  const calculateProgress = () => {
    if (reverse) {
      // For blood pressure where lower is better
      if (current <= target) return 100;
      const deviation = current - target;
      const maxDeviation = target * 0.3; // 30% over target = 0%
      return Math.max(0, Math.round((1 - deviation / maxDeviation) * 100));
    } else {
      // For things like readings count where higher is better
      return Math.min(100, Math.round((current / target) * 100));
    }
  };

  const progress = calculateProgress();
  const isOnTarget = reverse ? current <= target : current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-black ${isOnTarget ? 'text-[#3B9797]' : 'text-slate-900'}`}>
            {current}
          </span>
          <span className="text-xs text-slate-500">/ {target} {unit}</span>
        </div>
      </div>
      
      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`absolute top-0 left-0 h-full ${gradient} rounded-full transition-all duration-500 shadow-md`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{progress}% complete</span>
        {isOnTarget && (
          <span className="text-xs font-bold text-[#3B9797] flex items-center gap-1">
            <span>✓</span> Target reached!
          </span>
        )}
      </div>
    </div>
  );
};

// Achievement badge component
const AchievementBadge: React.FC<{
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  gradient?: string;
}> = ({ icon, title, description, unlocked, gradient = 'from-slate-300 to-slate-400' }) => (
  <div className={`
    relative rounded-xl p-4 transition-all duration-300
    ${unlocked 
      ? `bg-gradient-to-br ${gradient} shadow-lg hover:scale-105` 
      : 'bg-slate-100 opacity-50 grayscale'}
  `}>
    <div className="flex flex-col items-center text-center gap-2">
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center
        ${unlocked ? 'bg-white/20 shadow-lg ring-2 ring-white/30' : 'bg-white/50'}
      `}>
        <span className="text-3xl">{icon}</span>
      </div>
      <div>
        <h4 className={`text-sm font-black ${unlocked ? 'text-white drop-shadow-md' : 'text-slate-600'}`}>
          {title}
        </h4>
        <p className={`text-xs ${unlocked ? 'text-white/80' : 'text-slate-500'} mt-1`}>
          {description}
        </p>
      </div>
      {unlocked && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#3B9797] rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  </div>
);

export const GoalsProgress: React.FC<GoalsProgressProps> = ({ readings }) => {
  const { settings } = useUserSettings();
  const { t } = useLocalization();

  // Safety check
  if (!settings || !settings.goals) {
    return null;
  }
  
  const goalsData = useMemo(() => {
    if (readings.length === 0) {
      return {
        avgSystolic: 0,
        avgDiastolic: 0,
        weeklyReadings: 0,
        streak: 0,
        achievements: {
          firstReading: false,
          week1: false,
          week2: false,
          month1: false,
          streak7: false,
          streak30: false,
          onTarget10: false,
          readings50: false,
          readings100: false,
        },
      };
    }

    // Calculate last 7 days average
    const last7Days = readings.slice(0, Math.min(7, readings.length));
    const avgSystolic = Math.round(
      last7Days.reduce((sum, r) => sum + r.systolic, 0) / last7Days.length
    );
    const avgDiastolic = Math.round(
      last7Days.reduce((sum, r) => sum + r.diastolic, 0) / last7Days.length
    );

    // Count readings in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyReadings = readings.filter(r => new Date(r.date) >= weekAgo).length;

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

    // Calculate on-target readings
    const targets = settings.goals;
    const onTargetCount = readings.filter(r => 
      r.systolic <= targets.systolic && r.diastolic <= targets.diastolic
    ).length;

    // Calculate time since first reading
    const firstReadingDate = new Date(readings[readings.length - 1].date);
    const daysSinceFirst = Math.floor((Date.now() - firstReadingDate.getTime()) / (1000 * 60 * 60 * 24));

    // Achievements
    const achievements = {
      firstReading: readings.length >= 1,
      week1: daysSinceFirst >= 7 && readings.length >= 3,
      week2: daysSinceFirst >= 14 && readings.length >= 6,
      month1: daysSinceFirst >= 30 && readings.length >= 15,
      streak7: streak >= 7,
      streak30: streak >= 30,
      onTarget10: onTargetCount >= 10,
      readings50: readings.length >= 50,
      readings100: readings.length >= 100,
    };

    return {
      avgSystolic,
      avgDiastolic,
      weeklyReadings,
      streak,
      achievements,
    };
  }, [readings, settings.goals]);

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 rounded-3xl shadow-2xl border border-purple-200/40 overflow-hidden backdrop-blur-sm animate-fadeInUp">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 sm:px-8 py-6 sm:py-8 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
            <span className="text-3xl">🏆</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-lg tracking-tight">Goals & Achievements</h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">🎯 Track your progress & unlock rewards</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Weekly Goals */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
            Weekly Goals
          </h3>
          
          <div className="space-y-5">
            <ProgressBar
              label="Average Systolic"
              current={goalsData.avgSystolic || 0}
              target={settings.goals.systolic}
              unit="mmHg"
              gradient="bg-gradient-to-r from-rose-500 to-red-600"
              reverse={true}
            />
            
            <ProgressBar
              label="Average Diastolic"
              current={goalsData.avgDiastolic || 0}
              target={settings.goals.diastolic}
              unit="mmHg"
              gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
              reverse={true}
            />
            
            <ProgressBar
              label="Readings This Week"
              current={goalsData.weeklyReadings}
              target={7}
              unit="readings"
              gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
            />
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
            Achievements
            <span className="text-sm text-slate-500 font-normal">
              ({Object.values(goalsData.achievements).filter(Boolean).length} / {Object.keys(goalsData.achievements).length})
            </span>
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AchievementBadge
              icon="🌟"
              title="First Steps"
              description="Record your first reading"
              unlocked={goalsData.achievements.firstReading}
              gradient="from-blue-500 to-indigo-600"
            />
            
            <AchievementBadge
              icon="📅"
              title="Week One"
              description="Track for 1 week"
              unlocked={goalsData.achievements.week1}
              gradient="from-indigo-500 to-purple-600"
            />
            
            <AchievementBadge
              icon="⏰"
              title="Two Weeks"
              description="Track for 2 weeks"
              unlocked={goalsData.achievements.week2}
              gradient="from-purple-500 to-pink-600"
            />
            
            <AchievementBadge
              icon="📆"
              title="Month Master"
              description="Track for 30 days"
              unlocked={goalsData.achievements.month1}
              gradient="from-pink-500 to-rose-600"
            />
            
            <AchievementBadge
              icon="🔥"
              title="Hot Streak"
              description="7-day streak"
              unlocked={goalsData.achievements.streak7}
              gradient="from-orange-500 to-red-600"
            />
            
            <AchievementBadge
              icon="💎"
              title="Diamond Streak"
              description="30-day streak"
              unlocked={goalsData.achievements.streak30}
              gradient="from-cyan-500 to-blue-600"
            />
            
            <AchievementBadge
              icon="🎯"
              title="On Target"
              description="10 on-target readings"
              unlocked={goalsData.achievements.onTarget10}
              gradient="from-emerald-500 to-teal-600"
            />
            
            <AchievementBadge
              icon="📊"
              title="Data Collector"
              description="50 total readings"
              unlocked={goalsData.achievements.readings50}
              gradient="from-amber-500 to-orange-600"
            />
            
            <AchievementBadge
              icon="🏆"
              title="Century Club"
              description="100 total readings"
              unlocked={goalsData.achievements.readings100}
              gradient="from-yellow-500 to-amber-600"
            />
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💪</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 mb-2">Keep Going!</h4>
              <p className="text-sm text-slate-600">
                {goalsData.streak >= 30 
                  ? "You're on an incredible streak! Your dedication to health tracking is inspiring."
                  : goalsData.streak >= 7
                  ? "Amazing progress! You're building a strong health tracking habit."
                  : goalsData.streak >= 3
                  ? "Great start! Keep the momentum going to build a lasting habit."
                  : "Every reading brings you closer to better understanding your health. You've got this!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

