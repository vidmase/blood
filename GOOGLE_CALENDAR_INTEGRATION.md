# Google Calendar Integration - User Guide

## 📅 Overview

The Blood Pressure Tracker now includes seamless integration with Google Calendar! Export your blood pressure readings as calendar events to view them alongside your daily schedule, set reminders, and track your health journey visually.

## ✨ Features

### 🎯 What Gets Exported

Each blood pressure reading becomes a calendar event with:
- **Summary**: `BP: 120/80 - ✅ Optimal` (or other status)
- **Date & Time**: Exact timestamp of when reading was taken
- **Duration**: 15-minute event block
- **Color Coding**: 
  - 🟢 Green = Optimal readings
  - 🔵 Blue = Normal readings
  - 🟡 Yellow = Elevated readings
  - 🟠 Orange = High readings
  - 🔴 Red = Critical readings
- **Description**: Detailed information including:
  - Systolic, Diastolic, Pulse values
  - Health status assessment
  - Personal notes (if added)
  - Timestamp

### 📊 Export Options

Choose which readings to export:

1. **All Readings**: Export your entire history
2. **Current Month**: Export only the month you're viewing
3. **Custom Range**: Select specific start and end dates

## 🚀 How to Use

### Step 1: Open the Calendar View
Navigate to the Calendar tab in your Blood Pressure Tracker app.

### Step 2: Click the Export Button
Look for the **Export** button in the calendar header (next to the "Today" button).

### Step 3: Select Date Range
Choose which readings you want to export:
- All readings (complete history)
- Current month only
- Custom date range

### Step 4: Download Calendar File
Click the **"Download Calendar File"** button. A `.ics` file will be downloaded to your device.

### Step 5: Import to Google Calendar

#### On Desktop:
1. Go to [Google Calendar](https://calendar.google.com)
2. Click the **⚙️ Settings** icon (top right)
3. Select **"Import & export"** from the left menu
4. Click **"Select file from your computer"**
5. Choose the downloaded `.ics` file
6. Select which calendar to import to
7. Click **"Import"**
8. Done! Your readings now appear in Google Calendar

#### On Mobile:
1. Open the downloaded `.ics` file from your downloads
2. Your device will prompt you to add it to a calendar app
3. Select **Google Calendar**
4. Confirm the import
5. Your readings are now in your calendar!

## 📱 Calendar Event Details

### Event Title Format
```
BP: [Systolic]/[Diastolic] - [Status Icon] [Status]
```
Examples:
- `BP: 118/76 - ✅ Optimal`
- `BP: 135/88 - 📈 Elevated`
- `BP: 145/95 - 🚨 Critical`

### Event Description
```
Blood Pressure Reading

📊 Measurements:
• Systolic: 120 mmHg
• Diastolic: 80 mmHg
• Pulse: 72 bpm

📈 Status: ✅ Optimal

📝 Notes: [Your notes here]

🕒 Recorded: [Date and Time]

--- Blood Pressure Tracker App ---
```

## 🎨 Color Coding in Google Calendar

Once imported, your readings will be color-coded:

| Status | Color | Google Calendar Color |
|--------|-------|----------------------|
| ✅ Optimal | Green | Basil (10) |
| 💙 Normal | Blue | Peacock (7) |
| 📈 Elevated | Yellow | Banana (5) |
| ⚡ High | Orange | Tangerine (6) |
| 🚨 Critical | Red | Tomato (11) |

## 💡 Use Cases

### 1. **Pattern Recognition**
View your BP readings alongside your daily activities to identify patterns:
- Do readings spike after stressful meetings?
- Are mornings better than evenings?
- Does exercise affect your readings?

### 2. **Doctor Appointments**
Share your Google Calendar with your doctor to provide comprehensive health data during appointments.

### 3. **Medication Reminders**
Add medication events alongside your BP readings to see if timing affects your numbers.

### 4. **Family Awareness**
Share your health calendar with family members so they can support your health journey.

### 5. **Long-term Tracking**
Keep a permanent record in Google Calendar that syncs across all your devices.

## 🔒 Privacy & Security

- **Local Processing**: All calendar file generation happens on your device
- **No Cloud Upload**: We don't upload your data to any server
- **Your Control**: You decide when and what to export
- **Secure Import**: Standard .ics format recognized by all calendar apps
- **Data Ownership**: Your readings remain your data

## 📝 File Format

The exported file uses the **iCalendar (.ics)** format:
- Industry-standard calendar format
- Compatible with Google Calendar, Apple Calendar, Outlook, etc.
- Human-readable and secure
- Can be backed up and archived

## 🛠️ Troubleshooting

### Import Didn't Work?
- Ensure you're using a `.ics` file
- Try opening the file directly instead of uploading
- Check that you selected a valid calendar to import to
- Verify the file isn't empty (0 readings selected)

### Events Not Showing?
- Check the correct calendar is selected in Google Calendar
- Verify the date range of imported events
- Refresh your calendar view
- Try importing to a different calendar

### Wrong Time Zone?
- Events use your device's time zone
- If times look wrong, check your device's time zone settings
- Re-export after correcting time zone

### Too Many Events?
- Use date range filtering to export specific periods
- Delete old imports before adding new ones
- Create separate calendars for different time periods

## 🎯 Best Practices

1. **Regular Exports**: Export monthly to keep calendar updated
2. **Separate Calendar**: Create a dedicated "Health" calendar for BP readings
3. **Set Reminders**: Add reminder alerts to imported events
4. **Color Customize**: Adjust event colors in Google Calendar if needed
5. **Backup Files**: Keep your `.ics` files as backup records

## 🔄 Re-exporting Data

- You can export the same readings multiple times
- Previous imports won't be duplicated automatically
- Consider deleting old imports before re-exporting
- Use date ranges to avoid overlapping imports

## 📞 Support

For issues or questions:
- Check this documentation first
- Review the in-app instructions
- Verify your Google Calendar settings
- Ensure you have the latest app version

## 🎉 Enjoy Your Integration!

Now you can visualize your blood pressure journey in the context of your daily life, making it easier to understand patterns and maintain optimal health!

---

*Blood Pressure Tracker - Track. Analyze. Improve.*

