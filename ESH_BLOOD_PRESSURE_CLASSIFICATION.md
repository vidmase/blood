# European Society of Hypertension Blood Pressure Classification

This document describes the ESH (European Society of Hypertension) blood pressure classification system implemented in this application, based on the 2023 ESH Guidelines.

## Overview

The application now includes a comprehensive blood pressure classification system based on European standards, providing:

- **9 distinct categories** of blood pressure classification
- **Risk assessment** for each category
- **Clinical recommendations** for each level
- **Advanced metrics** including MAP and Pulse Pressure
- **Trend analysis** capabilities

## Blood Pressure Categories

### 1. Optimal Blood Pressure
- **Range:** Systolic < 120 mmHg AND Diastolic < 80 mmHg
- **Risk Level:** Low
- **Color Code:** Green (#10b981)
- **Recommendation:** Maintain healthy lifestyle habits

### 2. Normal Blood Pressure
- **Range:** Systolic 120-129 mmHg OR Diastolic 80-84 mmHg
- **Risk Level:** Low
- **Color Code:** Lime (#84cc16)
- **Recommendation:** Continue monitoring and healthy habits

### 3. High Normal (Prehypertension)
- **Range:** Systolic 130-139 mmHg OR Diastolic 85-89 mmHg
- **Risk Level:** Moderate
- **Color Code:** Amber (#fbbf24)
- **Recommendation:** Lifestyle modifications recommended

### 4. Grade 1 Hypertension (Mild)
- **Range:** Systolic 140-159 mmHg OR Diastolic 90-99 mmHg
- **Risk Level:** High
- **Color Code:** Orange (#fb923c)
- **Recommendation:** Medical consultation advised; medication may be needed

### 5. Grade 2 Hypertension (Moderate)
- **Range:** Systolic 160-179 mmHg OR Diastolic 100-109 mmHg
- **Risk Level:** Very High
- **Color Code:** Red (#f87171)
- **Recommendation:** Medical treatment typically required

### 6. Grade 3 Hypertension (Severe)
- **Range:** Systolic 180-219 mmHg OR Diastolic 110-119 mmHg
- **Risk Level:** Critical
- **Color Code:** Dark Red (#dc2626)
- **Recommendation:** Urgent medical attention required

### 7. Hypertensive Crisis
- **Range:** Systolic ≥ 220 mmHg OR Diastolic ≥ 120 mmHg
- **Risk Level:** Critical
- **Color Code:** Darkest Red (#991b1b)
- **Recommendation:** EMERGENCY - Immediate medical care required

### 8. Isolated Systolic Hypertension (ISH)
- **Range:** Systolic ≥ 140 mmHg AND Diastolic < 90 mmHg
- **Risk Level:** High
- **Color Code:** Orange (#f97316)
- **Recommendation:** Common in older adults; requires treatment similar to general hypertension

### 9. Hypotension (Low Blood Pressure)
- **Range:** Systolic ≤ 89 mmHg AND Diastolic ≤ 59 mmHg
- **Risk Level:** Moderate
- **Color Code:** Blue (#60a5fa)
- **Recommendation:** Evaluation if symptomatic

## Key Differences from AHA Standards

The ESH classification differs from American Heart Association (AHA) standards in several ways:

| Aspect | ESH 2023 | AHA 2017 |
|--------|----------|----------|
| **Normal** | 120-129 / 80-84 | < 120 / < 80 |
| **Elevated** | Called "High Normal" (130-139 / 85-89) | 120-129 / < 80 |
| **Stage 1 HTN** | Grade 1: 140-159 / 90-99 | 130-139 / 80-89 |
| **Stage 2 HTN** | Grade 2: 160-179 / 100-109 | ≥ 140 / ≥ 90 |
| **Severe HTN** | Grade 3: 180-219 / 110-119 | Part of Stage 2 |
| **Categories** | 3 grades of hypertension | 2 stages of hypertension |

## Implementation

### Files Created

1. **`constants.ts`** - ESH classification constants and categories
   - `ESH_BP_CATEGORIES` - Complete array of all categories with detailed information
   - `ESH_BP_RANGES` - Quick reference ranges
   - `ESH_BP_COLORS` - Color coding for visualization

2. **`utils/bpClassification.ts`** - Classification utilities
   - `classifyBloodPressure()` - Classifies systolic/diastolic values
   - `classifyReading()` - Classifies a complete reading object
   - `analyzeBloodPressure()` - Comprehensive analysis including MAP and PP
   - `analyzeTrend()` - Trend analysis for multiple readings
   - Helper functions for risk assessment

3. **`components/ESHClassificationChart.tsx`** - Visual reference component
   - Interactive classification table
   - Current reading analysis
   - Detailed recommendations per category
   - Mobile-responsive design

### Usage Examples

#### Basic Classification

```typescript
import { classifyBloodPressure } from './utils/bpClassification';

const category = classifyBloodPressure(145, 92);
console.log(category.category); // "Grade 1 Hypertension (Mild)"
console.log(category.riskLevel); // "high"
console.log(category.color); // "#fb923c"
```

#### Comprehensive Analysis

```typescript
import { analyzeBloodPressure } from './utils/bpClassification';

const analysis = analyzeBloodPressure(145, 92);
console.log(analysis.category.category); // "Grade 1 Hypertension (Mild)"
console.log(analysis.map); // Mean Arterial Pressure
console.log(analysis.pulsePressure); // Pulse Pressure
console.log(analysis.requiresUrgentCare); // false
console.log(analysis.isEmergency); // false
```

#### Trend Analysis

```typescript
import { analyzeTrend } from './utils/bpClassification';

const trend = analyzeTrend(myReadings);
console.log(trend.trend); // "improving" | "stable" | "worsening"
console.log(trend.averageCategory);
console.log(trend.emergencyReadingsCount);
```

#### Using the Visual Component

```tsx
import { ESHClassificationChart } from './components/ESHClassificationChart';

// Show classification table only
<ESHClassificationChart />

// Show with current reading analysis
<ESHClassificationChart currentReading={latestReading} />

// Show with detailed recommendations
<ESHClassificationChart 
  currentReading={latestReading} 
  showDetailed={true} 
/>
```

## Additional Metrics

### Mean Arterial Pressure (MAP)

MAP = DBP + ⅓(SBP - DBP)

- **Normal Range:** 70-100 mmHg
- **Significance:** Represents average pressure during one cardiac cycle
- **Clinical Use:** Important for assessing organ perfusion

### Pulse Pressure (PP)

PP = SBP - DBP

- **Normal Range:** 40-60 mmHg
- **Low PP (< 40):** May indicate heart failure or aortic stenosis
- **High PP (> 60):** May indicate arterial stiffness (common in elderly)
- **Clinical Use:** Indicator of arterial compliance and cardiovascular risk

## Classification Logic

The classification follows a priority system:

1. **Hypertensive Crisis** (≥220/120) - Highest priority
2. **Hypotension** (≤89/59)
3. **Isolated Systolic Hypertension** (≥140 AND <90)
4. **Grade 3 Hypertension** (≥180/110)
5. **Grade 2 Hypertension** (≥160/100)
6. **Grade 1 Hypertension** (≥140/90)
7. **High Normal** (≥130/85)
8. **Normal** (≥120/80)
9. **Optimal** (< 120/80)

When systolic and diastolic fall into different categories, the **higher risk category** is selected.

## Integration Points

This classification system can be integrated into:

1. **Blood Pressure Gauges** - Update `BloodPressureGauge.tsx` to use ESH zones
2. **Analysis Dashboard** - Show ESH category alongside readings
3. **Reports** - Include ESH classification in exported reports
4. **Trends** - Use ESH categories for historical trend analysis
5. **Alerts** - Trigger notifications based on ESH risk levels
6. **Goals** - Set targets aligned with ESH optimal/normal ranges

## Clinical References

### Primary Reference
**2023 ESH Guidelines for the management of arterial hypertension**
- European Heart Journal (2023) 44, 3824-3877
- DOI: 10.1093/eurheartj/ehad192
- URL: https://academic.oup.com/eurheartj/article/44/38/3824/7246265

### Key Recommendations

1. **Measurement Standards:**
   - Rest for 5 minutes before measurement
   - Seated position with back supported
   - Arm at heart level
   - Multiple readings (2-3) averaged

2. **Diagnosis:**
   - Confirm with home BP monitoring or 24-hour ambulatory monitoring
   - Office BP: ≥140/90 mmHg
   - Home BP: ≥135/85 mmHg
   - Ambulatory BP: ≥130/80 mmHg

3. **Treatment Thresholds:**
   - Grade 1 HTN: Consider treatment based on cardiovascular risk
   - Grade 2+ HTN: Immediate pharmacological treatment recommended
   - Target: Usually < 130/80 mmHg for most patients

4. **Age Considerations:**
   - Different targets for elderly (≥65 years)
   - Isolated systolic hypertension more common in older adults
   - More gradual BP reduction in elderly patients

## Important Notes

⚠️ **Medical Disclaimer:**
- This classification is for informational and tracking purposes only
- Not a substitute for professional medical advice
- Always consult healthcare providers for diagnosis and treatment
- Emergency situations require immediate medical attention

🔒 **Data Privacy:**
- All blood pressure data is stored locally
- User maintains complete control of their health data
- ESH classification computed client-side

📱 **Accessibility:**
- Color coding supplemented with text labels
- Mobile-responsive design
- Screen reader compatible

## Future Enhancements

Potential improvements to consider:

1. **Personalized Thresholds** - Age-based recommendations
2. **Risk Calculators** - Cardiovascular risk scoring
3. **Treatment Tracking** - Medication effectiveness monitoring
4. **Multi-language Support** - ESH guidelines in various languages
5. **Export Options** - PDF reports with ESH classification
6. **Historical Comparison** - Category progression over time
7. **Clinical Alerts** - Automated notifications for high-risk readings
8. **Healthcare Integration** - Share data with providers

## Support & Resources

For questions or issues related to the ESH classification implementation:

1. Review this documentation
2. Check the inline code comments
3. Refer to the ESH 2023 Guidelines
4. Consult with healthcare professionals for medical questions

---

**Last Updated:** October 2025
**Version:** 1.0
**Based on:** ESH Guidelines 2023

