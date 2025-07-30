export interface TripFormData {
  destination: string
  days: number
  hasChildren: boolean
  activityType: ActivityType
  startDate?: string
  endDate?: string
}

export type ActivityType = 
  | 'cultural'
  | 'adventure'
  | 'relaxation'
  | 'food'
  | 'nature'
  | 'urban'

export interface PhotoData {
  url: string
  alt: string
  caption?: string
  photographer?: string
}

export interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export interface DayActivity {
  day: number
  date?: string
  mainActivity: string
  description: string
  addOns: string[]
  estimatedCost?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'full-day'
  photos?: PhotoData[]
  weather?: WeatherData
}

export interface TripItinerary {
  id: string
  destination: string
  days: number
  hasChildren: boolean
  activityType: ActivityType
  activities: DayActivity[]
  createdAt: string
  startDate?: string
  endDate?: string
  heroPhoto?: PhotoData
  weather?: WeatherData
}