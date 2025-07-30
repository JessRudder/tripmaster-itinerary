import { PhotoData } from './types'

/**
 * Generates relevant photos for a destination activity using Unsplash
 * This provides high-quality, travel-focused imagery for each itinerary item
 */
export async function generatePhotosForActivity(
  destination: string, 
  activity: string,
  activityType: string
): Promise<PhotoData[]> {
  // Create search terms that combine destination with activity context
  const searchTerms = [
    `${destination} ${activity}`,
    `${destination} travel`,
    `${destination} tourism`,
    `${activityType} ${destination}`
  ]
  
  const photos: PhotoData[] = []
  
  // Generate 3-4 photos per activity using different search terms
  for (let i = 0; i < Math.min(3, searchTerms.length); i++) {
    const searchTerm = encodeURIComponent(searchTerms[i])
    
    // Using Unsplash Source API for high-quality travel photos
    // Adding random seed to get variety in images
    const seed = Math.floor(Math.random() * 1000000)
    const url = `https://source.unsplash.com/800x600/?${searchTerm}&sig=${seed}`
    
    photos.push({
      url,
      alt: `${activity} in ${destination}`,
      caption: generateCaption(destination, activity, i)
    })
  }
  
  return photos
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
  const seed = Math.floor(Math.random() * 1000000)
  return {
    url: `https://source.unsplash.com/1200x800/?${encodeURIComponent(destination)},travel,landmark&sig=${seed}`,
    alt: `${destination} landmark view`,
    caption: `Welcome to ${destination}`
  }
}