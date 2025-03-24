
# בית כנסת ניגוני חיים - Synagogue Schedule Application

![Logo](./public/lovable-uploads/26e23c71-0047-488c-9c4e-a3d0cf2ac0e6.png)

## Overview

This web application displays the schedule and prayer times for "Nigunei Chaim" synagogue. The application provides real-time information about daily prayer times, Shabbat schedules, and upcoming religious classes and events.

## Features

- **Live Prayer Times**: Displays the daily Zmanim (Jewish prayer times) with current time highlighted
- **Daily Prayer Schedule**: Shows the schedule for daily prayers (Shacharit, Mincha, Arvit)
- **Shabbat Schedule**: Displays candle lighting times, Havdalah time, and Shabbat prayer schedule
- **Weekly Classes**: Lists Torah classes and learning sessions throughout the week
- **Hebrew Date**: Shows the current Hebrew date alongside the Gregorian date
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technical Details

The application is built using:

- React with TypeScript for the frontend
- Vite as the build tool
- Tailwind CSS for styling
- Shadcn UI component library
- Date manipulation with date-fns
- Real-time data fetching from Hebrew calendar APIs (hebcal.com)

## API Integration

The application integrates with the following external APIs:

- **Hebcal API**: For Hebrew dates, Zmanim, holidays, and Shabbat times
  - Zmanim API: `https://www.hebcal.com/zmanim`
  - Hebrew Calendar API: `https://www.hebcal.com/hebcal`
  - Shabbat Times API: `https://www.hebcal.com/shabbat`

## Data Architecture

The application uses a simple in-memory data structure with the following modules:

- **Zmanim Database**: Handles sunrise, sunset, and other halachic time calculations
- **Holidays Database**: Manages Jewish holidays and special days
- **Shabbat Database**: Handles Shabbat-specific times and information
- **Prayer Times Calculator**: Calculates prayer times based on halachic rules

## Prayer Time Calculations

The application implements several halachic time calculations:

- **Shabbat Mincha Time**: One hour before Havdalah, rounded down to nearest 5 minutes
- **Shabbat Kabalat Time**: Between 11-16 minutes before sunset, rounded to nearest 5 minutes
- **Weekly Mincha Time**: Based on earliest sunset of the week with buffer
- **Weekly Arvit Time**: Based on latest sunset of the week plus 18 minutes

## Project Structure

```
src/
├── components/       # UI components
├── hooks/            # React hooks for data management
├── lib/              # Core logic and utility functions
│   └── database/     # Data management modules
└── pages/            # Application pages
```

## Development

To work on this project locally, follow these steps:

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd <project-directory>

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Deployment

The application can be deployed using the built-in deployment feature via the Lovable platform. You can also deploy to any static hosting service like Netlify, Vercel, or GitHub Pages.

## Credits

- Developed for Nigunei Chaim Synagogue
- Calendar and Zmanim data provided by [Hebcal](https://www.hebcal.com/)
