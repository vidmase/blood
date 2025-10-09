# ESH Blood Pressure Classification - Quick Reference

## 📊 Classification Table

| Category | Systolic (mmHg) | Diastolic (mmHg) | Risk | Color |
|----------|----------------|------------------|------|-------|
| **Optimal** | < 120 | AND < 80 | Low | 🟢 Green |
| **Normal** | 120-129 | OR 80-84 | Low | 🟢 Lime |
| **High Normal** | 130-139 | OR 85-89 | Moderate | 🟡 Amber |
| **Grade 1 HTN** | 140-159 | OR 90-99 | High | 🟠 Orange |
| **Grade 2 HTN** | 160-179 | OR 100-109 | Very High | 🔴 Red |
| **Grade 3 HTN** | 180-219 | OR 110-119 | Critical | 🔴 Dark Red |
| **Hypertensive Crisis** | ≥ 220 | OR ≥ 120 | Critical | 🔴 Darkest Red |
| **ISH** | ≥ 140 | AND < 90 | High | 🟠 Orange |
| **Hypotension** | ≤ 89 | AND ≤ 59 | Moderate | 🔵 Blue |

## 🚨 Action Required

| Blood Pressure | Action |
|---------------|--------|
| **≥ 220/120** | 🚨 **EMERGENCY** - Call 911 immediately |
| **180-219 / 110-119** | ⚠️ **URGENT** - Seek medical care today |
| **160-179 / 100-109** | 📞 Schedule doctor appointment soon |
| **140-159 / 90-99** | 📋 Consult healthcare provider |
| **130-139 / 85-89** | 🥗 Lifestyle modifications |
| **120-129 / 80-84** | ✅ Maintain healthy habits |
| **< 120 / < 80** | ✅ Optimal - keep it up! |

## 📏 Additional Metrics

### Mean Arterial Pressure (MAP)
```
MAP = DBP + ⅓(SBP - DBP)
```
- **Normal:** 70-100 mmHg
- **Low (< 70):** Possible inadequate organ perfusion
- **High (> 100):** Elevated cardiovascular load

### Pulse Pressure (PP)
```
PP = SBP - DBP
```
- **Normal:** 40-60 mmHg
- **Low (< 40):** May indicate heart issues
- **High (> 60):** May indicate arterial stiffness

## 💊 Lifestyle Modifications

### For High Normal & Above:
- ✅ Reduce sodium to < 5g/day
- ✅ Exercise 150 min/week
- ✅ Maintain healthy weight (BMI 18.5-24.9)
- ✅ Limit alcohol
- ✅ Stop smoking
- ✅ Manage stress
- ✅ Adequate sleep (7-8 hours)
- ✅ DASH diet (fruits, vegetables, whole grains)

## 📱 Quick Import Examples

### Classify a Reading
```typescript
import { classifyBloodPressure } from './utils/bpClassification';

const category = classifyBloodPressure(145, 92);
// Returns: Grade 1 Hypertension (Mild)
```

### Full Analysis
```typescript
import { analyzeBloodPressure } from './utils/bpClassification';

const analysis = analyzeBloodPressure(145, 92);
// Returns: { category, map, pulsePressure, requiresUrgentCare, ... }
```

### Trend Analysis
```typescript
import { analyzeTrend } from './utils/bpClassification';

const trend = analyzeTrend(myReadings);
// Returns: { trend: 'improving' | 'stable' | 'worsening', ... }
```

### Show Classification Chart
```tsx
import { ESHClassificationChart } from './components/ESHClassificationChart';

<ESHClassificationChart currentReading={reading} showDetailed={true} />
```

## 🎯 Treatment Targets (ESH 2023)

| Patient Group | Target BP |
|--------------|-----------|
| **General adult** | < 130/80 mmHg |
| **Age 65-79** | < 140/80 mmHg |
| **Age ≥ 80** | < 140/80 mmHg |
| **Diabetes** | < 130/80 mmHg |
| **CKD** | < 130/80 mmHg |
| **Post-stroke** | < 130/80 mmHg |

## 📝 Measurement Best Practices

1. **Before Measurement:**
   - Rest 5 minutes
   - Empty bladder
   - No caffeine/smoking 30 min before
   - No talking during measurement

2. **During Measurement:**
   - Seated position, back supported
   - Arm at heart level
   - Feet flat on floor
   - Use proper cuff size

3. **Frequency:**
   - Take 2-3 readings, 1-2 min apart
   - Average the readings
   - Morning and evening readings preferred
   - Same time each day

## 🏥 When to Seek Medical Help

### IMMEDIATE (Call Emergency Services):
- BP ≥ 220/120 mmHg
- Severe headache
- Chest pain
- Shortness of breath
- Vision changes
- Difficulty speaking
- Weakness/numbness

### URGENT (Contact Doctor Today):
- BP 180-219 / 110-119 mmHg
- Persistent elevated readings
- Symptomatic hypotension

### ROUTINE (Schedule Appointment):
- BP 140-179 / 90-109 mmHg
- Trending upward
- Medication adjustments needed

## 🔗 Key Resources

- **ESH Guidelines 2023:** https://academic.oup.com/eurheartj/article/44/38/3824/7246265
- **Classification Component:** `components/ESHClassificationChart.tsx`
- **Utilities:** `utils/bpClassification.ts`
- **Constants:** `constants.ts`
- **Full Documentation:** `ESH_BLOOD_PRESSURE_CLASSIFICATION.md`
- **Integration Examples:** `ESH_INTEGRATION_EXAMPLE.tsx`

## ⚖️ ESH vs AHA Comparison

| Category | ESH | AHA |
|----------|-----|-----|
| **Normal** | 120-129/80-84 | <120/<80 |
| **Elevated** | 130-139/85-89 (High Normal) | 120-129/<80 |
| **Stage 1** | 140-159/90-99 (Grade 1) | 130-139/80-89 |
| **Stage 2** | 160-179/100-109 (Grade 2) | ≥140/≥90 |
| **Severe** | 180-219/110-119 (Grade 3) | Part of Stage 2 |
| **Crisis** | ≥220/≥120 | ≥180/≥120 |

## 🎨 Color Coding

Use these hex colors for consistency:

```typescript
OPTIMAL:             '#10b981' // Green
NORMAL:              '#84cc16' // Lime
HIGH_NORMAL:         '#fbbf24' // Amber
GRADE_1_HTN:         '#fb923c' // Orange
GRADE_2_HTN:         '#f87171' // Light Red
GRADE_3_HTN:         '#dc2626' // Red
HYPERTENSIVE_CRISIS: '#991b1b' // Dark Red
ISH:                 '#f97316' // Orange
HYPOTENSION:         '#60a5fa' // Blue
```

## ⚠️ Disclaimer

This classification system is for **informational and tracking purposes only**. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.

---

**Version:** 1.0 | **Last Updated:** October 2025 | **Standard:** ESH 2023

