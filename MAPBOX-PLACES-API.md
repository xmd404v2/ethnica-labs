# Mapbox Places API Integration

This document outlines the integration of Mapbox Places API into the Ethnica application, replacing the Google Places API for search and location-based functionality.

## Overview

The Mapbox Places API provides geocoding, search, and place data that we use to:
- Search for businesses near a user's location
- Get details about a specific business/place
- Display search results on the map

## Benefits of Mapbox Places API

- **Seamless integration** with our existing Mapbox map component
- **Simplified token management** - uses the same token as our map
- **Improved performance** compared to Google Places API
- **Cost-effective** pricing for our needs
- **Reliable fallback** to sample data when needed

## Integration Details

The integration consists of:

1. A new utility file: `src/lib/api/mapbox-places.ts` that provides:
   - `searchNearbyBusinessesWithMapbox` - Find places near a location
   - `getBusinessDetailsWithMapbox` - Get details for a specific place
   - `searchMapboxBusinesses` - Search for businesses by keyword
   
2. Updates to `MapFullscreen` component to use these new functions

## How It Works

### Search Flow

1. When a user searches for a term, the `handleSearch` function in `MapFullscreen` calls `searchMapboxBusinesses`
2. The search results are transformed to match our `Business` interface
3. If Mapbox returns no results, we fall back to our sample data
4. The search results are displayed in the sidebar and as markers on the map

### Location-Based Search

1. When the user's location is determined, `filterBusinessesByLocation` calls `searchNearbyBusinessesWithMapbox`
2. Nearby businesses are displayed on the map and in the sidebar
3. Fallback to sample data occurs if the API fails or returns no results

### Business Details

1. When a user selects a business, `handleBusinessSelect` fetches details using `getBusinessDetailsWithMapbox`
2. If Mapbox details are unavailable, it falls back to Google Places API or the original business object

## Data Transformation

Mapbox returns data in a different format than our `Business` interface requires. The integration handles this with:

- `transformMapboxPlacesData` - Transforms search results into `Business[]`
- `transformMapboxPlaceDetails` - Transforms a single place into a `Business` 
- `generatePlaceholderAttributes` - Creates business attributes since Mapbox doesn't provide them

## Fallback Strategy

Our integration always includes fallbacks to ensure a good user experience:
1. First attempt: Mapbox Places API
2. Second attempt: Google Places API (for details only)
3. Final fallback: Sample/mock data

## Environment Configuration

The integration uses the existing Mapbox token:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Limitations and Considerations

- Mapbox doesn't provide business-specific data like reviews, ratings, or photos. We use placeholders for these.
- Categories are derived from place types and may be less specific than Google's.
- The integration has good error handling and fallbacks to ensure users always see results.

## Testing

To test the integration:
1. Ensure your `.env.local` has a valid Mapbox token
2. Run the application and test search functionality
3. Check that location-based search works when allowing location access
4. Verify that business selection and details display correctly 