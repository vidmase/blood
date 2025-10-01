# Blood Pressure Assessment Update

## Summary
Updated the blood pressure assessment system in the ReadingsTable component to align with **American Heart Association (AHA)** and **European Society of Hypertension (ESH)** guidelines based on comprehensive medical research.

## Updated Classification System

### 1. **Hypertensive Crisis (Critical)** 🚨
- **Range:** Systolic ≥180 OR Diastolic ≥120 mmHg
- **Logic:** AND/OR (either condition triggers crisis)
- **Color:** Dark Red (`text-red-900`, `bg-red-100`)
- **Description:** Medical emergency - Immediate medical attention required
- **Action:** Call 911 immediately
- **Special Feature:** Shows animated warning "⚠️ Emergency"

### 2. **Stage 2 Hypertension**
- **Range:** Systolic 140-179 OR Diastolic 90-109 mmHg
- **Logic:** OR (either condition qualifies)
- **Color:** Red (`text-red-700`, `bg-red-50`)
- **Description:** Medication + lifestyle changes required
- **Risk Level:** High cardiovascular risk
- **Medical Note:** Significantly increased risk of heart attack and stroke

### 3. **Stage 1 Hypertension**
- **Range:** Systolic 130-139 OR Diastolic 80-89 mmHg
- **Logic:** OR (either condition qualifies)
- **Color:** Orange (`text-orange-700`, `bg-orange-50`)
- **Description:** Lifestyle changes + possible medication
- **Risk Level:** Increased cardiovascular risk
- **Medical Note:** Based on 2017 AHA guidelines (lowered from 140/90)

### 4. **Elevated Blood Pressure (High-Normal)**
- **Range:** Systolic 120-129 AND Diastolic <80 mmHg
- **Logic:** AND (both conditions must be met)
- **Color:** Amber (`text-amber-700`, `bg-amber-50`)
- **Description:** Lifestyle modifications recommended
- **Risk Level:** Risk of developing hypertension
- **Medical Note:** Previously called "prehypertension"

### 5. **Normal Blood Pressure** ✅
- **Range:** Systolic <120 AND Diastolic <80 mmHg
- **Logic:** AND (both conditions must be met)
- **Color:** Emerald Green (`text-emerald-700`, `bg-emerald-50`)
- **Description:** Optimal cardiovascular health - Maintain healthy lifestyle
- **Risk Level:** Lowest risk of cardiovascular disease
- **Medical Note:** Target range for most adults

### 6. **Low Blood Pressure (Hypotension)**
- **Range:** Systolic <90 OR Diastolic <60 mmHg
- **Logic:** OR (either condition qualifies)
- **Color:** Blue (`text-blue-700`, `bg-blue-50`)
- **Description:** Investigate underlying causes if symptomatic
- **Medical Note:** May cause dizziness, fainting, or fatigue if severe

## Key Changes from Previous System

### Before:
- Simple 5-level categorization (Critical, High, Elevated, Normal, Optimal)
- Thresholds not aligned with medical guidelines
- No distinction between Stage 1 and Stage 2 hypertension
- No special handling for hypertensive crisis

### After:
- 6-level categorization matching AHA/ESH standards
- Precise medical thresholds:
  - Crisis: 180/120+
  - Stage 2: 140/90+
  - Stage 1: 130/80+
  - Elevated: 120-129/<80
  - Normal: <120/<80
  - Low: <90/<60
- Emergency warning for hypertensive crisis
- Detailed descriptions for each category

## Visual Improvements

### Desktop Table View
- Assessment badge shows full category name
- Hover tooltip displays medical description
- Color-coded left border on row hover
- Emergency warning for crisis readings

### Mobile Card View
- Prominent status badge at top
- Color-coded background gradient
- Status bar indicator at card top
- Emergency alert displayed separately

## Medical Accuracy

All classifications are based on:
- **American Heart Association (AHA)** 2017 Guidelines
- **European Society of Hypertension (ESH)** 2023 Guidelines
- Clinical research from peer-reviewed sources
- Blood Pressure UK standards
- Mayo Clinic classifications

## Reference Ranges Quick Guide

| Category | Systolic | Diastolic | Logic | Action |
|----------|----------|-----------|-------|--------|
| 🚨 **Hypertensive Crisis** | ≥180 | ≥120 | OR | Call 911 immediately |
| 🔴 **Stage 2 Hypertension** | 140-179 | 90-109 | OR | Medication + lifestyle changes |
| 🟠 **Stage 1 Hypertension** | 130-139 | 80-89 | OR | Lifestyle changes + possible medication |
| 🟡 **Elevated** | 120-129 | <80 | AND | Lifestyle modifications |
| 🟢 **Normal** | <120 | <80 | AND | Maintain healthy lifestyle |
| 🔵 **Low** | <90 | <60 | OR | Investigate if symptomatic |

## Usage in Code

The assessment function takes both systolic and diastolic values:

```typescript
const assessment = getBloodPressureAssessment(systolic, diastolic);
// Returns:
// - category: Display name
// - level: Internal level key
// - color: Text color class
// - bgColor: Background color class
// - description: Medical description
```

## Benefits

1. **Medical Accuracy**: Aligns with latest clinical guidelines
2. **User Safety**: Clear emergency warnings for critical readings
3. **Educational**: Descriptive tooltips explain each category
4. **Visual Clarity**: Color-coded system for quick assessment
5. **Comprehensive**: Handles all possible BP ranges including hypotension

## Testing Recommendations

### Critical Boundary Tests:
| Reading | Expected Result | Reason |
|---------|----------------|---------|
| 185/125 | 🚨 Hypertensive Crisis | Both values meet crisis criteria |
| 180/119 | 🔴 Stage 2 Hypertension | Systolic at crisis boundary, diastolic just below |
| 160/125 | 🚨 Hypertensive Crisis | Diastolic ≥120 triggers crisis |
| 175/105 | 🔴 Stage 2 Hypertension | Both in Stage 2 range |
| 140/85 | 🔴 Stage 2 Hypertension | Systolic meets Stage 2 |
| 135/90 | 🔴 Stage 2 Hypertension | Diastolic meets Stage 2 |
| 139/89 | 🟠 Stage 1 Hypertension | Both in Stage 1 range |
| 130/75 | 🟠 Stage 1 Hypertension | Systolic meets Stage 1 |
| 125/80 | 🟠 Stage 1 Hypertension | Diastolic meets Stage 1 |
| 120/80 | 🟠 Stage 1 Hypertension | Diastolic = 80 triggers Stage 1 |
| 125/75 | 🟡 Elevated | Systolic 120-129 AND diastolic <80 |
| 120/79 | 🟡 Elevated | Systolic 120-129 AND diastolic <80 |
| 119/79 | 🟢 Normal | Both <120 AND <80 |
| 115/75 | 🟢 Normal | Both <120 AND <80 |
| 85/55 | 🔵 Low | Both meet low criteria |
| 95/58 | 🔵 Low | Diastolic <60 triggers low |

## Sources

Based on comprehensive research from:
- American Heart Association
- European Society of Hypertension
- Blood Pressure UK
- Mayo Clinic
- Cleveland Clinic
- National Heart, Lung, and Blood Institute (NHLBI)

