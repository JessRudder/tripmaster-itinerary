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

export interface DayActivity {
  day: number
  mainActivity: string
  description: string
  addOns: string[]
  estimatedCost?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'full-day'
}

export interface TripItinerary {
  id: string
  destination: string
  days: number
  hasChildren: boolean
  activityType: ActivityType
  activities: DayActivity[]
  createdAt: string
}