import { WeatherData } from './types'

/**
 * Weather service for fetching weather data for specific dates and destinations
 * Uses OpenWeatherMap API which provides current weather and 5-day forecast
 */

// OpenWeatherMap API configuration
// To use real weather data, sign up at https://openweathermap.org/api and replace with your API key
const WEATHER_API_KEY = '2d169bb782eb8385262b1680e151f9dc'
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

// Helper to check if API key is configured
const isWeatherAPIConfigured = () => {
  return WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_OPENWEATHERMAP_API_KEY'
}

/**
 * Get coordinates for a destination using OpenWeatherMap Geocoding API
 */
const getCoordinates = async (destination: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${WEATHER_API_KEY}`
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon }
    }
    return null
  } catch (error) {
    console.error('Error fetching coordinates:', error)
    return null
  }
}

/**
 * Calculate days between two dates
 */
const getDaysBetween = (startDate: string, targetDate: string): number => {
  const start = new Date(startDate)
  const target = new Date(targetDate)
  const diffTime = target.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Fetch weather data for a specific date
 */
export const fetchWeatherForDate = async (
  destination: string, 
  date: string
): Promise<WeatherData> => {
  const today = new Date()
  const targetDate = new Date(date)
  const daysFromToday = getDaysBetween(today.toISOString().split('T')[0], date)

  // If API key is not configured, use mock data
  if (!isWeatherAPIConfigured()) {
    console.warn('OpenWeatherMap API key not configured. Using mock weather data.')
    return generateMockWeatherForDate(destination, date)
  }

  try {
    const coordinates = await getCoordinates(destination)
    if (!coordinates) {
      throw new Error('Could not find coordinates for destination')
    }

    const { lat, lon } = coordinates

    // For dates within 5 days, use forecast API
    if (daysFromToday >= 0 && daysFromToday <= 5) {
      const response = await fetch(
        `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      )
      const data = await response.json()

      // Find forecast for the specific date
      const targetDateStr = targetDate.toISOString().split('T')[0]
      const forecast = data.list.find((item: any) => {
        const forecastDate = new Date(item.dt * 1000).toISOString().split('T')[0]
        return forecastDate === targetDateStr
      })

      if (forecast) {
        return {
          temperature: forecast.main.temp,
          condition: forecast.weather[0].main,
          description: forecast.weather[0].description,
          humidity: forecast.main.humidity,
          windSpeed: forecast.wind.speed * 3.6, // Convert m/s to km/h
          icon: getWeatherIcon(forecast.weather[0].main)
        }
      }
    }

    // For current day or fallback, use current weather
    if (daysFromToday === 0) {
      const response = await fetch(
        `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      )
      const data = await response.json()

      return {
        temperature: data.main.temp,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
        icon: getWeatherIcon(data.weather[0].main)
      }
    }

    // For dates beyond 5 days, generate reasonable mock data
    throw new Error('Weather forecast not available for dates beyond 5 days')

  } catch (error) {
    console.error('Error fetching weather data:', error)
    
    // Return mock weather based on destination and date for fallback
    return generateMockWeatherForDate(destination, date)
  }
}

/**
 * Generate mock weather data based on destination and date
 */
const generateMockWeatherForDate = (destination: string, date: string): WeatherData => {
  // Create a hash from destination and date for consistency
  const input = destination + date
  const hash = input.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)

  // Get month to simulate seasonal variation
  const month = new Date(date).getMonth()
  const isWinter = month === 0 || month === 1 || month === 11 // Dec, Jan, Feb
  const isSummer = month >= 5 && month <= 8 // Jun, Jul, Aug, Sep
  
  const conditions = [
    { condition: 'Clear', description: 'Clear sky', icon: '☀️' },
    { condition: 'Clouds', description: 'Partly cloudy', icon: '⛅' },
    { condition: 'Rain', description: 'Light rain', icon: '🌧️' },
    ...(isWinter ? [{ condition: 'Snow', description: 'Light snow', icon: '❄️' }] : []),
    { condition: 'Mist', description: 'Misty conditions', icon: '🌫️' }
  ]

  const conditionIndex = Math.abs(hash) % conditions.length
  const selectedCondition = conditions[conditionIndex]
  
  // Seasonal temperature adjustment
  let baseTemp = 20
  if (isWinter) baseTemp = 5
  else if (isSummer) baseTemp = 25
  
  const temperature = baseTemp + (Math.abs(hash) % 15) - 5
  const humidity = 40 + (Math.abs(hash * 2) % 41)
  const windSpeed = 5 + (Math.abs(hash * 3) % 21)

  return {
    temperature,
    condition: selectedCondition.condition,
    description: selectedCondition.description,
    humidity,
    windSpeed,
    icon: selectedCondition.icon
  }
}

/**
 * Fetch weather data for a destination (current weather or general forecast)
 */
export const fetchWeatherData = async (destination: string): Promise<WeatherData> => {
  const today = new Date().toISOString().split('T')[0]
  return fetchWeatherForDate(destination, today)
}

/**
 * Get weather icon based on condition
 */
export const getWeatherIcon = (condition: string): string => {
  const iconMap: Record<string, string> = {
    'Clear': '☀️',
    'Clouds': '⛅',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️'
  }
  
  return iconMap[condition] || '🌤️'
}

/**
 * Format temperature with unit
 */
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`
}