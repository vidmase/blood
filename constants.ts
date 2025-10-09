// This file can be used for application-wide constants.

/**
 * European Society of Hypertension (ESH) Blood Pressure Classification
 * Based on 2023 ESH Guidelines
 * 
 * Reference: European Heart Journal (2023)
 * https://academic.oup.com/eurheartj/article/44/38/3824/7246265
 */

export interface BPCategory {
  category: string;
  categoryShort: string;
  systolicMin: number;
  systolicMax: number;
  diastolicMin: number;
  diastolicMax: number;
  color: string;
  description: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high' | 'critical';
  recommendations: string[];
}

export const ESH_BP_CATEGORIES: BPCategory[] = [
  {
    category: 'Optimal',
    categoryShort: 'Optimal',
    systolicMin: 0,
    systolicMax: 119,
    diastolicMin: 0,
    diastolicMax: 79,
    color: '#10b981', // green-500
    description: 'Blood pressure is in the optimal range',
    riskLevel: 'low',
    recommendations: [
      'Maintain a healthy lifestyle',
      'Regular physical activity',
      'Balanced diet rich in fruits and vegetables',
      'Monitor blood pressure periodically'
    ]
  },
  {
    category: 'Normal',
    categoryShort: 'Normal',
    systolicMin: 120,
    systolicMax: 129,
    diastolicMin: 80,
    diastolicMax: 84,
    color: '#84cc16', // lime-500
    description: 'Blood pressure is normal',
    riskLevel: 'low',
    recommendations: [
      'Maintain healthy lifestyle habits',
      'Continue regular physical activity',
      'Keep monitoring your blood pressure',
      'Avoid excessive salt intake'
    ]
  },
  {
    category: 'High Normal',
    categoryShort: 'High-Normal',
    systolicMin: 130,
    systolicMax: 139,
    diastolicMin: 85,
    diastolicMax: 89,
    color: '#fbbf24', // amber-400
    description: 'Blood pressure is high-normal (prehypertension)',
    riskLevel: 'moderate',
    recommendations: [
      'Adopt lifestyle modifications',
      'Reduce sodium intake (<5g/day)',
      'Increase physical activity (150 min/week)',
      'Maintain healthy body weight',
      'Monitor blood pressure regularly',
      'Consider consultation with healthcare provider'
    ]
  },
  {
    category: 'Grade 1 Hypertension (Mild)',
    categoryShort: 'Grade 1 HTN',
    systolicMin: 140,
    systolicMax: 159,
    diastolicMin: 90,
    diastolicMax: 99,
    color: '#fb923c', // orange-400
    description: 'Mild hypertension - medical consultation recommended',
    riskLevel: 'high',
    recommendations: [
      'Consult healthcare provider',
      'Lifestyle modifications are essential',
      'Medication may be considered based on cardiovascular risk',
      'Reduce sodium intake (<5g/day)',
      'Regular aerobic exercise',
      'Weight management',
      'Limit alcohol consumption',
      'Monitor blood pressure at home'
    ]
  },
  {
    category: 'Grade 2 Hypertension (Moderate)',
    categoryShort: 'Grade 2 HTN',
    systolicMin: 160,
    systolicMax: 179,
    diastolicMin: 100,
    diastolicMax: 109,
    color: '#f87171', // red-400
    description: 'Moderate hypertension - medical treatment recommended',
    riskLevel: 'very-high',
    recommendations: [
      'Seek medical consultation promptly',
      'Antihypertensive medication typically required',
      'Intensive lifestyle modifications',
      'Regular blood pressure monitoring',
      'Assess for target organ damage',
      'Consider combination therapy',
      'Regular follow-up with healthcare provider'
    ]
  },
  {
    category: 'Grade 3 Hypertension (Severe)',
    categoryShort: 'Grade 3 HTN',
    systolicMin: 180,
    systolicMax: 219,
    diastolicMin: 110,
    diastolicMax: 119,
    color: '#dc2626', // red-600
    description: 'Severe hypertension - urgent medical attention required',
    riskLevel: 'critical',
    recommendations: [
      'Seek urgent medical attention',
      'Immediate antihypertensive treatment needed',
      'Close monitoring required',
      'Assess for hypertensive emergencies',
      'Screen for secondary causes',
      'Evaluate target organ damage',
      'Combination drug therapy typically required'
    ]
  },
  {
    category: 'Hypertensive Crisis',
    categoryShort: 'Crisis',
    systolicMin: 220,
    systolicMax: 300,
    diastolicMin: 120,
    diastolicMax: 200,
    color: '#991b1b', // red-800
    description: 'Hypertensive crisis - emergency medical care required',
    riskLevel: 'critical',
    recommendations: [
      'SEEK EMERGENCY MEDICAL CARE IMMEDIATELY',
      'Call emergency services',
      'Do not wait - this is a medical emergency',
      'May indicate hypertensive emergency with organ damage',
      'Immediate hospitalization may be required'
    ]
  },
  {
    category: 'Isolated Systolic Hypertension',
    categoryShort: 'ISH',
    systolicMin: 140,
    systolicMax: 300,
    diastolicMin: 0,
    diastolicMax: 89,
    color: '#f97316', // orange-500
    description: 'Isolated systolic hypertension - common in older adults',
    riskLevel: 'high',
    recommendations: [
      'Common in older adults (>60 years)',
      'Consult healthcare provider',
      'Treatment recommendations similar to general hypertension',
      'Lifestyle modifications',
      'Antihypertensive medication may be needed',
      'Regular monitoring essential'
    ]
  },
  {
    category: 'Hypotension (Low)',
    categoryShort: 'Low',
    systolicMin: 0,
    systolicMax: 89,
    diastolicMin: 0,
    diastolicMax: 59,
    color: '#60a5fa', // blue-400
    description: 'Low blood pressure - may require evaluation',
    riskLevel: 'moderate',
    recommendations: [
      'Consult healthcare provider if symptomatic',
      'Stay well hydrated',
      'Avoid sudden position changes',
      'May need evaluation for underlying causes',
      'Generally not concerning if asymptomatic'
    ]
  }
];

/**
 * ESH Blood Pressure Ranges for Quick Reference
 */
export const ESH_BP_RANGES = {
  OPTIMAL: { systolic: [0, 119], diastolic: [0, 79] },
  NORMAL: { systolic: [120, 129], diastolic: [80, 84] },
  HIGH_NORMAL: { systolic: [130, 139], diastolic: [85, 89] },
  GRADE_1_HTN: { systolic: [140, 159], diastolic: [90, 99] },
  GRADE_2_HTN: { systolic: [160, 179], diastolic: [100, 109] },
  GRADE_3_HTN: { systolic: [180, 219], diastolic: [110, 119] },
  HYPERTENSIVE_CRISIS: { systolic: [220, 300], diastolic: [120, 200] },
  ISOLATED_SYSTOLIC_HTN: { systolic: [140, 300], diastolic: [0, 89] },
  HYPOTENSION: { systolic: [0, 89], diastolic: [0, 59] }
} as const;

/**
 * Color coding for blood pressure visualization
 */
export const ESH_BP_COLORS = {
  OPTIMAL: '#10b981',
  NORMAL: '#84cc16',
  HIGH_NORMAL: '#fbbf24',
  GRADE_1_HTN: '#fb923c',
  GRADE_2_HTN: '#f87171',
  GRADE_3_HTN: '#dc2626',
  HYPERTENSIVE_CRISIS: '#991b1b',
  ISOLATED_SYSTOLIC_HTN: '#f97316',
  HYPOTENSION: '#60a5fa'
} as const;
