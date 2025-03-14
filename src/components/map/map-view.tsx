"use client";

import { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";

// Check if Mapbox token is available
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);

  // Default map settings
  const [lng] = useState(-74.006);
  const [lat] = useState(40.7128);
  const [zoom] = useState(12);

  useEffect(() => {
    // If the map is already initialized or the token is missing, don't proceed
    if (map.current || !mapContainer.current || !mapboxToken) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Dark style to match our dark theme
      center: [lng, lat],
      zoom: zoom,
      accessToken: mapboxToken,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    // Set loading state to false when map loads
    map.current.on("load", () => {
      setLoading(false);
      
      // Example marker for demonstration
      new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Example Business</h3><p>This is a sample business location</p>"))
        .addTo(map.current!);
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom, mapboxToken]);

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden rounded-xl border">
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
          className="h-[600px] w-full"
        />
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Filter by Values</h3>
          <p className="text-sm text-muted-foreground">
            Filter options will be available here
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Filter by Category</h3>
          <p className="text-sm text-muted-foreground">
            Category filters will be available here
          </p>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Filter by Distance</h3>
          <p className="text-sm text-muted-foreground">
            Distance filters will be available here
          </p>
        </Card>
      </div>
    </div>
  );
} 