import { TripFormData, TripItinerary, DayActivity, PackingItem } from './types'
import { generatePhotosForActivity, generateDestinationHeroPhoto } from './photo-service'
import { fetchWeatherData, fetchWeatherForDate } from './weather-service'

async function generatePackingSuggestions(
  formData: TripFormData, 
  activities: DayActivity[], 
  weatherData: any
): Promise<PackingItem[]> {
  const activitiesList = activities.map(a => a.mainActivity).join(', ')
  const weatherCondition = weatherData?.condition || 'varied weather'
  const temperature = weatherData?.temperature ? `${weatherData.temperature}°F` : 'moderate temperatures'
  
  const prompt = spark.llmPrompt`You are a professional travel packing consultant. Generate a comprehensive packing list for a ${formData.days}-day trip to ${formData.destination}.

Trip details:
- Activities planned: ${activitiesList}
- Activity focus: ${formData.activityType}
- Weather: ${weatherCondition}, ${temperature}
- Traveling with children: ${formData.hasChildren ? 'Yes' : 'No'}
- Duration: ${formData.days} days

For each item, provide:
1. The specific item name
2. Category: clothing, gear, accessories, documents, personal, electronics
3. Priority: essential (absolutely must have), recommended (should have), optional (nice to have)
4. Brief reason why it's needed for this specific trip

Return valid JSON in this exact format:
{
  "packingList": [
    {
      "item": "Waterproof hiking boots",
      "category": "clothing",
      "priority": "essential",
      "reason": "For hiking activities and potential wet weather"
    }
  ]
}

Include 15-25 items total. Consider the specific activities, weather conditions, and destination. ${formData.hasChildren ? 'Include child-specific items.' : ''} Focus on practical items that match the ${formData.activityType} activity type.`

  try {
    const response = await spark.llm(prompt, "gpt-4o", true)
    const parsed = JSON.parse(response)
    return parsed.packingList || []
  } catch (error) {
    console.error('Failed to generate packing suggestions:', error)
    // Return a basic packing list as fallback
    return [
      { item: 'Passport/ID', category: 'documents', priority: 'essential', reason: 'Required for travel identification' },
      { item: 'Comfortable walking shoes', category: 'clothing', priority: 'essential', reason: 'For daily activities and exploration' },
      { item: 'Weather-appropriate clothing', category: 'clothing', priority: 'essential', reason: `For ${weatherCondition} conditions` },
      { item: 'Phone charger', category: 'electronics', priority: 'essential', reason: 'To keep devices powered' },
      { item: 'Sunscreen', category: 'personal', priority: 'recommended', reason: 'Protection from sun exposure' }
    ]
  }
}

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
    
    // Generate packing suggestions based on activities and weather
    const packingList = await generatePackingSuggestions(formData, activitiesWithPhotosAndWeather, generalWeatherData)
    
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
      packingList,
      ...(heroPhoto && { heroPhoto })
    }
    
    return itinerary
  } catch (error) {
    console.error('Failed to generate itinerary:', error)
    throw new Error('Failed to generate itinerary. Please try again.')
  }
}