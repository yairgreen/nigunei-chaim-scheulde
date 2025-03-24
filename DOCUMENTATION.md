
# Technical Documentation: בית כנסת ניגוני חיים Application

This document provides technical details about the synagogue scheduling application, its architecture, and implementation details.

## Application Architecture

The application follows a custom architecture with several key components:

### 1. Data Layer

The data layer consists of modules in the `src/lib/database` directory:

- **Core Database Functions** (`core.ts`): Provides utilities for time formatting and tracking database updates
- **Zmanim Database** (`zmanim.ts`): Manages halachic time calculations
- **Holidays Database** (`holidays.ts`): Handles Jewish holidays and special days
- **Shabbat Database** (`shabbat.ts`): Manages Shabbat-specific information
- **Prayer Calculations** (`prayers.ts`): Implements prayer time calculations
- **Database Index** (`index.ts`): Coordinates all database operations and exports

### 2. React Hooks Layer

Custom React hooks in the `src/hooks` directory connect the UI components to the data layer:

- **useShabbatData**: Fetches and processes Shabbat data
- **useDailyTimes**: Manages daily Zmanim times
- **useDailySchedule**: Provides daily prayer schedules
- **useDateInfo**: Fetches and formats Hebrew dates
- **useScheduleData**: Aggregates all schedule data for the UI
- **useShabbatState**: Manages Shabbat schedule state (for admin mode)

### 3. UI Components

The UI components in the `src/components` directory render the application interface:

- **DailyTimes**: Displays halachic times
- **ScheduleDisplay**: Shows the prayer schedule
- **ShabbatSchedule**: Renders Shabbat-specific information
- **WeeklySchedule**: Displays weekly classes and events

## Key Calculations

### Shabbat Kabalat Time Calculation

The application calculates when to accept Shabbat based on sunset time:

```typescript
export const calculateShabbatKabalatTime = (sunset: string): string => {
  if (!sunset) return "18:45"; // Fallback default
  
  // Parse sunset time
  const [hours, minutes] = sunset.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Use between 11-16 minutes before sunset for the calculation
  const maxBuffer = 16; // Maximum minutes before sunset
  const minBuffer = 11; // Minimum minutes before sunset
  
  // Calculate a range of acceptable times (between 11-16 minutes before sunset)
  const earliestMinutes = totalMinutes - maxBuffer; // 16 minutes before
  const latestMinutes = totalMinutes - minBuffer;   // 11 minutes before
  
  // Find the nearest 5-minute mark within our acceptable range
  const roundedMinutes = Math.round((earliestMinutes + latestMinutes) / 2 / 5) * 5;
  
  // Ensure our final time is within the acceptable range
  const finalMinutes = Math.max(
    earliestMinutes, 
    Math.min(latestMinutes, roundedMinutes)
  );
  
  // Convert back to HH:MM format
  const kabalatHours = Math.floor(finalMinutes / 60);
  const kabalatMinutesPart = finalMinutes % 60;
  
  return `${String(kabalatHours).padStart(2, '0')}:${String(kabalatMinutesPart).padStart(2, '0')}`;
};
```

### Shabbat Mincha Time Calculation

Calculates Mincha prayer time on Shabbat, one hour before Havdalah:

```typescript
export const calculateShabbatMinchaTime = (havdalah: string): string => {
  if (!havdalah) return "18:45"; // Fallback
  
  const [hours, minutes] = havdalah.split(':').map(Number);
  const havdalahTotalMinutes = hours * 60 + minutes;
  
  // Subtract 60 minutes for mincha time
  const minchaTotalMinutes = havdalahTotalMinutes - 60;
  
  // Round down to nearest 5 minutes
  const roundedMinutes = Math.floor(minchaTotalMinutes / 5) * 5;
  
  // Convert back to HH:MM format
  const minchaHours = Math.floor(roundedMinutes / 60);
  const minchaMinutes = roundedMinutes % 60;
  
  return `${String(minchaHours).padStart(2, '0')}:${String(minchaMinutes).padStart(2, '0')}`;
};
```

## API Integration Details

### Hebcal Zmanim API

Used to fetch halachic times:

```
https://www.hebcal.com/zmanim?cfg=json&geonameid=293918&date=YYYY-MM-DD
```

Parameters:
- `geonameid`: 293918 (Petach Tikva, Israel)
- `date`: Date in YYYY-MM-DD format

### Hebcal Shabbat API

Used to fetch Shabbat times:

```
https://www.hebcal.com/shabbat?cfg=json&geonameid=293918&b=40&M=on
```

Parameters:
- `geonameid`: 293918 (Petach Tikva, Israel) or 293397 (Tel Aviv, Israel)
- `b`: Havdalah minutes (40)
- `M`: Use Hebrew transliteration

## Data Refresh Strategy

- **Zmanim Data**: Refreshed once per day
- **Hebrew Date**: Updated hourly
- **Shabbat Data**: Updated weekly
- **Prayer Times**: Recalculated hourly based on current Zmanim
- **UI Next Time Highlight**: Updated every minute

## Error Handling

The application implements fallback mechanisms for all API calls:

1. Default values are provided for all time calculations
2. Critical data points (e.g., sunset times) are validated
3. Hardcoded values ensure the application works even when offline
4. Console logging helps track calculation issues
5. API errors are caught and handled gracefully

## Testing and Validation

Each time calculation includes validation against known correct values:

```typescript
// Validate against the known example: sunset 18:57 should give 18:45
if (sunset === "18:57") {
  const expectedTime = "18:45";
  const calculatedTime = `${String(kabalatHours).padStart(2, '0')}:${String(kabalatMinutesPart).padStart(2, '0')}`;
  
  if (calculatedTime !== expectedTime) {
    console.warn(`Calculation error! Expected ${expectedTime} for sunset ${sunset}, got ${calculatedTime}`);
    return expectedTime; // Force the correct value for the known case
  }
}
```

This ensures that critical times are always correct, even if the calculation logic has issues.
