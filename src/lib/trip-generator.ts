import { TripFormData, TripItinerary, DayActivity, PackingItem } from './types'
import { generatePhotosForActivity, generateDestinationHeroPhoto } from './photo-service'
import { fetchWeatherData, fetchWeatherForDate } from './weather-service'
import { renderPrompt, createSparkPrompt } from './prompt-service'

async function generatePackingSuggestions(
  formData: TripFormData, 
  activities: DayActivity[], 
  weatherData: any
): Promise<PackingItem[]> {
  const activitiesList = activities.map(a => a.mainActivity).join(', ')
  const weatherCondition = weatherData?.condition || 'varied weather'
  const temperature = weatherData?.temperature ? `${weatherData.temperature}°F` : 'moderate temperatures'
  
  try {
    const { prompt: renderedPrompt, model, outputFormat } = await renderPrompt('packing-suggestions', {
      days: formData.days,
      destination: formData.destination,
      activitiesList,
      activityType: formData.activityType,
      weatherCondition,
      temperature,
      hasChildren: formData.hasChildren
    })

    const sparkPrompt = createSparkPrompt(renderedPrompt)
    const response = await spark.llm(sparkPrompt, model || "gpt-4o", outputFormat === 'json')
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
  
  try {
    const { prompt: renderedPrompt, model, outputFormat } = await renderPrompt('trip-itinerary', {
      days: formData.days,
      destination: formData.destination,
      activityType: formData.activityType,
      childrenText,
      hasChildren: formData.hasChildren
    })

    const sparkPrompt = createSparkPrompt(renderedPrompt)
    const response = await spark.llm(sparkPrompt, model || "gpt-4o", outputFormat === 'json')
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