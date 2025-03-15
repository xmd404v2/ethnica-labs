"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Filter } from "lucide-react";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
  businesses: any[];
  onSelect: (business: any) => void;
  userLocation?: [number, number] | null;
  isLoading?: boolean;
  error?: string | null;
}

export function SearchResults({ 
  businesses, 
  onSelect, 
  userLocation,
  isLoading = false,
  error = null
}: SearchResultsProps) {
  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
      />
    ));
  };

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} km away`;
    } else {
      return `${Math.round(distance)} km away`;
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Search Results</h2>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted-foreground">
          {!isLoading && businesses.length > 0 && (
            <>{businesses.length} businesses found
            {userLocation && ' near you'}</>
          )}
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No businesses found</p>
          <p className="text-sm text-muted-foreground">Try a different search term or location</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {businesses.map((business) => (
            <Card 
              key={business.id} 
              className="p-3 hover:bg-accent transition-colors cursor-pointer"
              onClick={() => onSelect(business)}
            >
              <div className="flex gap-3">
                {business.photos && business.photos.length > 0 ? (
                  <div className="w-16 h-16 rounded bg-secondary flex-shrink-0 overflow-hidden">
                    <img 
                      src={business.photos[0]} 
                      alt={business.name} 
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
                  <h3 className="font-medium text-sm mb-1 truncate">{business.name}</h3>
                  
                  {business.rating && (
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">{renderStars(business.rating)}</div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {business.rating} {business.reviewCount && `(${business.reviewCount})`}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mb-1 truncate">{business.category}</div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{business.address}</span>
                    {business.distance !== undefined && (
                      <span className="whitespace-nowrap flex-shrink-0"> • {formatDistance(business.distance)}</span>
                    )}
                  </div>
                  
                  {business.attributes && business.attributes.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(() => {
                        // Find priority attributes if they exist
                        const womanOwned = business.attributes.find(attr => 
                          attr.toLowerCase().includes('woman') || attr.toLowerCase().includes('female'));
                        const latinoOwned = business.attributes.find(attr => 
                          attr.toLowerCase().includes('latino') || attr.toLowerCase().includes('hispanic'));
                        const blackOwned = business.attributes.find(attr => 
                          attr.toLowerCase().includes('black') || attr.toLowerCase().includes('african'));
                        
                        // Prioritize attributes in this order
                        const primaryAttribute = womanOwned || latinoOwned || blackOwned || business.attributes[0];
                        
                        // Calculate remaining attributes count
                        const remainingCount = business.attributes.length - 1;
                        
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 