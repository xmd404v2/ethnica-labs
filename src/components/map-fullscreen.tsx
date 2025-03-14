"use client";

import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Menu, X, Layers } from "lucide-react";
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

// Check if Mapbox token is available
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Mock business data for demonstration
const mockBusinesses = [
  {
    id: "1",
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
    reviews: [
      {
        id: "r1",
        rating: 5,
        text: "Amazing vegetarian options and the staff is incredibly friendly.",
        author: "Alex J.",
        authorDetails: "30s, Vegetarian"
      },
      {
        id: "r2", 
        rating: 4,
        text: "Great food but can get crowded during lunch hours.",
        author: "Jamie K.",
        authorDetails: "20s, Student"
      }
    ]
  },
  {
    id: "2",
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
    reviews: [
      {
        id: "r3",
        rating: 5,
        text: "Incredible selection of books by diverse authors. They host amazing events too!",
        author: "Taylor M.",
        authorDetails: "40s, Professor"
      }
    ]
  },
  {
    id: "3",
    name: "Halal Grill House",
    category: "Restaurant",
    description: "Family-owned restaurant serving authentic halal dishes.",
    address: "789 Broadway, New York, NY",
    coordinates: [-73.988, 40.7155],
    rating: 4.3,
    reviewCount: 28,
    phone: "(555) 345-6789",
    attributes: ["Minority Owned", "Halal Options", "Family Owned"],
    reviews: [
      {
        id: "r4",
        rating: 4,
        text: "Authentic flavors and generous portions. Great value!",
        author: "Sam H.",
        authorDetails: "35s, Muslim"
      }
    ]
  },
];

export function MapFullscreen() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [businesses, setBusinesses] = useState(mockBusinesses);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [activeMarker, setActiveMarker] = useState<mapboxgl.Marker | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Default map settings
  const [lng] = useState(-74.006);
  const [lat] = useState(40.7128);
  const [zoom] = useState(13);

  const { user, authenticated } = usePrivy();

  // Handle search
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // In a real app, this would fetch from API
    // For now, we'll just filter our mock data
    if (query.trim() === "") {
      setBusinesses(mockBusinesses);
    } else {
      const filtered = mockBusinesses.filter(business => 
        business.name.toLowerCase().includes(query.toLowerCase()) ||
        business.category.toLowerCase().includes(query.toLowerCase()) ||
        business.description.toLowerCase().includes(query.toLowerCase()) ||
        business.address.toLowerCase().includes(query.toLowerCase()) ||
        business.attributes.some(attr => attr.toLowerCase().includes(query.toLowerCase()))
      );
      setBusinesses(filtered);
    }
    
    // Open sidebar with results
    setSidebarOpen(true);
    setSelectedBusiness(null);
    setShowReviewForm(false);
  };

  // Handle business selection
  const handleBusinessSelect = (business: any) => {
    setSelectedBusiness(business);
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
    
    // Zoom out to show all markers
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
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
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      "bottom-right"
    );

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
    });

    // Clean up on unmount
    return () => {
      markers.forEach(marker => marker.remove());
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
        
        map.current.fitBounds(bounds, { 
          padding: { top: 100, bottom: 100, left: sidebarOpen ? 400 : 100, right: 100 },
          maxZoom: 15
        });
      }
    }
  }, [businesses]);

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
            {selectedBusiness ? (
              showReviewForm ? (
                renderReviewForm()
              ) : (
                <BusinessDetails 
                  business={selectedBusiness} 
                  onBack={handleBackToResults} 
                  onWriteReview={handleToggleReviewForm}
                />
              )
            ) : (
              <div className="flex items-center justify-between mb-4">
                <SearchResults 
                  businesses={businesses} 
                  onSelect={handleBusinessSelect} 
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