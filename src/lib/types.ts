export interface TripFormData {
  destination: string
  days: number
  hasChildren: boolean
  activityType: ActivityType
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

export interface DayActivity {
  day: number
  mainActivity: string
  description: string
  addOns: string[]
  estimatedCost?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'full-day'
  photos?: PhotoData[]
}

export interface TripItinerary {
  id: string
  destination: string
  days: number
  hasChildren: boolean
  activityType: ActivityType
  activities: DayActivity[]
  createdAt: string
  heroPhoto?: PhotoData
}