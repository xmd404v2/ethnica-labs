import { toast } from "sonner";
import { sampleBusinesses, getMockBusinessesNearLocation, searchMockBusinesses } from '@/lib/sample-businesses';
import { searchNearbyBusinessesWithMapbox, getBusinessDetailsWithMapbox } from './mapbox-places';

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
  placeId?: string;
  name: string;
  category: string;
  description?: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  attributes: string[];
  photos?: string[];
  distance?: number;
  reviews?: BusinessReview[];
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
 * This function now redirects to the Mapbox implementation
 */
export async function searchNearbyBusinesses(
  location: [number, number],
  query?: string,
  radius: number = 5000
): Promise<Business[]> {
  try {
    // Redirect to Mapbox implementation
    return await searchNearbyBusinessesWithMapbox(location, query, radius);
  } catch (error) {
    console.error("Error fetching nearby businesses:", error);
    toast.error("Failed to load business data, using sample data");
    
    // Return mock data if the API call fails
    return query 
      ? searchMockBusinesses(query, location)
      : getMockBusinessesNearLocation(location[1], location[0], radius/1000);
  }
}

/**
 * Get detailed information about a business by its place ID
 * This function now redirects to the Mapbox implementation
 */
export async function getBusinessDetails(placeId: string): Promise<Business | null> {
  try {
    // Redirect to Mapbox implementation
    return await getBusinessDetailsWithMapbox(placeId);
  } catch (error) {
    console.error("Error fetching business details:", error);
    toast.error("Failed to load business details, using sample data");
    
    // Try to find the business in our mock data
    const mockBusiness = sampleBusinesses.find(b => b.placeId === placeId || b.id === placeId);
    return mockBusiness || null;
  }
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