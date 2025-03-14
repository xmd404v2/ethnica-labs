import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get API key from environment variables
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key is not configured" },
      { status: 500 }
    );
  }
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("place_id");
  
  if (!placeId) {
    return NextResponse.json(
      { error: "Missing required parameter: place_id" },
      { status: 400 }
    );
  }
  
  try {
    // Build the Google Places API URL
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.append("place_id", placeId);
    url.searchParams.append("fields", "name,rating,formatted_phone_number,formatted_address,website,geometry,editorial_summary,opening_hours,price_level,reviews,user_ratings_total,photos,types,vicinity");
    url.searchParams.append("key", apiKey);
    
    // Make the request to Google Places API
    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Google Places API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching place details:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
} 