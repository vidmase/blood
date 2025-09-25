
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface AnalysisChartProps {
  data: BloodPressureReading[];
  totalReadings: number;
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ data, totalReadings }) => {
    const { t, language } = useLocalization();
    const dateLocale = language === 'lt' ? 'lt-LT' : 'en-US';
    
    const chartData = data
    .slice() // Create a shallow copy to avoid mutating the original array
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
    .map(reading => ({
      ...reading,
      name: new Date(reading.date).toLocaleString(dateLocale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
    }));

    const hasEnoughFilteredReadings = data.length >= 2;

    const getEmptyStateMessage = () => {
        const hasOriginalReadings = totalReadings > 0;
        
        if (!hasOriginalReadings) {
            return t('chart.empty.noData');
        }
        
        if (data.length === 0) {
            return t('chart.empty.filtered');
        }
        
        // This means data.length is 1 and we have original readings
        return t('chart.empty.notEnough');
    };

  return (
    <div style={{ width: '100%', height: 300 }}>
        {!hasEnoughFilteredReadings ? (
             <div className="flex flex-col items-center justify-center h-full text-center py-10 px-6 bg-slate-50/70 rounded-lg border-2 border-dashed border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-slate-500 font-medium">{getEmptyStateMessage()}</p>
            </div>
        ) : (
            <ResponsiveContainer>
                <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                }}
                >
                <defs>
                    <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                />
                <Area type="monotone" dataKey="systolic" stroke="0" fill="url(#colorSystolic)" />
                <Area type="monotone" dataKey="diastolic" stroke="0" fill="url(#colorDiastolic)" />
                <Area type="monotone" dataKey="pulse" stroke="0" fill="url(#colorPulse)" />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} name="Systolic" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="diastolic" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} name="Diastolic" dot={{ r: 4 }}/>
                <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} name="Pulse" dot={{ r: 4 }}/>
                </LineChart>
            </ResponsiveContainer>
        )}
    </div>
  );
};
