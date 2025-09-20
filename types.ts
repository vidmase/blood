
export interface BloodPressureReading {
  id: number;
  date: string;
  systolic: number;
  diastolic: number;
  pulse: number;
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

export interface AppSettings {
  theme: 'light' | 'dark';
  goals: {
    systolic: number;
    diastolic: number;
  };
}