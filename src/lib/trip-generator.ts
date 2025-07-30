import { TripFormData, TripItinerary, DayActivity } from './types'
import { generatePhotosForActivity, generateDestinationHeroPhoto } from './photo-service'
import { fetchWeatherData, fetchWeatherForDate } from './weather-service'

export async function generateItinerary(formData: TripFormData): Promise<TripItinerary> {
  const childrenText = formData.hasChildren ? "family-friendly activities suitable for children" : "activities for adults"
  
  const prompt = spark.llmPrompt`You are a professional travel planner. Create a detailed ${formData.days}-day itinerary for ${formData.destination} focusing on ${formData.activityType} activities with ${childrenText}.

For each day, provide:
1. A main activity (specific attraction, experience, or location)
2. A 2-3 sentence description of the activity
3. 2-3 add-on suggestions that complement the main activity
4. Estimated cost range (budget/moderate/expensive)
5. Best time of day (morning/afternoon/evening/full-day)

Return valid JSON in this exact format:
{
  "activities": [
    {
      "day": 1,
      "mainActivity": "Activity name",
      "description": "Detailed description",
      "addOns": ["Add-on 1", "Add-on 2", "Add-on 3"],
      "estimatedCost": "moderate",
      "timeOfDay": "morning"
    }
  ]
}

Make activities realistic, specific to the destination, and well-sequenced. Ensure ${formData.hasChildren ? 'all activities are child-friendly' : 'activities match adult interests'}. Focus heavily on ${formData.activityType} theme.`

  try {
    const response = await spark.llm(prompt, "gpt-4o", true)
    const parsed = JSON.parse(response)
    
    // Calculate individual day dates if start date is provided
    const dayDates: string[] = []
    if (formData.startDate) {
      const startDate = new Date(formData.startDate)
      for (let i = 0; i < formData.days; i++) {
        const dayDate = new Date(startDate)
        dayDate.setDate(startDate.getDate() + i)
        dayDates.push(dayDate.toISOString().split('T')[0])
      }
    }
    
    // Fetch weather data for the destination (general forecast)
    const generalWeatherData = await fetchWeatherData(formData.destination)
    
    // Generate photos and weather for each activity
    const activitiesWithPhotosAndWeather = await Promise.all(
      parsed.activities.map(async (activity: DayActivity, index: number) => {
        const photos = await generatePhotosForActivity(
          formData.destination,
          activity.mainActivity,
          formData.activityType
        )
        
        // Get weather for specific date if available, otherwise use general weather
        let dayWeather = generalWeatherData
        const dayDate = dayDates[index]
        if (dayDate) {
          try {
            dayWeather = await fetchWeatherForDate(formData.destination, dayDate)
          } catch (error) {
            console.warn(`Could not fetch weather for ${dayDate}, using general weather`)
          }
        }
        
        return {
          ...activity,
          date: dayDate,
          photos,
          weather: dayWeather
        }
      })
    )
    
    // Generate hero photo (might be null if not a famous destination)
    const heroPhoto = await generateDestinationHeroPhoto(formData.destination)
    
    const itinerary: TripItinerary = {
      id: `trip-${Date.now()}`,
      destination: formData.destination,
      days: formData.days,
      hasChildren: formData.hasChildren,
      activityType: formData.activityType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      activities: activitiesWithPhotosAndWeather,
      createdAt: new Date().toISOString(),
      weather: generalWeatherData,
      ...(heroPhoto && { heroPhoto })
    }
    
    return itinerary
  } catch (error) {
    console.error('Failed to generate itinerary:', error)
    throw new Error('Failed to generate itinerary. Please try again.')
  }
}