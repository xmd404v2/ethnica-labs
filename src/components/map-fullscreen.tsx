"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Menu, X, Layers, Compass, Star, MapPin } from "lucide-react";
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
import { Business } from "@/lib/api/places";
import { getMockBusinessesNearLocation, searchMockBusinesses } from "@/lib/sample-businesses";
import { Map, Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { searchMapboxBusinesses, searchNearbyBusinessesWithMapbox, getBusinessDetailsWithMapbox } from "@/lib/api/mapbox-places";

// Storage keys
const LOCATION_STORAGE_KEY = 'ethnica-user-location';
const LOCATION_TIMESTAMP_KEY = 'ethnica-location-timestamp';
// Expiration time for cached location (24 hours in milliseconds)
const LOCATION_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Mapbox token from environment variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Use a monochrome base style for reduced cognitive load and better focus on important elements
const mapStyle = "mapbox://styles/mapbox/navigation-night-v1";

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
  // Track API initialization error separately
  const [apiInitialized, setApiInitialized] = useState(true); // Default to true for Mapbox
  const [mapError, setMapError] = useState<string | null>(null);

  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<Business | null>(null);

  // User location state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationAccessDenied, setLocationAccessDenied] = useState(false);

  // Default map settings - will be overridden by user location if available
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [zoom, setZoom] = useState(13);
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 13
  });

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
      // Fall back to default location
      filterBusinessesByLocation(center.lng, center.lat);
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
        // Enhanced error handling with more specific messages
        let errorMessage = "Unable to determine your location. Using default location.";
        console.error(`Geolocation error (code ${error.code}):`, error.message || "No error details");
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location access denied. Please enable location services to see businesses near you.";
            setLocationAccessDenied(true);
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Unable to determine your location. Using a default location instead.";
            // Not setting locationAccessDenied here as it's a temporary technical issue, not a permissions issue
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. Using default location.";
            break;
        }
        
        setIsLocatingUser(false);
        
        // Use toast.warning instead of toast.error for position unavailable
        if (error.code === 2) {
          toast.warning(errorMessage);
        } else {
          toast.error(errorMessage);
        }
        
        // Use sample data centered at the default location
        filterBusinessesByLocation(center.lng, center.lat);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to give more time
        maximumAge: 60000
      }
    );
  };

  // Filter businesses based on user's location
  const filterBusinessesByLocation = async (longitude: number, latitude: number) => {
    setIsLoadingResults(true);
    setSearchError(null);
    
    try {
      // Use the Mapbox Places API instead of mock data
      const results = await searchNearbyBusinessesWithMapbox([longitude, latitude]);
      console.log("Using Mapbox data:", results.length, "businesses found");
      
      if (results.length === 0) {
        // If no results, try with mock data as fallback
        console.log("No results from Mapbox, falling back to mock data");
        const mockResults = getMockBusinessesNearLocation(latitude, longitude, 10);
        setBusinesses(mockResults);
        
        if (mockResults.length > 0) {
          console.log("Found businesses with mock data:", mockResults.length);
        } else {
          console.log("No businesses found with mock data either");
          setSearchError("No businesses found in this area. Try a different location.");
        }
      } else {
        setBusinesses(results);
      }
    } catch (error) {
      console.error("Error fetching nearby businesses:", error);
      
      // Fall back to mock data if Mapbox API fails
      console.log("Falling back to mock data due to API error");
      const mockResults = getMockBusinessesNearLocation(latitude, longitude, 5);
      setBusinesses(mockResults);
      
      // Only show error if both Mapbox and mock data fail
      if (mockResults.length === 0) {
        setSearchError("Failed to load businesses near you.");
        toast.error("Failed to load businesses");
      }
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
      // Use Mapbox Places API for search
      const results = await searchMapboxBusinesses(query, [userLocation.lng, userLocation.lat]);
      console.log("Search results:", results.length, "businesses found for query:", query);
      
      if (results.length === 0) {
        // Fall back to mock data if no results
        console.log("No results from Mapbox, falling back to mock search");
        const mockResults = searchMockBusinesses(query, [userLocation.lng, userLocation.lat]);
        setBusinesses(mockResults);
      } else {
        setBusinesses(results);
      }
      
      // Open sidebar with results
      setSidebarOpen(true);
      setSelectedBusiness(null);
      setShowReviewForm(false);
    } catch (error) {
      console.error("Search error:", error);
      
      // Fall back to mock search
      try {
        const mockResults = searchMockBusinesses(query, [userLocation.lng, userLocation.lat]);
        setBusinesses(mockResults);
      } catch (mockError) {
        setSearchError("Failed to load businesses. Please try again later.");
        toast.error("Failed to load businesses");
      }
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Handle location refresh button click
  const handleRefreshLocation = () => {
    requestLocationAccess();
  };

  // Simplified map centering effect
  useEffect(() => {
    if (map) {
      // Determine the center point based on what should be in focus
      let newViewState = { ...viewState };
      
      if (selectedBusiness && selectedBusiness.coordinates) {
        newViewState = { 
          ...newViewState,
          longitude: selectedBusiness.coordinates[0],
          latitude: selectedBusiness.coordinates[1],
          zoom: 16
        };
      } else if (userLocation) {
        newViewState = {
          ...newViewState,
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          zoom: 14
        };
      }
      
      // Update the view state
      setViewState(newViewState);
    }
  }, [map, userLocation, selectedBusiness]);

  // Map load callback
  const onMapLoad = useCallback((evt: { target: any }) => {
    const map = evt.target;
    setMap(map);
    setLoading(false);
    
    // Apply style customizations
    if (map) {
      // Create a subdued background that reduces eye strain
      map.setPaintProperty('background', 'background-color', '#0f172a'); // Deep blue background reduces eye strain

      // Water - using a calming blue that's visually distinct but not distracting
      map.setPaintProperty('water', 'fill-color', '#193c5a');
      
      // Land and green areas - research shows nature elements improve cognitive processing
      map.setPaintProperty('landuse-park', 'fill-color', '#1e3a29');
      map.setPaintProperty('landuse-green', 'fill-color', '#1e3a29');

      // Main roads - high contrast for key wayfinding elements
      map.setPaintProperty('road-primary', 'line-color', '#334155');
      
      // Secondary roads - moderate contrast for visual hierarchy
      map.setPaintProperty('road-secondary-tertiary', 'line-color', '#293548');
      
      // Building footprints - subtle but visible
      map.setPaintProperty('building', 'fill-color', '#172033');
      
      // POI labels - minimized to reduce cognitive load
      map.setLayoutProperty('poi-label', 'text-size', 10);
      map.setPaintProperty('poi-label', 'text-color', '#94a3b8');
      
      // Administrative boundaries - subtle
      map.setPaintProperty('admin-0-boundary', 'line-color', '#334155');
      
      // Transit lines - visible but not distracting
      map.setPaintProperty('transit-layer', 'line-color', '#334155');
    }
  }, []);

  // Handle marker click
  const handleMarkerClick = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      // Set active marker and popup info
      setActiveMarker(businessId);
      setPopupInfo(business);
      
      // Set selected business
      setSelectedBusiness(business);
      
      // Open sidebar if it's not already open
      if (!sidebarOpen) {
        setSidebarOpen(true);
      }
      
      // Center map on business location
      if (business.coordinates) {
        setViewState({
          longitude: business.coordinates[0],
          latitude: business.coordinates[1],
          zoom: 16
        });
      }
    }
  };

  // Modify the toggleSidebar function to recenter the map when sidebar state changes
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // The center will be adjusted by the useEffect above
  };

  // Handle back to results
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

  // Add this helper function near the top of your component
  const getGoogleMapsAnimation = () => {
    return window.google?.maps?.Animation?.BOUNCE || null;
  };

  // Add this helper function near the top of your component where other helper functions are defined
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
      />
    ));
  };

  // Add this helper function near the formatDistance function if it exists, or add it
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km away`;
    } else {
      return `${Math.round(distance)} km away`;
    }
  };

  // Update the existing useEffect for CSS styles
  useEffect(() => {
    // Add custom CSS for styling
    if (!document.getElementById('mapbox-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'mapbox-custom-styles';
      style.innerHTML = `
        /* Prevent page scrolling and fix map container */
        body, html {
          overflow: hidden;
          height: 100%;
          width: 100%;
          position: fixed;
        }
        #map-container {
          height: calc(100vh - 57px) !important;
          overflow: hidden !important;
        }
        
        /* Enhanced Mapbox popup styling to match search results exactly */
        .mapboxgl-popup {
          z-index: 10; 
        }
        
        .mapboxgl-popup-content {
          background-color: var(--background);
          color: var(--foreground);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 0;
          border: 1px solid var(--border);
          overflow: hidden;
          width: 320px;
          max-width: 90vw;
        }
        
        .mapboxgl-popup-close-button {
          color: var(--foreground);
          font-size: 16px;
          padding: 8px;
          background: transparent;
          border: none;
          z-index: 2;
          position: absolute;
          top: 0;
          right: 0;
          transition: color 0.2s ease;
        }
        
        .mapboxgl-popup-close-button:hover {
          background-color: transparent;
          color: var(--primary);
        }
        
        /* Override the default popup tip direction */
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: var(--border);
          margin-bottom: -1px;
        }
        
        .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
          border-bottom-color: var(--border);
          margin-top: -1px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Function to check if an error occurred
  const didErrorOccur = () => {
    // We're using a simplified error check - just checking if we have a token
    return !MAPBOX_TOKEN;
  };

  // Modify the handleBusinessSelect function to use only Mapbox and mock data
  const handleBusinessSelect = async (business: Business) => {
    setIsLoadingResults(true);
    try {
      // Get full details if available
      if (business.placeId) {
        // Try to get details from Mapbox
        const mapboxDetails = await getBusinessDetailsWithMapbox(business.placeId);
        if (mapboxDetails) {
          setSelectedBusiness(mapboxDetails);
        } else {
          // If Mapbox fails, just use the business directly
          setSelectedBusiness(business);
        }
      } else {
        // If no placeId, just use the business directly
        setSelectedBusiness(business);
      }
      
      setShowReviewForm(false);
      
      // Center the map on the selected business
      if (business.coordinates) {
        setViewState({
          longitude: business.coordinates[0],
          latitude: business.coordinates[1],
          zoom: 16
        });
      }
      
      // Set the active marker
      setActiveMarker(business.id);
      setPopupInfo(business);
    } catch (error) {
      console.error("Error getting business details:", error);
      toast.error("Failed to load business details");
      setSelectedBusiness(business);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Render the review form section
  const renderReviewForm = () => {
    if (!showReviewForm || !selectedBusiness) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Write a Review for {selectedBusiness?.name}</h2>
            <Button 
              variant="ghost" 
              size="icon" 
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
                  <span>Posting as: {(user as any)?.displayName || (user as any)?.email?.address}</span>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                <Button type="submit">Submit Review</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (didErrorOccur()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <p className="text-red-500 font-medium">Error loading map</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your Mapbox access token configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col relative bg-background overflow-hidden">
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
        style={{ height: "calc(100vh - 57px)" }}
      >
        {sidebarOpen && (
          <div className="p-4 w-full">
            {showReviewForm && selectedBusiness ? (
              renderReviewForm()
            ) : selectedBusiness ? (
              <BusinessDetails 
                business={selectedBusiness} 
                onBack={handleBackToResults} 
                onWriteReview={handleToggleReviewForm}
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
      <div 
        id="map-container" 
        className="flex-1 w-full h-full absolute inset-0 transition-all duration-300 ease-in-out" 
        style={{ 
          marginTop: "57px", 
          height: "calc(100vh - 57px)"
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {mapError && (
          <div className="absolute top-2 left-0 right-0 mx-auto w-fit z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-md">
            <p>{mapError}</p>
          </div>
        )}

        {MAPBOX_TOKEN ? (
          <Map
            id="map"
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
            mapboxAccessToken={MAPBOX_TOKEN}
            onLoad={onMapLoad}
          >
            <NavigationControl position="bottom-right" />
            
            {/* User location marker */}
            {userLocation && (
              <Marker
                latitude={userLocation.lat}
                longitude={userLocation.lng}
                anchor="center"
              >
                <div className="relative">
                  <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping" />
                  <div className="relative bg-blue-500 w-5 h-5 rounded-full border-2 border-white shadow-lg z-10" />
                </div>
              </Marker>
            )}

            {/* Business markers optimized for visual scanning patterns */}
            {businesses.map((business) => (
              <Marker
                key={business.id}
                latitude={business.coordinates[1]}
                longitude={business.coordinates[0]}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(business.id);
                }}
                anchor="bottom"
              >
                <div 
                  className={`w-8 h-8 transform-gpu ${
                    activeMarker === business.id 
                      ? 'scale-110 bg-purple-600 shadow-lg shadow-purple-500/30' 
                      : 'bg-rose-600 hover:scale-105 transition-transform'
                  } rounded-full flex items-center justify-center text-white text-xs animate-in fade-in duration-300`}
                >
                  <MapPin className={`w-4 h-4 ${activeMarker === business.id ? 'text-white' : 'text-white'}`} />
                </div>
              </Marker>
            ))}
            
            {/* Popup for selected business - Styled exactly like search results */}
            {popupInfo && (
              <Popup
                anchor="top"
                longitude={popupInfo.coordinates[0]}
                latitude={popupInfo.coordinates[1]}
                onClose={() => setPopupInfo(null)}
                closeButton={true}
                closeOnClick={false}
                offset={[0, 8]}
              >
                <div 
                  className="p-3 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleBusinessSelect(popupInfo)}
                >
                  <div className="flex gap-3">
                    {popupInfo.photos && popupInfo.photos.length > 0 ? (
                      <div className="w-16 h-16 rounded bg-secondary flex-shrink-0 overflow-hidden">
                        <img 
                          src={popupInfo.photos[0]} 
                          alt={popupInfo.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=No+Image";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded bg-secondary flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-medium text-sm mb-1 truncate">{popupInfo.name}</h3>
                      
                      {popupInfo.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex">{renderStars(popupInfo.rating)}</div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {popupInfo.rating} {popupInfo.reviewCount && `(${popupInfo.reviewCount})`}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mb-1 truncate">{popupInfo.category}</div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{popupInfo.address}</span>
                        {popupInfo.distance !== undefined && (
                          <span className="whitespace-nowrap flex-shrink-0"> • {formatDistance(popupInfo.distance)}</span>
                        )}
                      </div>
                      
                      {popupInfo.attributes && popupInfo.attributes.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {(() => {
                            // Find priority attributes if they exist
                            const womanOwned = popupInfo.attributes.find(attr => 
                              attr.toLowerCase().includes('woman') || attr.toLowerCase().includes('female'));
                            const latinoOwned = popupInfo.attributes.find(attr => 
                              attr.toLowerCase().includes('latino') || attr.toLowerCase().includes('hispanic'));
                            const blackOwned = popupInfo.attributes.find(attr => 
                              attr.toLowerCase().includes('black') || attr.toLowerCase().includes('african'));
                            
                            // Prioritize attributes in this order
                            const primaryAttribute = womanOwned || latinoOwned || blackOwned || popupInfo.attributes[0];
                            
                            // Calculate remaining attributes count
                            const remainingCount = popupInfo.attributes.length - 1;
                            
                            return (
                              <>
                                <span className="px-1.5 py-0.5 bg-secondary text-xs rounded truncate max-w-[150px]">
                                  {primaryAttribute}
                                </span>
                                {remainingCount > 0 && (
                                  <span className="px-1.5 py-0.5 bg-secondary text-xs rounded">
                                    +{remainingCount} more
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        ) : (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-xl font-bold mb-4">Map Display Unavailable</h2>
              <p className="mb-4">
                Missing Mapbox access token. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.
              </p>
              <p className="text-sm text-muted-foreground">
                We're still displaying business results using sample data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 