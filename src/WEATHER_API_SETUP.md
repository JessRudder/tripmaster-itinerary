# Weather API Configuration

## Overview

TripCraft uses the OpenWeatherMap API to provide real weather forecasts for your travel dates. The app can provide weather information for:

- Current weather conditions
- 5-day weather forecasts for specific trip dates
- Intelligent fallbacks for dates beyond the forecast period

## Setting Up OpenWeatherMap API

### 1. Get Your API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to your account dashboard
4. Generate a new API key
5. Copy your API key

### 2. Configure the API Key

Open `src/lib/weather-service.ts` and replace the placeholder:

```typescript
// Replace this line:
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'

// With your actual API key:
const WEATHER_API_KEY = 'your_actual_api_key_here'
```

### 3. API Features

**Current Weather**: Available for any destination worldwide
**5-Day Forecast**: Provides detailed weather for each day of your trip (up to 5 days)
**Fallback Data**: For dates beyond 5 days, the app generates realistic seasonal weather estimates

### 4. Fallback Behavior

If no API key is configured or the API is unavailable, TripCraft will:
- Generate realistic mock weather data based on destination and season
- Still provide useful weather estimates for trip planning
- Continue functioning without interruption

### 5. Weather Information Displayed

For each day of your trip, you'll see:
- Temperature (°C)
- Weather condition (Clear, Cloudy, Rain, etc.)
- Weather description
- Humidity percentage
- Wind speed (km/h)
- Weather icon

### 6. Free Tier Limits

OpenWeatherMap's free tier includes:
- 60 calls per minute
- 1,000,000 calls per month
- Current weather data
- 5-day/3-hour forecast

This is more than sufficient for typical TripCraft usage.

## Troubleshooting

**Weather not showing**: Check that your API key is correctly configured in `weather-service.ts`

**Generic weather data**: If you see the same weather for all destinations, you may be using mock data due to API configuration issues

**API errors**: Check your API key and ensure you haven't exceeded rate limits