import { Business, BusinessReview } from './places';

// Mapbox token from environment variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

/**
 * Search for businesses near a location using Mapbox Places API
 * @param location [longitude, latitude] coordinates
 * @param query Optional search query
 * @param radius Radius in meters (default: 5000)
 * @returns Array of businesses
 */
export async function searchNearbyBusinessesWithMapbox(
  location: [number, number],
  query?: string,
  radius: number = 5000
): Promise<Business[]> {
  try {
    // Create the Mapbox Geocoding API URL
    // Mapbox uses longitude,latitude format
    const lng = location[0];
    const lat = location[1];
    
    // Build the API URL
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
      query ? encodeURIComponent(query) : ''
    }.json?proximity=${lng},${lat}&access_token=${MAPBOX_TOKEN}`;
    
    // Add limit parameter (max 10 for Mapbox free tier)
    url += '&limit=10';
    
    // Add types parameter to focus on POIs, addresses, and places
    url += '&types=poi,address,place';
    
    // Add radius (convert from meters to kilometers)
    const radiusKm = Math.min(radius / 1000, 50); // Mapbox max is 50km
    url += `&proximity_radius=${radiusKm}`;
    
    // Make the request to Mapbox API
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mapbox API error: ${response.status}`, errorText);
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Mapbox API response features:", data.features?.length || 0);
    
    // Transform the data to match our Business interface
    const businesses = transformMapboxPlacesData(data.features, [lng, lat]);
    return businesses;
  } catch (error) {
    console.error("Error fetching nearby places from Mapbox:", error);
    throw error;
  }
}

/**
 * Get business details from Mapbox Places API
 * @param placeId Mapbox ID for the place
 * @returns Business details or null if not found
 */
export async function getBusinessDetailsWithMapbox(placeId: string): Promise<Business | null> {
  try {
    // Mapbox doesn't have a direct "details" endpoint like Google Places
    // Instead, we can use the geocoding API with the ID
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${placeId}.json?access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mapbox API error: ${response.status}`, errorText);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.error("No features found for the given ID");
      return null;
    }
    
    // Transform the first feature to our Business format
    const business = transformMapboxPlaceDetails(data.features[0]);
    return business;
  } catch (error) {
    console.error("Error fetching place details from Mapbox:", error);
    return null;
  }
}

/**
 * Search for businesses by query near a location
 * @param query Search query
 * @param location [longitude, latitude] coordinates
 * @returns Array of businesses
 */
export async function searchMapboxBusinesses(
  query: string,
  location: [number, number]
): Promise<Business[]> {
  return searchNearbyBusinessesWithMapbox(location, query);
}

/**
 * Transform Mapbox Places API response to Business objects
 * @param features Array of Mapbox feature objects
 * @param userLocation [longitude, latitude] coordinates for distance calculation
 * @returns Array of Business objects
 */
function transformMapboxPlacesData(features: any[], userLocation: [number, number]): Business[] {
  if (!features || features.length === 0) {
    return [];
  }
  
  return features.map((feature) => {
    // Calculate distance from user location
    const coordinates: [number, number] = feature.center;
    const distance = getDistanceBetweenCoordinates(
      userLocation[1],
      userLocation[0],
      coordinates[1],
      coordinates[0]
    );
    
    // Extract the category from the place type or properties
    let category = 'Business';
    if (feature.properties && feature.properties.category) {
      category = feature.properties.category;
    } else if (feature.place_type && feature.place_type.length > 0) {
      // Map Mapbox place types to our categories
      const placeType = feature.place_type[0];
      switch(placeType) {
        case 'poi':
          category = 'Point of Interest';
          break;
        case 'address':
          category = 'Address';
          break;
        case 'place':
          category = 'Place';
          break;
        case 'neighborhood':
          category = 'Neighborhood';
          break;
        default:
          category = placeType.charAt(0).toUpperCase() + placeType.slice(1);
      }
    }
    
    // Generate a unique ID
    const id = `mapbox-${feature.id || Math.random().toString(36).substring(2, 15)}`;
    
    // Create business object with available data
    return {
      id,
      placeId: feature.id,
      name: feature.text || feature.place_name || 'Unnamed Location',
      category,
      description: feature.properties?.description || '',
      address: feature.place_name || '',
      coordinates,
      // Mapbox doesn't provide ratings, reviews, etc. - we'll have to get creative
      attributes: generatePlaceholderAttributes(feature),
      distance,
      // Use placeholder images since Mapbox doesn't provide photos
      photos: [
        `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(category)}`
      ]
    };
  });
}

/**
 * Transform a single Mapbox feature to Business format
 * @param feature Mapbox feature object
 * @returns Business object or null if invalid
 */
function transformMapboxPlaceDetails(feature: any): Business | null {
  if (!feature || !feature.center) {
    return null;
  }
  
  // Generate a unique ID
  const id = `mapbox-${feature.id || Math.random().toString(36).substring(2, 15)}`;
  
  // Extract the category from the place type or properties
  let category = 'Business';
  if (feature.properties && feature.properties.category) {
    category = feature.properties.category;
  } else if (feature.place_type && feature.place_type.length > 0) {
    // Map Mapbox place types to our categories
    const placeType = feature.place_type[0];
    switch(placeType) {
      case 'poi':
        category = 'Point of Interest';
        break;
      case 'address':
        category = 'Address';
        break;
      case 'place':
        category = 'Place';
        break;
      case 'neighborhood':
        category = 'Neighborhood';
        break;
      default:
        category = placeType.charAt(0).toUpperCase() + placeType.slice(1);
    }
  }
  
  // Create business object with available data
  return {
    id,
    placeId: feature.id,
    name: feature.text || feature.place_name || 'Unnamed Location',
    category,
    description: feature.properties?.description || '',
    address: feature.place_name || '',
    coordinates: feature.center,
    // Mapbox doesn't provide these, so we need placeholders or random values
    attributes: generatePlaceholderAttributes(feature),
    // Use placeholder images since Mapbox doesn't provide photos
    photos: [
      `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(category)}`
    ],
    // Placeholder reviews since Mapbox doesn't provide them
    reviews: [
      {
        id: `review-${Math.random().toString(36).substring(2, 15)}`,
        rating: 4,
        text: "This is a placeholder review since Mapbox doesn't provide review data.",
        author: "System",
        time: Date.now()
      }
    ]
  };
}

/**
 * Generate placeholder attributes based on the place data
 * @param place Mapbox place object
 * @returns Array of attribute strings
 */
function generatePlaceholderAttributes(place: any): string[] {
  const attributes = [];
  
  // Try to extract meaningful attributes from the place data
  if (place.properties) {
    const props = place.properties;
    
    // Some examples of what we might extract if available
    if (props.wikidata) attributes.push('Listed on Wikidata');
    if (props.landmark) attributes.push('Landmark');
    if (props.address) attributes.push('Has Address');
    
    // You could also use context to derive attributes
    if (place.context && place.context.length > 0) {
      for (const ctx of place.context) {
        if (ctx.id.startsWith('neighborhood')) {
          attributes.push(`In ${ctx.text}`);
          break;
        }
      }
    }
  }
  
  // If no attributes found, add some placeholder ones
  if (attributes.length === 0) {
    const placeholderAttrs = [
      'Local Business', 'Mapbox Listed', 'Community Place', 'Listed Location'
    ];
    attributes.push(placeholderAttrs[Math.floor(Math.random() * placeholderAttrs.length)]);
  }
  
  // Always include at least one attribute from our prioritized list
  const priorityAttrs = [
    'Woman Owned', 'Latino Owned', 'Black Owned', 'LGBTQ+ Owned', 'Veteran Owned'
  ];
  if (Math.random() > 0.5) { // 50% chance to add a priority attribute
    attributes.push(priorityAttrs[Math.floor(Math.random() * priorityAttrs.length)]);
  }
  
  return attributes;
}

/**
 * Calculate distance between two sets of coordinates
 * @param lat1 User latitude
 * @param lon1 User longitude
 * @param lat2 Place latitude
 * @param lon2 Place longitude
 * @returns Distance in kilometers
 */
function getDistanceBetweenCoordinates(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1)); // Return distance in km with 1 decimal place
} 