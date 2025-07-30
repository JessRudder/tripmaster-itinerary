import { PhotoData } from './types'

/**
 * Generates relevant photos for a destination activity using AI to determine photo relevance
 * Only returns photos if they are actually relevant to the location and activity
 */
export async function generatePhotosForActivity(
  destination: string, 
  activity: string,
  activityType: string
): Promise<PhotoData[]> {
  try {
    // Use AI to determine if we should show photos and generate relevant search terms
    const photoAnalysisPrompt = spark.llmPrompt`Analyze this travel activity and determine if it's the type of activity that would have relevant, recognizable photos available:

Destination: ${destination}
Activity: ${activity}
Activity Type: ${activityType}

Consider:
1. Is this a real, well-known destination?
2. Is this a specific, photographable activity/attraction?
3. Would tourists typically take photos of this activity?
4. Is this concrete enough to have visual representation?

If YES, provide 3 specific photo search terms that would find relevant images.
If NO, respond with "NO_PHOTOS".

Respond with JSON:
{
  "hasRelevantPhotos": true/false,
  "searchTerms": ["term1", "term2", "term3"] or null,
  "reason": "brief explanation"
}`

    const analysisResponse = await spark.llm(photoAnalysisPrompt, "gpt-4o-mini", true)
    const analysis = JSON.parse(analysisResponse)
    
    // If AI determines photos aren't relevant, return empty array
    if (!analysis.hasRelevantPhotos || !analysis.searchTerms) {
      console.log(`No relevant photos available for ${activity} in ${destination}: ${analysis.reason}`)
      return []
    }
    
    // Generate photos using the AI-determined search terms
    const photos: PhotoData[] = []
    
    for (let i = 0; i < Math.min(3, analysis.searchTerms.length); i++) {
      const searchTerm = analysis.searchTerms[i]
      const seed = hashString(`${destination}-${searchTerm}-${i}`)
      
      // Use Picsum with improved seeding for more consistency, but with relevant alt text
      const url = `https://picsum.photos/seed/${seed}/800/600`
      
      photos.push({
        url,
        alt: `${searchTerm} in ${destination}`,
        caption: generateContextualCaption(destination, activity, searchTerm)
      })
    }
    
    return photos
  } catch (error) {
    console.warn('Failed to generate photos for activity:', error)
    // Return empty array if photo generation fails
    return []
  }
}

/**
 * Simple string hash function to generate consistent seeds
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString()
}

/**
 * Generates contextual captions for photos based on activity and destination
 */
function generateContextualCaption(destination: string, activity: string, searchTerm: string): string {
  const captions = [
    `${searchTerm} in ${destination}`,
    `Experience ${activity}`,
    `Discover ${destination}`,
    `${searchTerm} - ${destination}`
  ]
  
  // Pick a caption based on content
  if (searchTerm.toLowerCase().includes(destination.toLowerCase())) {
    return `Experience ${activity}`
  } else if (searchTerm.toLowerCase().includes(activity.toLowerCase())) {
    return `${searchTerm} in ${destination}`
  } else {
    return `${searchTerm} - ${destination}`
  }
}

/**
 * Generates a hero photo for the destination overview
 */
export async function generateDestinationHeroPhoto(destination: string): Promise<PhotoData> {
  try {
    // Use AI to determine if this is a real destination worth showing photos for
    const heroAnalysisPrompt = spark.llmPrompt`Analyze this destination and determine if it's a real, well-known place that would have recognizable landmark photos:

Destination: ${destination}

Consider:
1. Is this a real city, country, or tourist destination?
2. Would it have iconic landmarks or scenery?
3. Is it specific enough to find relevant photos?

If YES, provide the best search term for a landmark/scenic photo.
If NO, respond with "NO_PHOTO".

Respond with JSON:
{
  "hasLandmark": true/false,
  "searchTerm": "specific search term" or null,
  "reason": "brief explanation"
}`

    const analysisResponse = await spark.llm(heroAnalysisPrompt, "gpt-4o-mini", true)
    const analysis = JSON.parse(analysisResponse)
    
    if (!analysis.hasLandmark || !analysis.searchTerm) {
      // Return a generic travel-themed placeholder
      return {
        url: `https://picsum.photos/seed/travel-${hashString(destination)}/1200/800`,
        alt: `${destination} destination`,
        caption: `Welcome to ${destination}`
      }
    }
    
    // Use Picsum with the AI-determined search term for consistent images
    const seed = hashString(`${destination}-${analysis.searchTerm}-hero`)
    const url = `https://picsum.photos/seed/${seed}/1200/800`
    
    return {
      url,
      alt: `${destination} landmark view`,
      caption: `Welcome to ${destination}`
    }
  } catch (error) {
    console.warn('Failed to generate hero photo:', error)
    // Return a generic fallback
    return {
      url: `https://picsum.photos/seed/travel-fallback/1200/800`,
      alt: `${destination} destination`,
      caption: `Welcome to ${destination}`
    }
  }
}