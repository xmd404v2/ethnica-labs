# Migration from Google Places API to Mapbox

This project has been migrated from using Google Places API to Mapbox for all location-based services. This document outlines the changes made and how to work with the new implementation.

## Changes Made

1. **Removed Google Places API Dependencies**
   - Removed all direct calls to Google Places API
   - Updated the `places.ts` file to redirect all calls to Mapbox equivalents
   - Removed Google API keys from environment variables

2. **Mapbox Implementation**
   - All location search and business details are now fetched using Mapbox
   - The map component has been updated to use Mapbox GL JS
   - Custom styling has been applied to match the application design

3. **API Routes**
   - The `/api/places/nearby` and `/api/places/details` routes are no longer used
   - All API calls are made directly to Mapbox from the client

## Environment Variables

Only a Mapbox access token is required for the application to function:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here
```

You can obtain a Mapbox token by signing up at [https://account.mapbox.com/](https://account.mapbox.com/).

## Working with Mapbox

### Key Files

- `src/lib/api/mapbox-places.ts` - Contains all Mapbox API functions
- `src/components/map-fullscreen.tsx` - The main map component using Mapbox GL JS

### Main Functions

- `searchNearbyBusinessesWithMapbox` - Find places near a location
- `getBusinessDetailsWithMapbox` - Get details for a specific place
- `searchMapboxBusinesses` - Search for businesses by keyword

### Fallback to Mock Data

If the Mapbox API fails or returns no results, the application will fall back to using mock data:

- `getMockBusinessesNearLocation` - Generate mock businesses near a location
- `searchMockBusinesses` - Search mock businesses by keyword

## Limitations

- Mapbox Places API provides less detailed information than Google Places API
- Photos, reviews, and some business details are generated as placeholders
- The free tier of Mapbox has usage limits that should be monitored

## Future Improvements

- Implement caching for Mapbox API responses
- Enhance the mock data to better match real-world scenarios
- Add more detailed business information from additional sources 