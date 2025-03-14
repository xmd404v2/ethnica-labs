"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Filter } from "lucide-react";

interface SearchResultsProps {
  businesses: any[];
  onSelect: (business: any) => void;
}

export function SearchResults({ businesses, onSelect }: SearchResultsProps) {
  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
      />
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Search Results</h2>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted-foreground">
          {businesses.length} businesses found
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      
      {businesses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No businesses found matching your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map((business) => (
            <Card 
              key={business.id} 
              className="p-3 cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelect(business)}
            >
              <h3 className="font-medium">{business.name}</h3>
              <div className="flex items-center gap-1 my-1">
                {renderStars(business.rating)}
                <span className="text-xs text-muted-foreground ml-1">
                  ({business.reviewCount})
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">{business.category}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {business.address}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {business.attributes.slice(0, 2).map((attribute: string, index: number) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px]"
                  >
                    {attribute}
                  </span>
                ))}
                {business.attributes.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{business.attributes.length - 2} more</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 