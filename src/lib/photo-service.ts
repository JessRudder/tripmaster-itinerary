import { PhotoData } from './types'

/**
 * Photo Service - Location-Specific Photo Management
 * 
 * Current Implementation Status:
 * This service currently returns empty arrays for all photo requests to ensure
 * that only relevant, location-specific photos are shown. Random placeholder
 * images from services like Picsum are not location-relevant and provide a poor
 * user experience.
 * 
 * Future Enhancement Options:
 * 1. Integration with photo APIs that provide actual location photos (e.g., Unsplash API)
 * 2. Curated photo database for common destinations
 * 3. User-uploaded photo sharing system
 * 
 * The AI analysis remains in place to identify when destinations/activities
 * would be suitable for photos, so the infrastructure is ready for when
 * a proper photo source becomes available.
 */

/**
 * Analyzes whether photos should be shown for an activity
 * Currently returns empty array as we cannot guarantee location-specific photos
 * This prevents showing irrelevant random images
 */
export async function generatePhotosForActivity(
  destination: string, 
  activity: string,
  activityType: string
): Promise<PhotoData[]> {
  try {
    // Use AI to determine if this activity is photo-worthy and specific
    const photoAnalysisPrompt = spark.llmPrompt`Analyze this travel activity and determine if it's a famous, well-known landmark or attraction that tourists universally recognize:

Destination: ${destination}
Activity: ${activity}
Activity Type: ${activityType}

Consider:
1. Is this a world-famous landmark (like Eiffel Tower, Statue of Liberty, etc.)?
2. Is this a universally recognizable attraction?
3. Is this specific enough that any photo would clearly represent this exact place?

Be very strict - only return true for extremely famous, iconic places that everyone would recognize.

Respond with JSON:
{
  "isFamousLandmark": true/false,
  "confidence": "high/medium/low",
  "reason": "brief explanation"
}`

    const analysisResponse = await spark.llm(photoAnalysisPrompt, "gpt-4o-mini", true)
    const analysis = JSON.parse(analysisResponse)
    
    // Only show photos for extremely famous landmarks to ensure relevance
    // For now, being conservative and not showing photos to avoid irrelevant images
    console.log(`Photo analysis for ${activity} in ${destination}: ${analysis.reason}`)
    
    // Return empty array - no photos until we can guarantee they're location-specific
    return []
    
  } catch (error) {
    console.warn('Failed to analyze photo suitability:', error)
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
 * Analyzes whether a hero photo should be shown for the destination
 * Currently returns null as we cannot guarantee location-specific photos
 */
export async function generateDestinationHeroPhoto(destination: string): Promise<PhotoData | null> {
  try {
    // Use AI to determine if this is a world-famous destination
    const heroAnalysisPrompt = spark.llmPrompt`Analyze this destination and determine if it's an extremely famous, world-renowned location:

Destination: ${destination}

Consider:
1. Is this a world-famous city or landmark that everyone recognizes?
2. Is this specific enough that any photo would clearly represent this exact place?
3. Would this destination be featured in major travel guides and be universally known?

Be very strict - only return true for destinations like Paris, New York, Tokyo, etc.

Respond with JSON:
{
  "isWorldFamous": true/false,
  "confidence": "high/medium/low",
  "reason": "brief explanation"
}`

    const analysisResponse = await spark.llm(heroAnalysisPrompt, "gpt-4o-mini", true)
    const analysis = JSON.parse(analysisResponse)
    
    console.log(`Hero photo analysis for ${destination}: ${analysis.reason}`)
    
    // For now, being conservative and not showing hero photos to avoid irrelevant images
    // Return null - no hero photo until we can guarantee it's location-specific
    return null
    
  } catch (error) {
    console.warn('Failed to analyze destination for hero photo:', error)
    return null
  }
}