# Blood Pressure Tracker - Color Palette Applied

## Your Custom Color Scheme

### Primary Colors
1. **#BF092F** (Crimson Red) - Critical states, danger alerts, high blood pressure
2. **#132440** (Navy) - Grade 1 HTN, backgrounds, dark elements
3. **#16476A** (Blue) - Primary brand color, High Normal BP, main buttons
4. **#3B9797** (Teal) - Optimal BP, success states, positive indicators

### Color Mapping

#### Blood Pressure Classifications
- **Optimal (0-119/0-79)**: #3B9797 (Teal)
- **Normal (120-129/80-84)**: #5BC0C0 (Light Teal)
- **High Normal (130-139/85-89)**: #16476A (Blue)
- **Grade 1 HTN (140-159/90-99)**: #132440 (Navy)
- **Grade 2 HTN (160-179/100-109)**: #BF092F (Crimson)
- **Grade 3 HTN (180-219/110-119)**: #A00726 (Dark Crimson)
- **Hypertensive Crisis (220+/120+)**: #8A051F (Darkest Crimson)
- **Isolated Systolic HTN**: #132440 (Navy)
- **Hypotension (0-89/0-59)**: #7DD3D3 (Very Light Teal)

#### UI Components
- **Primary Buttons**: `from-[#16476A] to-[#132440]`
- **Success Indicators**: `from-[#3B9797] to-[#5BC0C0]`
- **Analysis Buttons**: `from-[#3B9797] to-[#5BC0C0]`
- **Insights Buttons**: `from-[#132440] to-[#16476A]`
- **Error Messages**: `bg-[#BF092F] border-[#8A051F]`
- **Success Messages**: `bg-[#3B9797] border-[#2A7272]`

#### CSS Variables (index.html)
```css
/* Light Theme */
--c-bg: #f8f9fe
--c-surface: #ffffff
--c-primary: #16476A (Blue)
--c-primary-dark: #132440 (Navy)
--c-secondary: #3B9797 (Teal)
--c-text-primary: #132440
--c-text-secondary: #16476A
--c-success: #3B9797
--c-danger: #BF092F
--c-warning: #BF092F

/* Dark Theme */
--c-bg: #0a1420
--c-surface: #132440
--c-primary: #3B9797 (Teal)
--c-secondary: #16476A (Blue)
--c-danger: #BF092F
```

## Files Updated

### ✅ Core System
1. **index.html** - CSS variables, theme colors, animations
2. **constants.ts** - ESH BP categories with new color mappings
3. **src/animations.css** - Pulse glow animations
4. **App.tsx** - Main UI buttons, success/error messages, sidebars, statistics

### ⏳ Components (In Progress)
- Header.tsx
- FileUpload.tsx  
- ReadingsTable.tsx
- BloodPressureTrends.tsx
- And 25+ more component files

## Color Usage Examples

### Gradients
```css
/* Primary Action */
bg-gradient-to-r from-[#16476A] to-[#132440]

/* Success/Optimal */
bg-gradient-to-r from-[#3B9797] to-[#5BC0C0]

/* Analytics */
bg-gradient-to-r from-[#132440] to-[#16476A]

/* Critical/Warning */
bg-gradient-to-r from-[#BF092F] to-[#A00726]
```

### Chart Colors (BloodPressureTrends)
- **Systolic**: rgb(191, 9, 47) - Crimson for high pressure readings
- **Diastolic**: rgb(22, 71, 106) - Blue for secondary readings
- **Pulse**: rgb(59, 151, 151) - Teal for heart rate

## Design Philosophy
- **Crimson (#BF092F)**: Medical urgency, critical alerts
- **Navy (#132440)**: Professional, trustworthy foundation
- **Blue (#16476A)**: Primary actions, clinical precision
- **Teal (#3B9797)**: Health, wellness, optimal states

This palette creates a medical-grade appearance with clear visual hierarchy for different blood pressure states.

