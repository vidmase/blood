

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BloodPressureReading } from '../types';
import { useLocalization } from '../context/LocalizationContext';

interface ReportsDashboardProps {
  readings: BloodPressureReading[];
  startDate: string;
  endDate: string;
}

const ChartIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const StatCard: React.FC<{title: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string}> = ({title, value, icon, color, subtitle}) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                {subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
            </div>
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

        // Find the reading with the highest systolic pressure
        const highestSystolicReading = readings.find(r => r.systolic === highSystolic);
        const highestDiastolicReading = readings.find(r => r.diastolic === highDiastolic);
        
        const timeOfDayData: { [key: string]: { sys: number[], dia: number[] } } = {
            Morning: { sys: [], dia: [] }, // 5am-12pm
            Afternoon: { sys: [], dia: [] }, // 12pm-5pm
            Evening: { sys: [], dia: [] }, // 5pm-9pm
            Night: { sys: [], dia: [] }, // 9pm-5am
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

    return (
        <div className="bg-[var(--c-surface)] p-6 rounded-2xl shadow-lg shadow-indigo-100/50 animate-fadeInUp">
            <div className="flex items-center space-x-2 mb-4">
                <ChartIcon className="w-7 h-7 text-transparent bg-clip-text bg-gradient-to-r from-[var(--c-primary)] to-[var(--c-secondary)]" />
                <h2 className="text-2xl font-bold text-[var(--c-text-primary)]">{t('reports.title')}</h2>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">{t('reports.summaryTitle')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard title={t('reports.stat.avg')} value={`${avgSystolic} / ${avgDiastolic}`} color="bg-indigo-100"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        />
                        <StatCard title={t('reports.stat.highSystolic')} value={`${highSystolic}`} color="bg-red-100"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>}
                            subtitle={highestSystolicDate ? `${t('reports.recordedOn')} ${new Date(highestSystolicDate).toLocaleDateString()}` : undefined}
                        />
                        <StatCard title={t('reports.stat.highDiastolic')} value={`${highDiastolic}`} color="bg-orange-100"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>}
                            subtitle={highestDiastolicDate ? `${t('reports.recordedOn')} ${new Date(highestDiastolicDate).toLocaleDateString()}` : undefined}
                        />
                         <StatCard title={t('reports.stat.total')} value={totalReadings} color="bg-emerald-100"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                        />
                    </div>
                </div>

                {chartData.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 mb-2">{t('reports.timeOfDayTitle')}</h3>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            borderRadius: '0.75rem', 
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        formatter={(value: number, name: string) => [
                                            `${value} mmHg`,
                                            name === 'systolic' ? t('analysis.systolic') : t('analysis.diastolic')
                                        ]}
                                        labelFormatter={(label) => `${t('reports.timeOfDayTitle')}: ${label}`}
                                    />
                                    <Legend wrapperStyle={{fontSize: '14px'}}/>
                                    <Bar dataKey="systolic" fill="#ef4444" name={t('analysis.systolic')} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="diastolic" fill="#6366f1" name={t('analysis.diastolic')} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">{t('reports.consistencyTitle')}</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-emerald-400 to-cyan-500 h-2.5 rounded-full" style={{ width: `${consistency}%` }}></div>
                        </div>
                        <span className="font-bold text-emerald-600">{consistency}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t('reports.consistencyDesc')}</p>
                </div>
            </div>
        </div>
    );
};
