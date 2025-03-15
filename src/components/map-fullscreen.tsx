"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, X, Layers, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MapSearch } from "@/components/search/map-search";
import { SearchResults } from "@/components/map/search-results";
import { BusinessDetails } from "@/components/map/business-details";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import { usePrivy } from '@privy-io/react-auth';
import { toast } from "sonner";
import { searchNearbyBusinesses, getBusinessDetails, Business } from "@/lib/api/places";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

// Storage keys
const LOCATION_STORAGE_KEY = 'ethnica-user-location';
const LOCATION_TIMESTAMP_KEY = 'ethnica-location-timestamp';
// Expiration time for cached location (24 hours in milliseconds)
const LOCATION_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Google Maps container style
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Map options
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#000000"}, {"lightness": 13}]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#144b53"}, {"lightness": 14}, {"weight": 1.4}]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{"color": "#08304b"}]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{"color": "#0c4152"}, {"lightness": 5}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#0b434f"}, {"lightness": 25}]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#0b3d51"}, {"lightness": 16}]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{"color": "#146474"}]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{"color": "#021019"}]
    }
  ]
};

export function MapFullscreen() {
  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // User location state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationAccessDenied, setLocationAccessDenied] = useState(false);

  // Default map settings - will be overridden by user location if available
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [zoom, setZoom] = useState(13);

  const { user, authenticated } = usePrivy();

  // Load cached location from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Check if we have a cached location
        const cachedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
        const cachedTimestamp = localStorage.getItem(LOCATION_TIMESTAMP_KEY);
        
        if (cachedLocation && cachedTimestamp) {
          const location = JSON.parse(cachedLocation) as [number, number];
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          
          // Check if the cached location is still valid (less than 24 hours old)
          if (now - timestamp < LOCATION_CACHE_EXPIRY) {
            const formattedLocation = { lng: location[0], lat: location[1] };
            setUserLocation(formattedLocation);
            setCenter(formattedLocation);
            
            // Filter businesses based on location
            filterBusinessesByLocation(formattedLocation.lng, formattedLocation.lat);
          } else {
            // Cached location expired, request fresh location
            requestLocationAccess();
          }
        } else {
          // No cached location, request fresh location
          requestLocationAccess();
        }
      } catch (error) {
        console.error('Error loading cached location:', error);
        // If there's an error, request fresh location
        requestLocationAccess();
      }
    }
  }, []);

  // Request location access from user
  const requestLocationAccess = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocatingUser(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        };
        
        // Save the user's location in state
        setUserLocation(newLocation);
        setCenter(newLocation);
        
        // Save to localStorage with timestamp
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify([newLocation.lng, newLocation.lat]));
        localStorage.setItem(LOCATION_TIMESTAMP_KEY, Date.now().toString());
        
        // Filter businesses based on new location
        filterBusinessesByLocation(newLocation.lng, newLocation.lat);
        
        setIsLocatingUser(false);
        toast.success("Location accessed successfully!");
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationAccessDenied(true);
        setIsLocatingUser(false);
        
        if (error.code === 1) {
          toast.error("Location access denied. Please enable location services to see businesses near you.");
        } else {
          toast.error("Unable to determine your location. Using default location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Filter businesses based on user's location
  const filterBusinessesByLocation = async (longitude: number, latitude: number) => {
    setIsLoadingResults(true);
    setSearchError(null);
    
    try {
      // Make sure we're using the real API call here
      const results = await searchNearbyBusinesses([longitude, latitude]);
      console.log("API results:", results); // Add this for debugging
      setBusinesses(results);
    } catch (error) {
      console.error("Error fetching nearby businesses:", error);
      setSearchError("Failed to load businesses near you.");
      toast.error("Failed to load businesses");
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    
    if (!userLocation) {
      toast.error("Please enable location to search for businesses near you");
      return;
    }
    
    setIsLoadingResults(true);
    setSearchError(null);
    
    try {
      const results = await searchNearbyBusinesses(
        [userLocation.lng, userLocation.lat],
        query.trim() !== "" ? query : undefined
      );
      
      setBusinesses(results);
    
    // Open sidebar with results
    setSidebarOpen(true);
    setSelectedBusiness(null);
      setShowReviewForm(false);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to load businesses. Please try again later.");
      toast.error("Failed to load businesses");
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Handle location refresh button click
  const handleRefreshLocation = () => {
    requestLocationAccess();
  };

  // Handle business selection
  const handleBusinessSelect = async (business: Business) => {
    setIsLoadingResults(true);
    try {
      // If we have a placeId, get the full details
      if (business.placeId) {
        const details = await getBusinessDetails(business.placeId);
        if (details) {
          setSelectedBusiness(details);
        } else {
          setSelectedBusiness(business);
        }
      } else {
    setSelectedBusiness(business);
      }
      
      setShowReviewForm(false);
      
      // Center the map on the selected business
      if (business.coordinates) {
        setCenter({ 
          lat: business.coordinates[1], 
          lng: business.coordinates[0] 
        });
        setZoom(16);
      }
      
      // Set the active marker
      setActiveMarker(business.id);
    } catch (error) {
      console.error("Error getting business details:", error);
      toast.error("Failed to load business details");
      setSelectedBusiness(business);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Back to results
  const handleBackToResults = () => {
    setSelectedBusiness(null);
    setShowReviewForm(false);
    setActiveMarker(null);
    
    // If user location is available, center there, otherwise use default
    if (userLocation) {
      setCenter(userLocation);
      setZoom(14);
    }
  };

  // Toggle review form
  const handleToggleReviewForm = () => {
    setShowReviewForm(!showReviewForm);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle marker click
  const handleMarkerClick = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setActiveMarker(businessId);
          setSelectedBusiness(business);
          setSidebarOpen(true);
    }
  };

  // Map load callback
  const onMapLoad = useCallback((map) => {
    setMap(map);
    setLoading(false);
  }, []);

  // Render the review form section
  const renderReviewForm = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowReviewForm(false)}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to business
          </Button>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-4">Write a Review for {selectedBusiness.name}</h2>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            // Handle form submission
            console.log('Review submitted');
            setShowReviewForm(false);
          }}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <button 
                    key={i} 
                    type="button"
                    className="text-2xl text-muted-foreground hover:text-yellow-500"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review</label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                rows={5}
                placeholder="Share your experience with this business..."
                required
              />
            </div>
            
            {/* Show user info from Privy */}
            {authenticated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Posting as: {user?.displayName || user?.email?.address}</span>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
              <Button type="submit">Submit Review</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add this helper function near the top of your component
  const getGoogleMapsAnimation = () => {
    return window.google?.maps?.Animation?.BOUNCE || null;
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <p className="text-red-500 font-medium">Error loading Google Maps API</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your API key and internet connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col relative bg-background">
      {/* Top navigation bar - Updated with higher z-index */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm p-2 border-b flex items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-1">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <span className="font-bold text-lg hidden sm:block">
            Ethnica
          </span>
        </div>
        
        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <MapSearch onSearch={handleSearch} />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Location button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshLocation}
            disabled={isLocatingUser}
            className="relative"
          >
            {isLocatingUser ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Compass className="h-4 w-4" />
            )}
            {userLocation && (
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></div>
            )}
            <span className="sr-only">Use my location</span>
          </Button>
          
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Layers className="h-5 w-5" />
            <span className="sr-only">Map layers</span>
          </Button>
          <AuthButton />
        </div>
      </div>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "absolute left-0 top-[57px] bottom-0 z-20 bg-background border-r transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden",
          sidebarOpen ? "w-[360px] opacity-100" : "w-0 opacity-0"
        )}
      >
        {sidebarOpen && (
          <div className="p-4 w-full">
            {showReviewForm && selectedBusiness ? (
              renderReviewForm()
            ) : selectedBusiness ? (
              <BusinessDetails 
                business={selectedBusiness} 
                onBack={handleBackToResults} 
              />
            ) : (
              <div className="flex items-center justify-between mb-4 w-full">
                <div className="w-full">
                  <SearchResults 
                    businesses={businesses} 
                    onSelect={handleBusinessSelect}
                    userLocation={userLocation ? [userLocation.lng, userLocation.lat] : null}
                    isLoading={isLoadingResults}
                    error={searchError}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar}
                  className="absolute top-2 right-2 md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Map container */}
      <div className="flex-1 w-full h-full absolute inset-0" style={{ marginTop: "57px" }}>
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4F46E5",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
                title="Your Location"
              />
            )}

            {/* Business markers */}
            {businesses.map((business) => (
              <Marker
                key={business.id}
                position={{
                  lat: business.coordinates[1],
                  lng: business.coordinates[0],
                }}
                onClick={() => handleMarkerClick(business.id)}
                animation={activeMarker === business.id ? getGoogleMapsAnimation() : null}
                icon={{
                  path: google.maps.SymbolPath.MARKER,
                  scale: 7,
                  fillColor: "#6366F1",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
              >
                {activeMarker === business.id && (
                  <InfoWindow
                    position={{
                      lat: business.coordinates[1],
                      lng: business.coordinates[0],
                    }}
                    onCloseClick={() => setActiveMarker(null)}
                  >
                    <div className="p-2 max-w-[200px]">
                      <h3 className="font-medium text-sm">{business.name}</h3>
                      <p className="text-xs text-gray-600">{business.address}</p>
            </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>
        )}
      </div>
    </div>
  );
} 