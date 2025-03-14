"use client";

import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Menu, X, Layers, Compass, UserLocation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MapSearch } from "@/components/search/map-search";
import { SearchResults } from "@/components/map/search-results";
import { BusinessDetails } from "@/components/map/business-details";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import { usePrivy } from '@privy-io/react-auth';
import { toast } from "sonner";
import { searchNearbyBusinesses, getBusinessDetails, Business } from "@/lib/api/places";

// Check if Mapbox token is available
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Storage keys
const LOCATION_STORAGE_KEY = 'ethnica-user-location';
const LOCATION_TIMESTAMP_KEY = 'ethnica-location-timestamp';
// Expiration time for cached location (24 hours in milliseconds)
const LOCATION_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Calculate distance between two coordinates in kilometers using Haversine formula
function getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2) {
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

export function MapFullscreen() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [activeMarker, setActiveMarker] = useState<mapboxgl.Marker | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // User location state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccessDenied, setLocationAccessDenied] = useState(false);

  // Default map settings - will be overridden by user location if available
  const [lng, setLng] = useState(-74.006);
  const [lat, setLat] = useState(40.7128);
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
            setUserLocation(location);
            setLng(location[0]);
            setLat(location[1]);
            
            // Filter businesses based on location
            filterBusinessesByLocation(location[0], location[1]);
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
        const newLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
        
        // Save the user's location in state
        setUserLocation(newLocation);
        setLng(newLocation[0]);
        setLat(newLocation[1]);
        
        // Save to localStorage with timestamp
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        localStorage.setItem(LOCATION_TIMESTAMP_KEY, Date.now().toString());
        
        // Filter businesses based on new location
        filterBusinessesByLocation(newLocation[0], newLocation[1]);
        
        // Pan to the user's location if map is available
        if (map.current) {
          map.current.flyTo({
            center: newLocation,
            zoom: 14,
            essential: true
          });
          
          // Add or update user location marker
          addUserLocationMarker(newLocation);
        }
        
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

  // Add user location marker to the map
  const addUserLocationMarker = (location: [number, number]) => {
    if (map.current) {
      // Remove existing marker if it exists
      if (userMarker.current) {
        userMarker.current.remove();
      }
      
      // Create a custom element for the user marker
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.background = '#4F46E5';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.2)';
      el.style.cursor = 'pointer';
      
      // Create a pulse effect element
      const pulse = document.createElement('div');
      pulse.className = 'user-location-pulse';
      pulse.style.position = 'absolute';
      pulse.style.top = '-10px';
      pulse.style.left = '-10px';
      pulse.style.width = '40px';
      pulse.style.height = '40px';
      pulse.style.borderRadius = '50%';
      pulse.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
      pulse.style.animation = 'pulse 2s infinite';
      el.appendChild(pulse);
      
      // Create and add the keyframes for the pulse animation if not already present
      if (!document.getElementById('user-location-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'user-location-pulse-style';
        style.innerHTML = `
          @keyframes pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Create and add the marker
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat(location)
        .addTo(map.current);
      
      // Add a popup to the marker
      new mapboxgl.Popup({ closeButton: false, offset: 25 })
        .setLngLat(location)
        .setHTML('<strong>Your Location</strong>')
        .addTo(map.current);
    }
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
        userLocation,
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
      
      // Fly to the business location
      if (map.current) {
        map.current.flyTo({
          center: business.coordinates,
          zoom: 16,
          essential: true
        });
        
        // Highlight the marker
        markers.forEach(marker => {
          const el = marker.getElement();
          el.classList.remove('marker-active');
          
          // Find the marker for this business
          if (marker._lngLat && 
              marker._lngLat.lng === business.coordinates[0] && 
              marker._lngLat.lat === business.coordinates[1]) {
            el.classList.add('marker-active');
            setActiveMarker(marker);
            marker.togglePopup();
          }
        });
      }
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
    
    // Reset the active marker
    if (activeMarker) {
      const el = activeMarker.getElement();
      el.classList.remove('marker-active');
      if (activeMarker.getPopup().isOpen()) {
        activeMarker.togglePopup();
      }
    }
    
    // If user location is available, center there, otherwise use default
    if (map.current) {
      map.current.flyTo({
        center: userLocation || [lng, lat],
        zoom: userLocation ? 14 : zoom,
        essential: true
      });
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

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current || !mapboxToken) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Dark style to match our dark theme
      center: [lng, lat],
      zoom: zoom,
      accessToken: mapboxToken,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    
    // We don't need this as we're implementing our own location control
    // map.current.addControl(
    //   new mapboxgl.GeolocateControl({
    //     positionOptions: {
    //       enableHighAccuracy: true
    //     },
    //     trackUserLocation: true
    //   }),
    //   "bottom-right"
    // );

    // Add custom CSS for markers
    const style = document.createElement('style');
    style.textContent = `
      .marker-active {
        z-index: 10;
        transform: scale(1.3);
      }
      .mapboxgl-popup {
        z-index: 5;
      }
    `;
    document.head.appendChild(style);

    // When map loads
    map.current.on("load", () => {
      setLoading(false);
      
      // Add markers for businesses
      const newMarkers = businesses.map(business => {
        const popup = new mapboxgl.Popup({ closeButton: false, offset: 25 })
          .setHTML(`<strong>${business.name}</strong><br>${business.address}`);
            
        const marker = new mapboxgl.Marker({ color: "#6366F1" })
          .setLngLat(business.coordinates)
          .setPopup(popup);
          
        marker.getElement().addEventListener('click', () => {
          setSelectedBusiness(business);
          setSidebarOpen(true);
          setShowReviewForm(false);
          
          // Reset previous active marker
          markers.forEach(m => {
            if (m !== marker) {
              m.getElement().classList.remove('marker-active');
            }
          });
          
          // Set this marker as active
          marker.getElement().classList.add('marker-active');
          setActiveMarker(marker);
        });
        
        marker.addTo(map.current!);
        return marker;
      });
      
      setMarkers(newMarkers);
      
      // If we have user location, add the user marker
      if (userLocation) {
        addUserLocationMarker(userLocation);
      }
    });

    // Clean up on unmount
    return () => {
      markers.forEach(marker => marker.remove());
      if (userMarker.current) userMarker.current.remove();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom, mapboxToken]);

  // Update markers when businesses change
  useEffect(() => {
    if (!map.current) return;
    
    // Remove existing markers
    markers.forEach(marker => marker.remove());
    
    // Add new markers
    const newMarkers = businesses.map(business => {
      const popup = new mapboxgl.Popup({ closeButton: false, offset: 25 })
        .setHTML(`
          <strong>${business.name}</strong>
          <br>${business.address}
          ${business.distance ? `<br><small>${business.distance.toFixed(1)} km away</small>` : ''}
        `);
          
      const marker = new mapboxgl.Marker({ color: "#6366F1" })
        .setLngLat(business.coordinates)
        .setPopup(popup);
        
      marker.getElement().addEventListener('click', () => {
        setSelectedBusiness(business);
        setSidebarOpen(true);
        setShowReviewForm(false);
        
        // Reset previous active marker
        markers.forEach(m => {
          if (m !== marker) {
            m.getElement().classList.remove('marker-active');
          }
        });
        
        // Set this marker as active
        marker.getElement().classList.add('marker-active');
        setActiveMarker(marker);
      });
      
      marker.addTo(map.current!);
      return marker;
    });
    
    setMarkers(newMarkers);
    
    // If we have search results but no specific business selected,
    // adjust the map to show all markers
    if (businesses.length > 0 && !selectedBusiness && map.current) {
      if (businesses.length === 1) {
        // If only one business, center on it
        map.current.flyTo({
          center: businesses[0].coordinates,
          zoom: 15,
          essential: true
        });
      } else {
        // Fit map to show all markers
        const bounds = new mapboxgl.LngLatBounds();
        businesses.forEach(business => {
          bounds.extend(business.coordinates);
        });
        
        // If user location is available, include it in the bounds
        if (userLocation) {
          bounds.extend(userLocation);
        }
        
        map.current.fitBounds(bounds, { 
          padding: { top: 100, bottom: 100, left: sidebarOpen ? 400 : 100, right: 100 },
          maxZoom: 15
        });
      }
    }
  }, [businesses]);

  // Update user marker when location changes
  useEffect(() => {
    if (userLocation && map.current) {
      addUserLocationMarker(userLocation);
    }
  }, [userLocation]);

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
          "absolute left-0 top-[57px] bottom-0 z-20 bg-background border-r transition-all duration-300 ease-in-out overflow-y-auto",
          sidebarOpen ? "w-[360px] opacity-100" : "w-0 opacity-0"
        )}
      >
        {sidebarOpen && (
          <div className="p-4">
            {showReviewForm && selectedBusiness ? (
              renderReviewForm()
            ) : selectedBusiness ? (
              <BusinessDetails 
                business={selectedBusiness} 
                onBack={handleBackToResults} 
              />
            ) : (
              <div className="flex items-center justify-between mb-4">
                <SearchResults 
                  businesses={businesses} 
                  onSelect={handleBusinessSelect}
                  userLocation={userLocation}
                  isLoading={isLoadingResults}
                  error={searchError}
                />
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
      <div className="flex-1 w-full h-full absolute inset-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!mapboxToken && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center p-4">
              <p className="text-red-500 font-medium">Mapbox API token not found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please add your Mapbox token to the .env file as NEXT_PUBLIC_MAPBOX_TOKEN
              </p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className="h-full w-full"
          style={{ marginTop: "57px" }}
        />
      </div>
    </div>
  );
} 