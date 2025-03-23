import { Business } from "@/lib/api/places";

// Helper function to generate random coordinates around a center point
const generateRandomCoords = (centerLat: number, centerLng: number, radiusKm: number = 2): [number, number] => {
  // Earth's radius in km
  const R = 6371;
  
  // Convert radius from km to degrees
  const radiusInDegrees = radiusKm / R;
  
  // Random angle
  const angle = Math.random() * 2 * Math.PI;
  
  // Random distance within radius
  const distance = Math.random() * radiusInDegrees;
  
  // Calculate offsets
  const latOffset = distance * Math.cos(angle);
  const lngOffset = distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
  
  // Return new coordinates
  return [centerLng + lngOffset, centerLat + latOffset];
};

// Helper to generate a random integer in a range
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to generate a random float in a range
const randomFloat = (min: number, max: number, decimals: number = 1): number => {
  const rand = Math.random() * (max - min) + min;
  const power = Math.pow(10, decimals);
  return Math.round(rand * power) / power;
};

// Sample photo arrays - to simulate multiple photos per business
const samplePhotoSets = [
  [
    "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAUjq9jlcv4XBPluR5wS-1IvVTCv4hA1lEchJVZm87qoLSoArwa2j2JQpD_JU4jXGgWgvJzLRkxzwcnHcVkQwBgkUJg5FKHZ2YXdDYW67Vl0yJnJsqBpX8VvLrTmz7IRRKbwhWZfSJSRKP9R8KlOIQymJP_D4_P_nOppnGSlI9FMrpEiH6s&3u800&5m1&2e1&callback=none&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&token=15150",
    "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAUjq9jmXBDI7qqPytTZwMqU9vwvlITqk1YUdxMpBuHSj64cozjA9089VGhPXsXyBbgtSEe5L0t76aCCbjxC03XQ2GPxqgaJwsgEqp7W91KXf9tZTVNMYMwm_pjCITVYH4tE9jIwmL_VmE6ZJV6R56qv_5rlsBPVPKLtOyREwg0Q8LKCuI&3u1080&5m1&2e1&callback=none&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&token=120409"
  ],
  [
    "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAUjq9jkZYS8vZe5Uw3-qR7KR4F_BzC05h1d-Vj8rgKY8SP-K0c4YG3F-_F3YZOXTTSEi3JKFMr-NAT36KIq0I5hQ04NQZjgF9iRdnCqvOQH1z0PDfZLwOKTLp7wW5DZX4bVl1eHWbMMxmgS_MrfYtLdQZMgZaADKdHrgJHdX9XeV2OIBD4&3u4032&5m1&2e1&callback=none&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&token=99114",
    "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAUjq9jnlkpOzqnpxpaAIlDsgaI3JFhzXw7aaCI2RSIO_NDCfb-rHKfIrj4OfP3TW94LHWjwFbjzMqCgYqA2dxp1TNcLgF2wkLCYuQNEWvV2TkJFcHX3XHlSzPo71U9gp5K1wg7CXRT8O-NL0wv7tB2Y8Fs5l0wTzCYaMRcMXJiGJtqoDkL&3u4032&5m1&2e1&callback=none&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&token=59386"
  ],
  [
    "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAUjq9jl4M5PzmgWWKgNILgM4Jw0WnvF9R5SG-9lE-p8J4lUvB8JDcWxvKfSbI1VC6F6OgOZHEHNp-iuwN0FWhWfIXlDXsm5lrxuWLq6TaJLdD7vUcPVQd2uDjIVlnSNaTVyQXzj8RCKMIl8MzTAu04vRiygYx1Lw9zMU1EbEPxCt40Hl3e&3u4032&5m1&2e1&callback=none&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&token=108797",
    "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAUjq9jm43oNAa5DzZoXCO7MpR_SLcZfK-FbeTDFqLJQ_hF0OgZM3Xm941KnOVsyVqXAEKCZ4QWEELmg6FP5UGqrr0EgEj9Iy5HN_C4lVFQ2pPZ8iqm3E8pOB9LjfBqCuOKd4QH1mYQ_4_tjeTzCLQxDEZNc8YSyGHisnG1I7jVY_0gqMIt&3u4032&5m1&2e1&callback=none&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&token=48766"
  ]
];

// Placeholder photos using placeholder.com (in case the Google photos don't work)
const placeholderPhotos = [
  ["https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Restaurant"],
  ["https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Cafe"],
  ["https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Shop"],
  ["https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Grocery"],
  ["https://via.placeholder.com/400x300/F43F5E/FFFFFF?text=Bakery"]
];

// Business categories
const categories = [
  "Restaurant", "Café", "Bar", "Bakery", "Coffee Shop", 
  "Grocery", "Bookstore", "Clothing Store", "Electronics", 
  "Beauty Salon", "Hardware Store", "Pharmacy", "Gym",
  "Art Gallery", "Gift Shop", "Yoga Studio", "Pet Store",
  "Florist", "Food Truck", "Jewelry Store"
];

// Business attributes
const attributes = [
  "Woman Owned", "Black Owned", "LGBTQ+ Owned", "Latino Owned", "Asian Owned",
  "Veteran Owned", "Locally Owned", "Family Owned", "Sustainable", 
  "Organic", "Vegan Options", "Fair Trade", "Eco-Friendly",
  "Minority Owned", "Ethical Business", "Budget Friendly", "Premium", "Highly Rated"
];

// Base coordinates for San Francisco
const baseLat = 37.7749;
const baseLng = -122.4194;

// Generate sample businesses around San Francisco
export const sampleBusinesses: Business[] = Array.from({ length: 25 }, (_, i) => {
  const coords = generateRandomCoords(baseLat, baseLng, 5);
  const category = categories[randomInt(0, categories.length - 1)];
  
  // Select 2-4 random attributes
  const attributeCount = randomInt(2, 4);
  const selectedAttributes: string[] = [];
  for (let j = 0; j < attributeCount; j++) {
    const attr = attributes[randomInt(0, attributes.length - 1)];
    if (!selectedAttributes.includes(attr)) {
      selectedAttributes.push(attr);
    }
  }
  
  // Generate a random distance (0.5-8 km)
  const distance = randomFloat(0.5, 8, 1);
  
  // Select a photo set
  const photoIndex = randomInt(0, samplePhotoSets.length - 1);
  // Get either Google photos or placeholder as fallback
  const photos = Math.random() > 0.2 ? samplePhotoSets[photoIndex] : placeholderPhotos[photoIndex % placeholderPhotos.length];
  
  // Generate rating (3.0-5.0)
  const rating = randomFloat(3.0, 5.0, 1);
  
  // Generate review count (5-200)
  const reviewCount = randomInt(5, 200);
  
  // Use a template for consistent business names
  const nameTemplates = [
    `${["The", "Happy", "Golden", "Green", "Blue", "Urban", "Rustic", "Modern", "Classic"][randomInt(0, 8)]} ${category}`,
    `${["Sunshine", "Mountain", "Ocean", "City", "Garden", "Valley", "River"][randomInt(0, 6)]} ${category}`,
    `${["Fresh", "Tasty", "Artisan", "Organic", "Premium", "Craft", "Homemade"][randomInt(0, 6)]} ${category}`,
    `${category} ${["House", "Corner", "Spot", "Place", "Station", "Hub", "Market"][randomInt(0, 6)]}`,
    `${["San Francisco", "SF", "Bay Area", "Golden Gate", "Mission", "SoMa", "Marina"][randomInt(0, 6)]} ${category}`
  ];
  
  const name = nameTemplates[randomInt(0, nameTemplates.length - 1)];
  const priceLevel = randomInt(1, 4);
  
  // Generate fake place ID
  const placeId = `place_id_${i}_${Math.random().toString(36).substring(2, 15)}`;
  
  return {
    id: `business-${i}`,
    placeId,
    name,
    category,
    description: `A wonderful ${category.toLowerCase()} offering a variety of products and services in the San Francisco area.`,
    address: `${randomInt(1, 999)} ${["Market", "Mission", "Valencia", "Castro", "Fillmore", "Divisadero", "Haight", "Irving"][randomInt(0, 7)]} St, San Francisco, CA`,
    coordinates: coords,
    rating,
    reviewCount,
    phone: `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    website: `https://example.com/${name.toLowerCase().replace(/\s+/g, '-')}`,
    attributes: selectedAttributes,
    photos,
    distance,
    openNow: Math.random() > 0.3, // 70% chance of being open
    priceLevel,
    reviews: Array.from({ length: randomInt(1, 5) }, (_, j) => ({
      id: `review-${i}-${j}`,
      rating: randomInt(3, 5),
      text: "This place is amazing! I highly recommend checking it out when you're in the area.",
      author: `User${randomInt(1000, 9999)}`,
      time: Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000 // Random time in the last 30 days
    }))
  };
});

// Update the getMockBusinessesNearLocation function to generate businesses on demand
export function getMockBusinessesNearLocation(lat: number, lng: number, radius: number = 5): Business[] {
  // If we don't already have generated businesses for this location or if it's a first call
  // Generate businesses around the provided coordinates instead of using the pre-generated SF businesses
  const dynamicBusinesses: Business[] = Array.from({ length: 25 }, (_, i) => {
    const coords = generateRandomCoords(lat, lng, radius * 0.8); // Use 80% of the radius to ensure they're within range
    const category = categories[randomInt(0, categories.length - 1)];
    
    // Select 2-4 random attributes
    const attributeCount = randomInt(2, 4);
    const selectedAttributes: string[] = [];
    for (let j = 0; j < attributeCount; j++) {
      const attr = attributes[randomInt(0, attributes.length - 1)];
      if (!selectedAttributes.includes(attr)) {
        selectedAttributes.push(attr);
      }
    }
    
    // Calculate actual distance from the provided location
    const distance = calculateDistance(
      lat,
      lng,
      coords[1],
      coords[0]
    );
    
    // Select a photo set
    const photoIndex = randomInt(0, samplePhotoSets.length - 1);
    // Get either Google photos or placeholder as fallback
    const photos = Math.random() > 0.2 ? samplePhotoSets[photoIndex] : placeholderPhotos[photoIndex % placeholderPhotos.length];
    
    // Generate rating (3.0-5.0)
    const rating = randomFloat(3.0, 5.0, 1);
    
    // Generate review count (5-200)
    const reviewCount = randomInt(5, 200);
    
    // Use a template for consistent business names
    const nameTemplates = [
      `${["The", "Happy", "Golden", "Green", "Blue", "Urban", "Rustic", "Modern", "Classic"][randomInt(0, 8)]} ${category}`,
      `${["Sunshine", "Mountain", "Ocean", "City", "Garden", "Valley", "River"][randomInt(0, 6)]} ${category}`,
      `${["Fresh", "Tasty", "Artisan", "Organic", "Premium", "Craft", "Homemade"][randomInt(0, 6)]} ${category}`,
      `${category} ${["House", "Corner", "Spot", "Place", "Station", "Hub", "Market"][randomInt(0, 6)]}`,
      `${["Local", "Neighborhood", "Community", "Family", "Friendly", "Cozy", "Trendy"][randomInt(0, 6)]} ${category}`
    ];
    
    const name = nameTemplates[randomInt(0, nameTemplates.length - 1)];
    const priceLevel = randomInt(1, 4);
    
    // Generate fake place ID
    const placeId = `place_id_${i}_${Math.random().toString(36).substring(2, 15)}`;
    
    // For address, use a generic format rather than SF-specific streets
    const streetNames = ["Main", "Oak", "Maple", "Cedar", "Pine", "Elm", "Park", "Lake", "River", "Hill", "Valley", "Mountain", "Ocean"];
    const streetTypes = ["St", "Ave", "Blvd", "Dr", "Ln", "Rd", "Way", "Pl", "Ct"];
    
    return {
      id: `business-${i}`,
      placeId,
      name,
      category,
      description: `A wonderful ${category.toLowerCase()} offering a variety of products and services in your area.`,
      address: `${randomInt(1, 999)} ${streetNames[randomInt(0, streetNames.length - 1)]} ${streetTypes[randomInt(0, streetTypes.length - 1)]}`,
      coordinates: coords,
      rating,
      reviewCount,
      phone: `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      website: `https://example.com/${name.toLowerCase().replace(/\s+/g, '-')}`,
      attributes: selectedAttributes,
      photos,
      distance,
      openNow: Math.random() > 0.3, // 70% chance of being open
      priceLevel,
      reviews: Array.from({ length: randomInt(1, 5) }, (_, j) => ({
        id: `review-${i}-${j}`,
        rating: randomInt(3, 5),
        text: "This place is amazing! I highly recommend checking it out when you're in the area.",
        author: `User${randomInt(1000, 9999)}`,
        time: Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000 // Random time in the last 30 days
      }))
    };
  });
  
  // Return the dynamically generated businesses, sorted by distance
  return dynamicBusinesses.sort((a, b) => {
    // Handle undefined distance values
    const distanceA = a.distance ?? Infinity;
    const distanceB = b.distance ?? Infinity;
    return distanceA - distanceB;
  });
}

// Helper to calculate distance between coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Export a function to search for businesses by keyword
export function searchMockBusinesses(keyword: string, location: [number, number]): Business[] {
  // Get businesses near the location using our dynamic generator
  const nearbyBusinesses = getMockBusinessesNearLocation(location[1], location[0], 10); // Use larger radius for search
  
  if (!keyword || keyword.trim() === '') {
    return nearbyBusinesses;
  }
  
  const searchTerm = keyword.toLowerCase();
  
  // Filter businesses by keyword match
  const filtered = nearbyBusinesses.filter(business => 
    business.name.toLowerCase().includes(searchTerm) ||
    business.category.toLowerCase().includes(searchTerm) ||
    (business.description?.toLowerCase().includes(searchTerm) || false) ||
    business.attributes.some(attr => attr.toLowerCase().includes(searchTerm))
  );
  
  // If no results found with the existing businesses, create some that match the search term
  if (filtered.length === 0) {
    // Find a matching category if possible
    const matchingCategory = categories.find(cat => cat.toLowerCase().includes(searchTerm));
    
    if (matchingCategory) {
      // Generate 3-5 businesses specifically for this search term
      const count = randomInt(3, 5);
      const customBusinesses = Array.from({ length: count }, (_, i) => {
        const coords = generateRandomCoords(location[1], location[0], 3);
        const distance = calculateDistance(
          location[1],
          location[0],
          coords[1],
          coords[0]
        );
        
        // Use mostly the same logic as in getMockBusinessesNearLocation but with the matching category
        const photoIndex = randomInt(0, samplePhotoSets.length - 1);
        const photos = Math.random() > 0.2 ? samplePhotoSets[photoIndex] : placeholderPhotos[photoIndex % placeholderPhotos.length];
        
        const streetNames = ["Main", "Oak", "Maple", "Cedar", "Pine", "Elm", "Park"];
        const streetTypes = ["St", "Ave", "Blvd", "Dr", "Ln", "Rd", "Way"];
        
        return {
          id: `search-${i}-${Math.random().toString(36).substring(2, 10)}`,
          placeId: `place_search_${i}_${Math.random().toString(36).substring(2, 15)}`,
          name: `${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} ${matchingCategory}`,
          category: matchingCategory,
          description: `A fantastic ${matchingCategory.toLowerCase()} specializing in ${searchTerm} options.`,
          address: `${randomInt(1, 999)} ${streetNames[randomInt(0, streetNames.length - 1)]} ${streetTypes[randomInt(0, streetTypes.length - 1)]}`,
          coordinates: coords,
          rating: randomFloat(4.0, 5.0, 1), // Higher ratings for search results
          reviewCount: randomInt(5, 200),
          phone: `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
          website: `https://example.com/${searchTerm.toLowerCase().replace(/\s+/g, '-')}`,
          attributes: [attributes[randomInt(0, attributes.length - 1)], attributes[randomInt(0, attributes.length - 1)]],
          photos,
          distance,
          openNow: true, // Search results are always open
          priceLevel: randomInt(1, 4),
          reviews: Array.from({ length: randomInt(1, 5) }, (_, j) => ({
            id: `review-search-${i}-${j}`,
            rating: randomInt(4, 5),
            text: `Great place with excellent ${searchTerm} options!`,
            author: `User${randomInt(1000, 9999)}`,
            time: Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000
          }))
        };
      });
      
      return customBusinesses;
    }
  }
  
  return filtered;
} 