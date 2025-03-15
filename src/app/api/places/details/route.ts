import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get API key from environment variables
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  console.log("Using Google Places API Key for details:", apiKey ? "Key exists" : "No key found");
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key is not configured", status: "API_KEY_MISSING" },
      { status: 500 }
    );
  }
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("place_id");
  
  console.log("Details request for place_id:", placeId);
  
  if (!placeId) {
    return NextResponse.json(
      { error: "Missing required parameter: place_id", status: "PARAMS_MISSING" },
      { status: 400 }
    );
  }
  
  try {
    // Build the Google Places API URL
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.append("place_id", placeId);
    url.searchParams.append("fields", "name,rating,formatted_phone_number,formatted_address,website,geometry,editorial_summary,opening_hours,price_level,reviews,user_ratings_total,photos,types,vicinity");
    url.searchParams.append("key", apiKey);
    
    console.log("Calling Google Places Details API:", url.toString().replace(apiKey, "API_KEY_HIDDEN"));
    
    // Make the request to Google Places API
    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Places Details API error: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { 
          error: `Google Places API responded with status: ${response.status}`, 
          status: "REQUEST_DENIED",
          message: errorText 
        },
        { status: 200 } // Return 200 so the client can gracefully handle it
      );
    }
    
    const data = await response.json();
    console.log("Google API details response status:", data.status);
    
    // If there's an error with the API itself, still return a 200 
    // so the client can gracefully handle it
    if (data.status !== "OK") {
      console.error("Google Places Details API error:", data.status, data.error_message || "No error message");
      return NextResponse.json(
        { 
          status: data.status, 
          error: data.error_message || "Google Places API error",
          result: null
        },
        { status: 200 }
      );
    }
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching place details:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch place details", 
        status: "SERVER_ERROR",
        result: null
      },
      { status: 200 } // Return 200 so the client can gracefully handle it
    );
  }
} 