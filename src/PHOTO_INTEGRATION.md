# Photo Integration with Unsplash API

## Overview

TripCraft now integrates with the official Unsplash API to provide real, location-specific travel photography that enhances the trip planning experience. The integration uses AI to generate optimal search terms and ensures photos are relevant to specific destinations and activities.

## Implementation Details

### Current Implementation
- **Unsplash REST API**: Uses the official `https://api.unsplash.com` with proper API authentication
- **Real API Credentials**: Integrated with your Unsplash application credentials
- **AI-Powered Search Terms**: GPT-4 analyzes destinations and activities to generate optimal search keywords
- **Location-Specific Filtering**: Only shows photos when AI determines they would be relevant to the specific place/activity
- **Enhanced Metadata**: Access to photographer attribution, descriptions, and location data

### Key Features

1. **Activity Photos**: Each day card can display a 3-photo gallery when relevant
2. **Hero Photos**: Destination-specific hero images appear at the top of itineraries
3. **Smart Filtering**: Photos only appear when AI determines they're location-appropriate
4. **Photographer Attribution**: Proper credits displayed for all photos
5. **Fallback Handling**: Graceful handling when photos aren't available or fail to load
6. **Lightbox Gallery**: Full-screen photo viewing with navigation and credits

### API Integration

The system now uses the full Unsplash API with your credentials:

```typescript
const UNSPLASH_ACCESS_KEY = 'SjGt-UdmnjqrtfnRUf3TObvDQAv5ochEghww3C_KYRc'
```

#### Search Implementation
```typescript
const response = await fetch(
  `${UNSPLASH_BASE_URL}/search/photos?query=${searchTerm}&per_page=${count}&orientation=landscape&content_filter=high`,
  {
    headers: {
      'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1'
    }
  }
)
```

### AI Integration

The system uses two AI prompts:

#### Activity Photo Generation
```typescript
// Analyzes activity and generates 1-2 specific search terms
// Examples: "Eiffel Tower", "Tokyo skyline", "Grand Canyon"
generatePhotosForActivity(destination, activity, activityType)
```

#### Hero Photo Generation
```typescript
// Generates single best search term for destination hero image
// Examples: "Paris" → "Eiffel Tower", "New York" → "Manhattan skyline"
generateDestinationHeroPhoto(destination)
```

### Photo Data Structure

```typescript
interface PhotoData {
  url: string           // High-quality image URL
  alt: string          // Alt text for accessibility
  caption?: string     // Contextual caption
  photographer?: string // Photographer name for attribution
}
```

## Benefits

1. **Visual Inspiration**: Real travel photography helps users visualize their trip
2. **Location Accuracy**: AI ensures photos match specific destinations
3. **Professional Attribution**: Proper photographer credits following Unsplash guidelines
4. **High Quality**: Access to Unsplash's curated, high-resolution photography
5. **Enhanced Metadata**: Rich photo information including descriptions and locations
6. **User Engagement**: Photo galleries increase time spent exploring itineraries

## Technical Features

- **Error Handling**: Robust fallback for failed API requests or missing photos
- **Loading States**: Smooth loading animations for better UX
- **Responsive Design**: Photos adapt to different screen sizes
- **Accessibility**: Proper alt text and keyboard navigation
- **Attribution**: Photographer credits displayed in lightbox modal
- **API Rate Limiting**: Proper handling of Unsplash API rate limits

## Future Enhancements

1. **Caching Layer**: Implement photo caching to reduce API calls
2. **User Favorites**: Allow users to save favorite photos
3. **Advanced Filters**: Filter by color, popularity, or time of day
4. **Offline Support**: Cache photos for offline viewing
5. **User Uploads**: Allow users to contribute their own travel photos