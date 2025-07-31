import { PhotoData } from './types'
import { renderPrompt, createSparkPrompt } from './prompt-service'

/**
 * Photo Service - Location-Specific Photo Management with Unsplash API
 * 
 * This service integrates with the Unsplash API to provide location-specific,
 * high-quality travel photography. It uses AI to determine optimal search terms
 * and filters results to ensure relevance to the specific destination and activity.
 * 
 * Features:
 * - Real photo API integration with Unsplash
 * - AI-powered search term optimization
 * - Location-specific filtering
 * - Fallback handling for unavailable photos
 */

const UNSPLASH_BASE_URL = 'https://api.unsplash.com'
const UNSPLASH_ACCESS_KEY = 'SjGt-UdmnjqrtfnRUf3TObvDQAv5ochEghww3C_KYRc'

/**
 * Interface for Unsplash API photo response
 */
interface UnsplashPhoto {
  id: string
  urls: {
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
  }
  location?: {
    name?: string
    city?: string
    country?: string
  }
}

/**
 * Interface for Unsplash API search response
 */
interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashPhoto[]
}

/**
 * Searches for photos using the official Unsplash API
 */
async function searchUnsplashPhotos(searchTerm: string, count: number = 3): Promise<PhotoData[]> {
  try {
    const response = await fetch(
      `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=${count}&orientation=landscape&content_filter=high`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data: UnsplashSearchResponse = await response.json()
    
    return data.results.map((photo: UnsplashPhoto) => ({
      url: photo.urls.regular,
      alt: photo.alt_description || photo.description || searchTerm,
      caption: generateContextualCaption(photo, searchTerm),
      photographer: photo.user.name
    }))
    
  } catch (error) {
    console.warn(`Failed to fetch photos from Unsplash for "${searchTerm}":`, error)
    return []
  }
}

/**
 * Generates contextual captions for photos
 */
function generateContextualCaption(photo: UnsplashPhoto, searchTerm: string): string {
  if (photo.description) {
    return photo.description
  }
  
  if (photo.alt_description) {
    return photo.alt_description
  }
  
  if (photo.location?.name) {
    return photo.location.name
  }
  
  if (photo.location?.city) {
    return `${photo.location.city}${photo.location.country ? `, ${photo.location.country}` : ''}`
  }
  
  return searchTerm
}

/**
 * Generates optimized search terms for location-specific photos
 */
export async function generatePhotosForActivity(
  destination: string, 
  activity: string,
  activityType: string
): Promise<PhotoData[]> {
  try {
    // Use AI to generate optimal search terms for location-specific photos
    const { prompt: renderedPrompt, model, outputFormat } = await renderPrompt('photo-search-terms', {
      destination,
      activity,
      activityType
    })

    const sparkPrompt = createSparkPrompt(renderedPrompt)
    const response = await spark.llm(sparkPrompt, model || "gpt-4o-mini", outputFormat === 'json')
    const searchData = JSON.parse(response)
    
    console.log(`Photo search for ${activity} in ${destination}:`, searchData.reasoning)
    
    if (!searchData.shouldShowPhotos || !searchData.searchTerms?.length) {
      return []
    }

    // Use the first search term to search for photos
    const primarySearchTerm = searchData.searchTerms[0]
    
    // Search for photos using Unsplash API
    const photos = await searchUnsplashPhotos(primarySearchTerm, 3)
    
    if (photos.length === 0 && searchData.searchTerms.length > 1) {
      // Try the second search term if the first didn't return results
      const secondaryPhotos = await searchUnsplashPhotos(searchData.searchTerms[1], 3)
      if (secondaryPhotos.length > 0) {
        console.log(`Generated ${secondaryPhotos.length} photos for secondary term: ${searchData.searchTerms[1]}`)
        return secondaryPhotos
      }
    }
    
    console.log(`Generated ${photos.length} photos for: ${primarySearchTerm}`)
    return photos
    
  } catch (error) {
    console.warn('Failed to generate photos for activity:', error)
    return []
  }
}

/**
 * Generates a hero photo for the destination using Unsplash API
 */
export async function generateDestinationHeroPhoto(destination: string): Promise<PhotoData | null> {
  try {
    // Use AI to generate the best search term for a destination hero photo
    const { prompt: renderedPrompt, model, outputFormat } = await renderPrompt('hero-photo-search', {
      destination
    })

    const sparkPrompt = createSparkPrompt(renderedPrompt)
    const response = await spark.llm(sparkPrompt, model || "gpt-4o-mini", outputFormat === 'json')
    const heroData = JSON.parse(response)
    
    console.log(`Hero photo search for ${destination}:`, heroData.reasoning)
    
    if (!heroData.shouldShowHero || !heroData.searchTerm) {
      return null
    }

    // Search for hero photo using Unsplash API
    const heroPhotos = await searchUnsplashPhotos(heroData.searchTerm, 1)
    
    if (heroPhotos.length > 0) {
      const heroPhoto = heroPhotos[0]
      console.log(`Generated hero photo for: ${heroData.searchTerm}`)
      return {
        ...heroPhoto,
        caption: `${destination}`
      }
    }
    
    return null
    
  } catch (error) {
    console.warn('Failed to generate destination hero photo:', error)
    return null
  }
}