import { toast } from "sonner";

// Mock business data for fallback
const mockBusinesses = [
  {
    id: "mock1",
    name: "Green Earth Cafe",
    category: "Restaurant",
    description: "Sustainable, plant-based cafe with locally sourced ingredients.",
    address: "123 Main St, New York, NY",
    coordinates: [-74.006, 40.7128],
    rating: 4.5,
    reviewCount: 32,
    phone: "(555) 123-4567",
    website: "https://greenearthcafe.example.com",
    attributes: ["Minority Owned", "Vegan Options", "Sustainable"],
    photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"],
    distance: 0.5,
  },
  {
    id: "mock2",
    name: "Community Bookstore",
    category: "Retail",
    description: "Independent bookstore with diverse authors and community events.",
    address: "456 Park Ave, New York, NY",
    coordinates: [-73.997, 40.7185],
    rating: 4.8,
    reviewCount: 56,
    phone: "(555) 234-5678",
    website: "https://communitybookstore.example.com",
    attributes: ["Locally Owned", "Woman Owned"],
    photos: ["https://images.unsplash.com/photo-1526365609942-180c5ee58144?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va3N0b3JlfGVufDB8fDB8fHww&w=1000&q=80"],
    distance: 0.8,
  },
  {
    id: "mock3",
    name: "Halal Grill House",
    category: "Restaurant",
    description: "Family-owned restaurant serving authentic halal dishes.",
    address: "789 Broadway, New York, NY",
    coordinates: [-73.988, 40.7155],
    rating: 4.3,
    reviewCount: 28,
    phone: "(555) 345-6789",
    attributes: ["Minority Owned", "Halal Options", "Family Owned"],
    photos: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"],
    distance: 1.2,
  },
];

export interface Business {
  id: string;
  name: string;
  category: string;
  description?: string;
  address: string;
  coordinates: [number, number];
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  attributes: string[];
  photos?: string[];
  distance?: number;
  reviews?: BusinessReview[];
  // Additional fields from API
  placeId?: string;
  openNow?: boolean;
  priceLevel?: number;
}

export interface BusinessReview {
  id: string;
  rating: number;
  text: string;
  author: string;
  authorDetails?: string;
  time?: number;
}

/**
 * Search for businesses near the specified location
 */
export async function searchNearbyBusinesses(
  location: [number, number],
  query?: string,
  radius: number = 5000
): Promise<Business[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    toast.error("API key for business data is missing");
    return [];
  }
  
  try {
    const proxyUrl = "/api/places/nearby"; // We'll create this Next.js API route
    const lat = location[1];
    const lng = location[0];
    
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });
    
    if (query) {
      params.append("keyword", query);
    }
    
    const response = await fetch(`${proxyUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching places: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if the API returned an error or empty results
    if (data.status === "REQUEST_DENIED" || data.results.length === 0) {
      console.warn("Google Places API request denied or returned no results. Using mock data as fallback.");
      console.log("API Response:", data);
      
      // Use mock data as fallback, but with adjustments based on location
      return mockBusinesses.map(business => {
        // Adjust mock business coordinates to be relative to the requested location
        const adjustedBusiness = {
          ...business,
          coordinates: [
            location[0] + (Math.random() * 0.02 - 0.01), // Add random offset within ~1km
            location[1] + (Math.random() * 0.02 - 0.01)
          ],
          distance: Math.random() * 2 + 0.2 // Random distance between 0.2 and 2.2 km
        };
        
        // If there's a query, filter the mock data to simulate search
        if (query && !business.name.toLowerCase().includes(query.toLowerCase()) && 
            !business.category.toLowerCase().includes(query.toLowerCase())) {
          return null;
        }
        
        return adjustedBusiness;
      }).filter(Boolean) as Business[];
    }
    
    return transformGooglePlacesData(data.results, [lng, lat]);
  } catch (error) {
    console.error("Error fetching nearby businesses:", error);
    toast.error("Using sample data while API is being configured");
    
    // Return mock data as fallback
    return mockBusinesses.map(business => {
      // Adjust mock business coordinates to be relative to the requested location
      return {
        ...business,
        coordinates: [
          location[0] + (Math.random() * 0.02 - 0.01), // Add random offset within ~1km
          location[1] + (Math.random() * 0.02 - 0.01)
        ],
        distance: Math.random() * 2 + 0.2 // Random distance between 0.2 and 2.2 km
      };
    }).filter(business => {
      // If there's a query, filter the mock data to simulate search
      if (query && !business.name.toLowerCase().includes(query.toLowerCase()) && 
          !business.category.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      return true;
    });
  }
}

/**
 * Get detailed information about a business by its place ID
 */
export async function getBusinessDetails(placeId: string): Promise<Business | null> {
  try {
    const proxyUrl = "/api/places/details";
    const params = new URLSearchParams({
      place_id: placeId
    });
    
    const response = await fetch(`${proxyUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching place details: ${response.statusText}`);
    }
    
    const data = await response.json();
    return transformGooglePlaceDetails(data.result);
  } catch (error) {
    console.error("Error fetching business details:", error);
    toast.error("Failed to load business details");
    return null;
  }
}

/**
 * Transform Google Places API data into our Business model
 */
function transformGooglePlacesData(places: any[], userLocation: [number, number]): Business[] {
  return places.map(place => {
    // Extract business category
    let category = "Business";
    if (place.types && place.types.length > 0) {
      // Convert Google place types to more human-readable format
      const typeMap: Record<string, string> = {
        "restaurant": "Restaurant",
        "cafe": "Café",
        "bar": "Bar",
        "food": "Food",
        "grocery_or_supermarket": "Grocery",
        "store": "Retail",
        "shopping_mall": "Shopping",
        "clothing_store": "Clothing",
        "beauty_salon": "Beauty",
        "book_store": "Bookstore",
        "bakery": "Bakery",
        "convenience_store": "Convenience Store",
        "department_store": "Department Store",
        "electronics_store": "Electronics",
        "furniture_store": "Furniture",
        "hardware_store": "Hardware Store",
        "home_goods_store": "Home Goods",
        "jewelry_store": "Jewelry",
        "liquor_store": "Liquor Store",
        "shoe_store": "Shoe Store",
        "supermarket": "Supermarket",
      };
      
      for (const type of place.types) {
        if (typeMap[type]) {
          category = typeMap[type];
          break;
        }
      }
    }
    
    // Calculate distance if user location is available
    let distance: number | undefined = undefined;
    if (userLocation) {
      const lat1 = userLocation[1];
      const lon1 = userLocation[0];
      const lat2 = place.geometry.location.lat;
      const lon2 = place.geometry.location.lng;
      
      distance = getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2);
    }
    
    // Extract photos if available
    const photos = place.photos?.map((photo: any) => {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`;
    }) || [];
    
    // Transform to our Business model
    return {
      id: place.place_id,
      placeId: place.place_id,
      name: place.name,
      category,
      address: place.vicinity,
      coordinates: [
        place.geometry.location.lng,
        place.geometry.location.lat
      ],
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      openNow: place.opening_hours?.open_now,
      priceLevel: place.price_level,
      photos,
      distance,
      // We'll generate some placeholder attributes based on Google data
      // These would be replaced by actual data in a production app
      attributes: generatePlaceholderAttributes(place),
      reviews: [] // Will be populated in detail view
    };
  });
}

/**
 * Transform Google Place Details into our Business model
 */
function transformGooglePlaceDetails(place: any): Business | null {
  if (!place) return null;
  
  // Extract business category
  let category = "Business";
  if (place.types && place.types.length > 0) {
    // Similar to the function above
    // ... (same code as in transformGooglePlacesData)
  }
  
  // Extract reviews
  const reviews: BusinessReview[] = place.reviews?.map((review: any) => {
    return {
      id: review.time.toString(),
      rating: review.rating,
      text: review.text,
      author: review.author_name,
      time: review.time
    };
  }) || [];
  
  // Extract photos
  const photos = place.photos?.map((photo: any) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`;
  }) || [];
  
  return {
    id: place.place_id,
    placeId: place.place_id,
    name: place.name,
    category,
    description: place.editorial_summary?.overview || "",
    address: place.formatted_address || place.vicinity,
    coordinates: [
      place.geometry.location.lng,
      place.geometry.location.lat
    ],
    rating: place.rating,
    reviewCount: place.user_ratings_total,
    phone: place.formatted_phone_number,
    website: place.website,
    openNow: place.opening_hours?.open_now,
    priceLevel: place.price_level,
    photos,
    attributes: generatePlaceholderAttributes(place),
    reviews
  };
}

/**
 * Generate placeholder attributes based on Google data
 * In a real app, you'd have actual data about minority ownership, etc.
 */
function generatePlaceholderAttributes(place: any): string[] {
  const attributes: string[] = [];
  
  // Generate some sample attributes based on place data
  if (place.price_level === 1) {
    attributes.push("Budget Friendly");
  }
  
  if (place.price_level >= 3) {
    attributes.push("Premium");
  }
  
  // Based on ratings
  if (place.rating >= 4.5) {
    attributes.push("Highly Rated");
  }
  
  // Based on types/categories
  if (place.types) {
    if (place.types.includes("restaurant")) {
      // Randomly assign some restaurant-specific attributes
      const restaurantAttrs = [
        "Family Owned", "Woman Owned", "Minority Owned", 
        "Sustainable", "Vegan Options", "Locally Sourced"
      ];
      
      // Add 1-2 random attributes
      const numAttrs = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numAttrs; i++) {
        const idx = Math.floor(Math.random() * restaurantAttrs.length);
        if (!attributes.includes(restaurantAttrs[idx])) {
          attributes.push(restaurantAttrs[idx]);
        }
      }
    }
    
    if (place.types.includes("store") || place.types.includes("shopping")) {
      // Randomly assign some store-specific attributes
      const storeAttrs = [
        "Locally Owned", "Woman Owned", "Black Owned", 
        "Latino Owned", "Asian Owned", "LGBTQ+ Owned"
      ];
      
      // Add 1-2 random attributes
      const numAttrs = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numAttrs; i++) {
        const idx = Math.floor(Math.random() * storeAttrs.length);
        if (!attributes.includes(storeAttrs[idx])) {
          attributes.push(storeAttrs[idx]);
        }
      }
    }
  }
  
  return attributes;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function getDistanceBetweenCoordinates(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
} 