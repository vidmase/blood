# Blood Pressure Assessment Update

## Summary
Updated the blood pressure assessment system in the ReadingsTable component to align with **American Heart Association (AHA)** and **European Society of Hypertension (ESH)** guidelines based on comprehensive medical research.

## Updated Classification System

### 1. **Hypertensive Crisis** 🚨
- **Range:** Systolic ≥180 OR Diastolic ≥120 mmHg
- **Color:** Dark Red (`from-red-700 to-red-800`)
- **Description:** Emergency - Seek immediate medical attention
- **Special Feature:** Shows animated warning "⚠️ Emergency"

### 2. **Stage 2 Hypertension**
- **Range:** Systolic ≥140 OR Diastolic ≥90 mmHg
- **Color:** Red (`from-red-500 to-red-600`)
- **Description:** Requires medication and lifestyle changes
- **Medical Note:** Significantly increased cardiovascular risk

### 3. **Stage 1 Hypertension**
- **Range:** Systolic 130-139 OR Diastolic 80-89 mmHg
- **Color:** Orange (`from-orange-500 to-orange-600`)
- **Description:** Lifestyle changes recommended, may need medication
- **Medical Note:** Based on 2017 AHA guidelines (lowered from 140/90)

### 4. **Elevated Blood Pressure**
- **Range:** Systolic 120-129 AND Diastolic <80 mmHg
- **Color:** Amber (`from-amber-500 to-amber-600`)
- **Description:** Lifestyle modifications recommended
- **Medical Note:** Previously called "prehypertension"

### 5. **Normal Blood Pressure** ✅
- **Range:** Systolic <120 AND Diastolic <80 mmHg
- **Color:** Emerald Green (`from-emerald-500 to-emerald-600`)
- **Description:** Optimal blood pressure range
- **Medical Note:** Lowest risk of cardiovascular disease

### 6. **Low Blood Pressure (Hypotension)**
- **Range:** Systolic <90 OR Diastolic <60 mmHg
- **Color:** Blue (`from-blue-500 to-blue-600`)
- **Description:** Monitor for symptoms
- **Medical Note:** Only problematic if symptoms are present

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

```
Crisis:       ≥180/120 mmHg  🔴 Emergency
Stage 2:      ≥140/90 mmHg   🔴 High Risk
Stage 1:      130-139/80-89  🟠 Moderate Risk
Elevated:     120-129/<80    🟡 Low Risk
Normal:       <120/<80       🟢 Optimal
Low:          <90/<60        🔵 Monitor
```

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

Test with these sample readings:
- **Crisis:** 185/125 → "Hypertensive Crisis"
- **Stage 2:** 145/95 → "Stage 2 Hypertension"
- **Stage 1:** 133/83 → "Stage 1 Hypertension"
- **Elevated:** 125/75 → "Elevated"
- **Normal:** 115/75 → "Normal"
- **Low:** 85/55 → "Low"

## Sources

Based on comprehensive research from:
- American Heart Association
- European Society of Hypertension
- Blood Pressure UK
- Mayo Clinic
- Cleveland Clinic
- National Heart, Lung, and Blood Institute (NHLBI)

