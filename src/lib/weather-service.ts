import { WeatherData } from './types'

/**
 * Weather service for fetching current weather conditions for destinations
 * Uses OpenWeatherMap API which provides free weather data
 */

// Mock weather data for demonstration - in production you'd use a real weather API
const generateMockWeather = (destination: string): WeatherData => {
  // Generate consistent weather based on destination hash
  const hash = destination.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)

  const conditions = [
    { condition: 'Clear', description: 'Clear sky', icon: '☀️' },
    { condition: 'Clouds', description: 'Partly cloudy', icon: '⛅' },
    { condition: 'Rain', description: 'Light rain', icon: '🌧️' },
    { condition: 'Snow', description: 'Light snow', icon: '❄️' },
    { condition: 'Mist', description: 'Misty conditions', icon: '🌫️' }
  ]

  const conditionIndex = Math.abs(hash) % conditions.length
  const selectedCondition = conditions[conditionIndex]
  
  // Generate temperature based on hash (15-30°C range for variety)
  const temperature = 15 + (Math.abs(hash) % 16)
  
  // Generate humidity (40-80% range)
  const humidity = 40 + (Math.abs(hash * 2) % 41)
  
  // Generate wind speed (5-25 km/h)
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
 * Fetch weather data for a destination
 * Currently uses mock data - replace with real API call in production
 */
export const fetchWeatherData = async (destination: string): Promise<WeatherData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  try {
    // In production, you would make an actual API call like:
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${destination}&appid=${API_KEY}&units=metric`)
    // const data = await response.json()
    // return formatWeatherData(data)
    
    return generateMockWeather(destination)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    
    // Return default weather if API fails
    return {
      temperature: 22,
      condition: 'Clear',
      description: 'Pleasant weather',
      humidity: 60,
      windSpeed: 10,
      icon: '☀️'
    }
  }
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