import React from 'react';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface MiniGaugesProps {
  readings: BloodPressureReading[];
}

export const MiniGauges: React.FC<MiniGaugesProps> = ({ readings }) => {
  const { t } = useLocalization();

  if (readings.length === 0) {
    return null;
  }

  const latestReading = readings[0];
  const { systolic, diastolic, pulse } = latestReading;

  // Mini gauge component
  const MiniGauge: React.FC<{
    value: number;
    max: number;
    color: string;
    label: string;
    unit: string;
  }> = ({ value, max, color, label, unit }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 14; // radius = 14
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            {/* Background circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>
          {/* Value in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700">{value}</span>
          </div>
        </div>
        <div className="text-center mt-1">
          <div className="text-xs font-medium text-slate-600">{label}</div>
          {unit && <div className="text-xs text-slate-400">{unit}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="hidden lg:flex items-center space-x-3 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm">
      <MiniGauge
        value={systolic}
        max={200}
        color="#ef4444"
        label="SYS"
        unit=""
      />
      <div className="text-lg font-bold text-slate-400">/</div>
      <MiniGauge
        value={diastolic}
        max={120}
        color="#3b82f6"
        label="DIA"
        unit=""
      />
      <div className="w-px h-6 bg-slate-200 mx-2"></div>
      <MiniGauge
        value={pulse}
        max={120}
        color="#10b981"
        label="HR"
        unit=""
      />
      <div className="ml-2 text-xs text-slate-500 text-center">
        <div className="font-medium text-slate-600">Latest</div>
        <div className="text-xs font-semibold text-slate-700">
          {new Date(latestReading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div className="text-xs text-slate-500">
          {new Date(latestReading.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
