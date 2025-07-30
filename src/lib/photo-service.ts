import { PhotoData } from './types'

/**
 * Generates relevant photos for a destination activity using Picsum
 * This provides high-quality, placeholder imagery for each itinerary item
 */
export async function generatePhotosForActivity(
  destination: string, 
  activity: string,
  activityType: string
): Promise<PhotoData[]> {
  const photos: PhotoData[] = []
  
  try {
    // Generate 3 photos per activity using Picsum with different seeds
    for (let i = 0; i < 3; i++) {
      // Use a deterministic seed based on destination and activity to ensure consistency
      const seedInput = `${destination}-${activity}-${i}`
      const seed = hashString(seedInput)
      const url = `https://picsum.photos/seed/${seed}/800/600`
      
      photos.push({
        url,
        alt: `${activity} in ${destination}`,
        caption: generateCaption(destination, activity, i)
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
function generateCaption(destination: string, activity: string, index: number): string {
  const captions = [
    `Experience ${activity} in ${destination}`,
    `Discover the beauty of ${destination}`,
    `${activity} - a must-see attraction`,
    `Explore ${destination}'s highlights`
  ]
  
  return captions[index] || `${activity} in ${destination}`
}

/**
 * Generates a hero photo for the destination overview
 */
export function generateDestinationHeroPhoto(destination: string): PhotoData {
  try {
    const seed = hashString(`${destination}-hero`)
    return {
      url: `https://picsum.photos/seed/${seed}/1200/800`,
      alt: `${destination} landmark view`,
      caption: `Welcome to ${destination}`
    }
  } catch (error) {
    console.warn('Failed to generate hero photo:', error)
    // Return a fallback photo
    return {
      url: `https://via.placeholder.com/1200x800/e2e8f0/64748b?text=${encodeURIComponent(destination)}`,
      alt: `${destination} landmark view`,
      caption: `Welcome to ${destination}`
    }
  }
}