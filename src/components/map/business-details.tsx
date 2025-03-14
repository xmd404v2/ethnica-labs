"use client";

import { Button } from "@/components/ui/button";
import { Star, MapPin, ChevronLeft, Phone, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePrivy } from '@privy-io/react-auth';

interface BusinessDetailsProps {
  business: any;
  onBack: () => void;
  onWriteReview: () => void;
}

export function BusinessDetails({ business, onBack, onWriteReview }: BusinessDetailsProps) {
  const { login, authenticated } = usePrivy();
  
  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
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

  // Handle authenticated actions
  const handleAuthAction = (action: () => void) => {
    if (authenticated) {
      action();
    } else {
      login();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to results
        </Button>
      </div>
      
      <div className="aspect-video bg-muted rounded-md relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground">Business Image</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold">{business.name}</h2>
          <div className="flex items-center gap-1 mt-1">
            {renderStars(business.rating)}
            <span className="text-sm text-muted-foreground ml-1">
              {business.rating} ({business.reviewCount} reviews)
            </span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{business.category}</p>
        
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {business.address}
            {business.distance !== undefined && (
              <span className="ml-2 text-primary font-medium">
                {formatDistance(business.distance)}
              </span>
            )}
          </div>
          
          {business.phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              {business.phone}
            </div>
          )}
          
          {business.website && (
            <div className="flex items-center text-muted-foreground">
              <Globe className="h-4 w-4 mr-2" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {business.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
        
        <p className="text-sm py-2">{business.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {business.attributes.map((attribute: string, index: number) => (
            <span 
              key={index} 
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            >
              {attribute}
            </span>
          ))}
        </div>
        
        <div className="pt-4 flex gap-2">
          <Button 
            className="flex-1" 
            onClick={() => handleAuthAction(onWriteReview)}
          >
            Write a review
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleAuthAction(() => console.log('Saving business'))}
          >
            Save
          </Button>
          <Button variant="outline" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-2">Reviews from people like you</h3>
          {business.reviews && business.reviews.length > 0 ? (
            <>
              {business.reviews.slice(0, 2).map((review: any) => (
                <Card key={review.id} className="p-3 mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm mb-1">"{review.text}"</p>
                  <div className="text-xs text-muted-foreground">{review.author} ({review.authorDetails})</div>
                </Card>
              ))}
              {business.reviews.length > 2 && (
                <Button variant="link" className="p-0 h-auto font-normal text-primary">
                  See all {business.reviews.length} reviews →
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
} 