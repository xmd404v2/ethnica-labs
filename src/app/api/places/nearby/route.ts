import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get API key from environment variables
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  console.log("Using Google Places API Key:", apiKey ? "Key exists" : "No key found");
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key is not configured" },
      { status: 500 }
    );
  }
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "5000";
  const keyword = searchParams.get("keyword");
  
  console.log("Search params:", { lat, lng, radius, keyword });
  
  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing required parameters: lat and lng" },
      { status: 400 }
    );
  }
  
  try {
    // Build the Google Places API URL
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.append("location", `${lat},${lng}`);
    url.searchParams.append("radius", radius);
    
    if (keyword) {
      url.searchParams.append("keyword", keyword);
    }
    
    url.searchParams.append("key", apiKey);
    
    console.log("Calling Google Places API:", url.toString().replace(apiKey, "API_KEY_HIDDEN"));
    
    // Make the request to Google Places API
    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Places API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Google Places API responded with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Google API response status:", data.status);
    console.log("Number of results:", data.results?.length || 0);
    
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error(`Google Places API error status: ${data.status}`, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch nearby places" },
      { status: 500 }
    );
  }
} 