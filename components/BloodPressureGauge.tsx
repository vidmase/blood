import React, { useState, useEffect } from 'react';
import type { BloodPressureReading } from '../types';
import { useUserSettings } from '../context/UserSettingsContext';

interface BloodPressureGaugeProps {
  readings: BloodPressureReading[];
}

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  title: string;
  unit: string;
  color: string;
  zones: Array<{
    min: number;
    max: number;
    color: string;
    label: string;
  }>;
  size?: number;
  target?: number; // Optional target value to show with red marker
}

const Gauge: React.FC<GaugeProps> = ({ 
  value, 
  min, 
  max, 
  title, 
  unit, 
  color, 
  zones, 
  size = 200,
  target
}) => {
  const [animatedValue, setAnimatedValue] = useState(min);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Gauge arc from -135° to +135° (270° total)
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;
  
  // Calculate pointer angle
  const valueRatio = Math.max(0, Math.min(1, (animatedValue - min) / (max - min)));
  const pointerAngle = startAngle + (valueRatio * totalAngle);
  
  // Create gauge path
  const createArcPath = (startA: number, endA: number, r: number) => {
    const start = polarToCartesian(centerX, centerY, r, endA);
    const end = polarToCartesian(centerX, centerY, r, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  // Pointer coordinates
  const pointerEnd = polarToCartesian(centerX, centerY, radius - 15, pointerAngle);
  const pointerBase1 = polarToCartesian(centerX, centerY, 8, pointerAngle - 90);
  const pointerBase2 = polarToCartesian(centerX, centerY, 8, pointerAngle + 90);
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="drop-shadow-lg">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Simplified background arc - single color */}
        <path
          d={createArcPath(startAngle, endAngle, radius)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Value arc (animated) - color based on value */}
        <path
          d={createArcPath(startAngle, startAngle + (valueRatio * totalAngle), radius)}
          fill="none"
          stroke={(() => {
            const currentZone = zones.find(zone => value >= zone.min && value <= zone.max);
            return currentZone ? currentZone.color : '#64748b';
          })()}
          strokeWidth="22"
          strokeLinecap="round"
          style={{
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
          }}
        />
        
        {/* Tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const tickRatio = i / 10;
          const tickAngle = startAngle + (tickRatio * totalAngle);
          const tickStart = polarToCartesian(centerX, centerY, radius + 5, tickAngle);
          const tickEnd = polarToCartesian(centerX, centerY, radius + 15, tickAngle);
          const tickValue = min + (tickRatio * (max - min));
          
          return (
            <g key={i}>
              <line
                x1={tickStart.x}
                y1={tickStart.y}
                x2={tickEnd.x}
                y2={tickEnd.y}
                stroke="#64748b"
                strokeWidth="2"
              />
              <text
                x={polarToCartesian(centerX, centerY, radius + 25, tickAngle).x}
                y={polarToCartesian(centerX, centerY, radius + 25, tickAngle).y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-slate-600"
              >
                {Math.round(tickValue)}
              </text>
            </g>
          );
        })}
        
        {/* Target marker (red) */}
        {target !== undefined && target >= min && target <= max && (
          (() => {
            const targetRatio = (target - min) / (max - min);
            const targetAngle = startAngle + (targetRatio * totalAngle);
            const targetStart = polarToCartesian(centerX, centerY, radius - 10, targetAngle);
            const targetEnd = polarToCartesian(centerX, centerY, radius + 25, targetAngle);
            const targetLabelPos = polarToCartesian(centerX, centerY, radius + 35, targetAngle);
            
            return (
              <g>
                {/* Target line */}
                <line
                  x1={targetStart.x}
                  y1={targetStart.y}
                  x2={targetEnd.x}
                  y2={targetEnd.y}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(239, 68, 68, 0.3))'
                  }}
                />
                {/* Target triangle marker */}
                <polygon
                  points={`${targetEnd.x},${targetEnd.y} ${targetEnd.x - 4},${targetEnd.y - 6} ${targetEnd.x + 4},${targetEnd.y - 6}`}
                  fill="#ef4444"
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(239, 68, 68, 0.3))'
                  }}
                />
                {/* Target label */}
                <text
                  x={targetLabelPos.x}
                  y={targetLabelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-red-600"
                  style={{
                    filter: 'drop-shadow(0 1px 1px rgba(255, 255, 255, 0.8))'
                  }}
                >
                  T
                </text>
              </g>
            );
          })()
        )}
        
        {/* Pointer */}
        <polygon
          points={`${pointerEnd.x},${pointerEnd.y} ${pointerBase1.x},${pointerBase1.y} ${pointerBase2.x},${pointerBase2.y}`}
          fill="#1e293b"
          style={{
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
          }}
        />
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="12"
          fill="#1e293b"
          stroke="white"
          strokeWidth="3"
        />
        
        {/* Value display */}
        <text
          x={centerX}
          y={centerY + 40}
          textAnchor="middle"
          className="text-2xl font-bold fill-slate-800"
        >
          {Math.round(animatedValue)}
        </text>
        <text
          x={centerX}
          y={centerY + 58}
          textAnchor="middle"
          className="text-sm font-medium fill-slate-500"
        >
          {unit}
        </text>
      </svg>
      
      {/* Title */}
      <h4 className="text-lg font-semibold text-slate-800 mt-2">{title}</h4>
      
      {/* Status indicator */}
      <div className="mt-3">
        {(() => {
          const currentZone = zones.find(zone => value >= zone.min && value <= zone.max);
          if (!currentZone) return null;
          
          return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              currentZone.color === '#10b981' ? 'bg-green-100 text-green-700' :
              currentZone.color === '#f59e0b' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: currentZone.color }}
              ></div>
              <span>{currentZone.label}</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export const BloodPressureGauge: React.FC<BloodPressureGaugeProps> = ({ readings }) => {
  const { targets } = useUserSettings();
  const [selectedReading, setSelectedReading] = useState(0);
  
  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Gauge Data Available</h3>
        <p className="text-slate-600">Add readings to see blood pressure gauges</p>
      </div>
    );
  }

  const currentReading = readings[selectedReading];
  
  // Simplified 3-zone system for better readability
  const systolicZones = [
    { min: 60, max: 120, color: '#10b981', label: 'Normal' },
    { min: 120, max: 140, color: '#f59e0b', label: 'Elevated' },
    { min: 140, max: 200, color: '#ef4444', label: 'High' }
  ];
  
  const diastolicZones = [
    { min: 40, max: 80, color: '#10b981', label: 'Normal' },
    { min: 80, max: 90, color: '#f59e0b', label: 'Elevated' },
    { min: 90, max: 120, color: '#ef4444', label: 'High' }
  ];
  
  const pulseZones = [
    { min: 40, max: 100, color: '#10b981', label: 'Normal' },
    { min: 100, max: 120, color: '#f59e0b', label: 'Elevated' },
    { min: 120, max: 200, color: '#ef4444', label: 'High' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-slate-200/60 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Blood Pressure Gauges</h3>
              <p className="text-sm text-slate-600">Medical-style gauge visualization</p>
            </div>
          </div>
          
          {/* Reading selector */}
          {readings.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Reading:</label>
              <select
                value={selectedReading}
                onChange={(e) => setSelectedReading(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {readings.map((reading, index) => (
                  <option key={reading.id} value={index}>
                    {new Date(reading.date).toLocaleDateString()} - {new Date(reading.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Reading info */}
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-800">
              {new Date(currentReading.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-sm text-slate-600">
              {new Date(currentReading.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedReading(Math.max(0, selectedReading - 1))}
              disabled={selectedReading === 0}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-600">
              {selectedReading + 1} of {readings.length}
            </span>
            <button
              onClick={() => setSelectedReading(Math.min(readings.length - 1, selectedReading + 1))}
              disabled={selectedReading === readings.length - 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-center">
          {/* Systolic Gauge */}
          <Gauge
            value={currentReading.systolic}
            min={60}
            max={200}
            title="Systolic Pressure"
            unit="mmHg"
            color="#64748b"
            zones={systolicZones}
            size={240}
            target={targets.systolic}
          />
          
          {/* Diastolic Gauge */}
          <Gauge
            value={currentReading.diastolic}
            min={40}
            max={120}
            title="Diastolic Pressure"
            unit="mmHg"
            color="#64748b"
            zones={diastolicZones}
            size={240}
            target={targets.diastolic}
          />
          
          {/* Pulse Gauge */}
          <Gauge
            value={currentReading.pulse}
            min={40}
            max={200}
            title="Heart Rate"
            unit="BPM"
            color="#64748b"
            zones={pulseZones}
            size={240}
          />
        </div>
      </div>

      {/* Combined Reading Display */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-t border-slate-200/60">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {currentReading.systolic}/{currentReading.diastolic}
            <span className="text-lg font-medium text-slate-600 ml-2">mmHg</span>
          </div>
          <div className="text-lg font-semibold text-pink-600">
            {currentReading.pulse} <span className="text-sm font-medium">BPM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
