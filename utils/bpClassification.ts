/**
 * Blood Pressure Classification Utilities
 * Based on European Society of Hypertension (ESH) 2023 Guidelines
 */

import { ESH_BP_CATEGORIES, BPCategory } from '../constants';
import type { BloodPressureReading } from '../types';

/**
 * Classifies a blood pressure reading according to ESH standards
 * 
 * The classification follows a priority system:
 * 1. Check for hypertensive crisis first
 * 2. Check for hypotension
 * 3. Check for isolated systolic hypertension
 * 4. Check other categories based on both systolic and diastolic values
 * 
 * When systolic and diastolic fall into different categories,
 * the higher risk category is selected.
 */
export function classifyBloodPressure(
  systolic: number,
  diastolic: number
): BPCategory {
  // Priority 1: Hypertensive Crisis (most critical)
  if (systolic >= 220 || diastolic >= 120) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'Crisis')!;
  }

  // Priority 2: Hypotension
  if (systolic <= 89 && diastolic <= 59) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'Low')!;
  }

  // Priority 3: Isolated Systolic Hypertension
  // High systolic (≥140) but normal diastolic (<90)
  if (systolic >= 140 && diastolic < 90) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'ISH')!;
  }

  // Priority 4: Grade 3 Hypertension
  if (systolic >= 180 || diastolic >= 110) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'Grade 3 HTN')!;
  }

  // Priority 5: Grade 2 Hypertension
  if (systolic >= 160 || diastolic >= 100) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'Grade 2 HTN')!;
  }

  // Priority 6: Grade 1 Hypertension
  if (systolic >= 140 || diastolic >= 90) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'Grade 1 HTN')!;
  }

  // Priority 7: High Normal
  if (systolic >= 130 || diastolic >= 85) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'High-Normal')!;
  }

  // Priority 8: Normal
  if (systolic >= 120 || diastolic >= 80) {
    return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'Normal')!;
  }

  // Default: Optimal
  return ESH_BP_CATEGORIES.find(cat => cat.categoryShort === 'Optimal')!;
}

/**
 * Classifies a blood pressure reading object
 */
export function classifyReading(reading: BloodPressureReading): BPCategory {
  return classifyBloodPressure(reading.systolic, reading.diastolic);
}

/**
 * Gets a simple risk assessment based on the category
 */
export function getRiskAssessment(category: BPCategory): string {
  const riskMessages = {
    'low': 'Low cardiovascular risk - maintain healthy habits',
    'moderate': 'Moderate risk - lifestyle changes recommended',
    'high': 'High risk - medical consultation advised',
    'very-high': 'Very high risk - medical treatment recommended',
    'critical': 'Critical - urgent/emergency medical attention required'
  };

  return riskMessages[category.riskLevel];
}

/**
 * Determines if a reading requires immediate medical attention
 */
export function requiresUrgentCare(systolic: number, diastolic: number): boolean {
  return systolic >= 180 || diastolic >= 110;
}

/**
 * Determines if a reading is in emergency territory
 */
export function isEmergency(systolic: number, diastolic: number): boolean {
  return systolic >= 220 || diastolic >= 120;
}

/**
 * Calculates the Mean Arterial Pressure (MAP)
 * MAP = DBP + 1/3(SBP - DBP)
 * Normal MAP is 70-100 mmHg
 */
export function calculateMAP(systolic: number, diastolic: number): number {
  return Math.round(diastolic + (systolic - diastolic) / 3);
}

/**
 * Calculates the Pulse Pressure
 * PP = SBP - DBP
 * Normal PP is 40-60 mmHg
 * High PP (>60) may indicate arterial stiffness
 */
export function calculatePulsePressure(systolic: number, diastolic: number): number {
  return systolic - diastolic;
}

/**
 * Assesses pulse pressure
 */
export function assessPulsePressure(pulsePressure: number): {
  category: 'low' | 'normal' | 'high';
  message: string;
} {
  if (pulsePressure < 40) {
    return {
      category: 'low',
      message: 'Low pulse pressure - may indicate heart failure or aortic stenosis. Consult healthcare provider.'
    };
  } else if (pulsePressure <= 60) {
    return {
      category: 'normal',
      message: 'Normal pulse pressure - indicates good arterial compliance.'
    };
  } else {
    return {
      category: 'high',
      message: 'High pulse pressure - may indicate arterial stiffness. More common in older adults. Consider consultation.'
    };
  }
}

/**
 * Assesses Mean Arterial Pressure
 */
export function assessMAP(map: number): {
  category: 'low' | 'normal' | 'high';
  message: string;
} {
  if (map < 70) {
    return {
      category: 'low',
      message: 'Low MAP - may indicate inadequate organ perfusion. Seek medical attention if symptomatic.'
    };
  } else if (map <= 100) {
    return {
      category: 'normal',
      message: 'Normal MAP - adequate organ perfusion maintained.'
    };
  } else {
    return {
      category: 'high',
      message: 'High MAP - indicates elevated overall cardiovascular load. Medical evaluation recommended.'
    };
  }
}

/**
 * Provides a comprehensive blood pressure analysis
 */
export function analyzeBloodPressure(systolic: number, diastolic: number): {
  category: BPCategory;
  riskAssessment: string;
  map: number;
  mapAssessment: ReturnType<typeof assessMAP>;
  pulsePressure: number;
  pulsePressureAssessment: ReturnType<typeof assessPulsePressure>;
  requiresUrgentCare: boolean;
  isEmergency: boolean;
} {
  const category = classifyBloodPressure(systolic, diastolic);
  const map = calculateMAP(systolic, diastolic);
  const pulsePressure = calculatePulsePressure(systolic, diastolic);

  return {
    category,
    riskAssessment: getRiskAssessment(category),
    map,
    mapAssessment: assessMAP(map),
    pulsePressure,
    pulsePressureAssessment: assessPulsePressure(pulsePressure),
    requiresUrgentCare: requiresUrgentCare(systolic, diastolic),
    isEmergency: isEmergency(systolic, diastolic)
  };
}

/**
 * Analyzes trends in blood pressure readings
 */
export function analyzeTrend(readings: BloodPressureReading[]): {
  averageCategory: BPCategory;
  trend: 'improving' | 'stable' | 'worsening' | 'insufficient-data';
  trendDescription: string;
  highRiskReadingsCount: number;
  emergencyReadingsCount: number;
} {
  if (readings.length === 0) {
    return {
      averageCategory: ESH_BP_CATEGORIES[0],
      trend: 'insufficient-data',
      trendDescription: 'No readings available for analysis',
      highRiskReadingsCount: 0,
      emergencyReadingsCount: 0
    };
  }

  // Calculate averages
  const avgSystolic = Math.round(
    readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length
  );
  const avgDiastolic = Math.round(
    readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length
  );

  const averageCategory = classifyBloodPressure(avgSystolic, avgDiastolic);

  // Count high-risk and emergency readings
  const highRiskReadingsCount = readings.filter(
    r => requiresUrgentCare(r.systolic, r.diastolic)
  ).length;

  const emergencyReadingsCount = readings.filter(
    r => isEmergency(r.systolic, r.diastolic)
  ).length;

  // Analyze trend (if we have at least 3 readings)
  if (readings.length < 3) {
    return {
      averageCategory,
      trend: 'insufficient-data',
      trendDescription: 'Need at least 3 readings for trend analysis',
      highRiskReadingsCount,
      emergencyReadingsCount
    };
  }

  // Sort readings by date
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Compare first third with last third
  const firstThird = sortedReadings.slice(0, Math.floor(readings.length / 3));
  const lastThird = sortedReadings.slice(-Math.floor(readings.length / 3));

  const firstAvgSystolic =
    firstThird.reduce((sum, r) => sum + r.systolic, 0) / firstThird.length;
  const lastAvgSystolic =
    lastThird.reduce((sum, r) => sum + r.systolic, 0) / lastThird.length;

  const firstAvgDiastolic =
    firstThird.reduce((sum, r) => sum + r.diastolic, 0) / firstThird.length;
  const lastAvgDiastolic =
    lastThird.reduce((sum, r) => sum + r.diastolic, 0) / lastThird.length;

  const systolicChange = lastAvgSystolic - firstAvgSystolic;
  const diastolicChange = lastAvgDiastolic - firstAvgDiastolic;

  // Determine trend
  let trend: 'improving' | 'stable' | 'worsening' = 'stable';
  let trendDescription = '';

  if (systolicChange <= -5 || diastolicChange <= -3) {
    trend = 'improving';
    trendDescription = `Blood pressure is improving (systolic ${systolicChange >= 0 ? '+' : ''}${systolicChange.toFixed(1)} mmHg, diastolic ${diastolicChange >= 0 ? '+' : ''}${diastolicChange.toFixed(1)} mmHg)`;
  } else if (systolicChange >= 5 || diastolicChange >= 3) {
    trend = 'worsening';
    trendDescription = `Blood pressure is increasing (systolic ${systolicChange >= 0 ? '+' : ''}${systolicChange.toFixed(1)} mmHg, diastolic ${diastolicChange >= 0 ? '+' : ''}${diastolicChange.toFixed(1)} mmHg)`;
  } else {
    trend = 'stable';
    trendDescription = `Blood pressure is stable (systolic ${systolicChange >= 0 ? '+' : ''}${systolicChange.toFixed(1)} mmHg, diastolic ${diastolicChange >= 0 ? '+' : ''}${diastolicChange.toFixed(1)} mmHg)`;
  }

  return {
    averageCategory,
    trend,
    trendDescription,
    highRiskReadingsCount,
    emergencyReadingsCount
  };
}

