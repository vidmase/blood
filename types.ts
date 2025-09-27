
export interface BloodPressureReading {
  id: number | string; // Support both number (legacy) and string (UUID from database)
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  notes?: string;
}

export interface TrendComparison {
  change: number;
  direction: 'up' | 'down' | 'same';
  summary: string;
}

export interface AnalysisData {
  keyMetrics: {
    avgSystolic: number;
    avgDiastolic: number;
    avgPulse: number;
  };
  overallTrend: {
    trend: 'Stable' | 'Increasing' | 'Decreasing' | 'Fluctuating';
    summary: string;
  };
  historicalComparison: {
    systolic: TrendComparison;
    diastolic: TrendComparison;
    pulse: TrendComparison;
    period: string;
  } | null;
  observations: {
    type: 'High Systolic' | 'Low Systolic' | 'High Diastolic' | 'Low Diastolic' | 'Pulse Rate' | 'General' | 'Goal Achievement';
    message: string;
  }[];
  encouragement: string;
}

export interface HealthInsight {
    category: 'Diet' | 'Exercise' | 'Stress Management' | 'General';
    tip: string;
}

export interface UserProfile {
  name: string;
  dob: string; // ISO date string YYYY-MM-DD
}

export interface UserTargets {
  systolic: number;
  diastolic: number;
  pulse: number;
}

// Age-based normative targets for a given age group
// This type is used by assessment utilities that calculate recommendations per age.
export interface AgeBasedNorms {
  systolic: number;
  diastolic: number;
  // Optional label like "41-45" used by assessment utilities for display/logic
  ageRange?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  goals: {
    systolic: number;
    diastolic: number;
  };
  // Whether to show age-based assessment labels alongside medical standard categories
  // Optional to avoid breaking existing persisted settings
  useAgeBasedAssessment?: boolean;
}