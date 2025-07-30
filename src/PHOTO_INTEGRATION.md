# Photo Integration with Unsplash API

## Overview

TripCraft now integrates with Unsplash to provide real, location-specific travel photography that enhances the trip planning experience. The integration uses AI to generate optimal search terms and ensures photos are relevant to specific destinations and activities.

## Implementation Details

### Current Implementation
- **Unsplash Source API**: Uses `https://source.unsplash.com` which provides real photos without requiring API authentication
- **AI-Powered Search Terms**: GPT-4 analyzes destinations and activities to generate optimal search keywords
- **Location-Specific Filtering**: Only shows photos when AI determines they would be relevant to the specific place/activity
- **Consistent Results**: Uses hash-based seeding to provide consistent photo results for the same searches

### Key Features

1. **Activity Photos**: Each day card can display a 3-photo gallery when relevant
2. **Hero Photos**: Destination-specific hero images appear at the top of itineraries
3. **Smart Filtering**: Photos only appear when AI determines they're location-appropriate
4. **Fallback Handling**: Graceful handling when photos aren't available or fail to load
5. **Lightbox Gallery**: Full-screen photo viewing with navigation

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

### URL Structure

Photos are generated using Unsplash Source API:
```
https://source.unsplash.com/800x600/?{searchTerm}&sig={uniqueSeed}
```

The `sig` parameter ensures consistent results and different images for multiple photos of the same subject.

## Production Enhancements

For production deployment, consider upgrading to the full Unsplash API:

1. **API Key Integration**: Get Unsplash API access key for better control
2. **Enhanced Metadata**: Access to photographer attribution, descriptions, tags
3. **Advanced Filtering**: Search by orientation, color, popularity
4. **Rate Limiting**: Proper rate limiting and caching
5. **User Uploads**: Allow users to contribute their own travel photos

### Full API Integration Example

```typescript
// Production implementation with full API
const response = await fetch(`https://api.unsplash.com/search/photos`, {
  headers: {
    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
  },
  params: {
    query: searchTerm,
    per_page: 3,
    orientation: 'landscape'
  }
})
```

## Benefits

1. **Visual Inspiration**: Real travel photography helps users visualize their trip
2. **Location Accuracy**: AI ensures photos match specific destinations
3. **User Engagement**: Photo galleries increase time spent exploring itineraries
4. **Professional Quality**: Unsplash provides high-quality, curated photography
5. **No Generic Stock**: Avoids irrelevant placeholder images

## Technical Notes

- Photos are lazy-loaded and include proper error handling
- Images use responsive sizing (800x600 base with CSS scaling)
- Alt text is generated for accessibility
- Captions provide context about the location/activity
- Hash-based seeding ensures reproducible results