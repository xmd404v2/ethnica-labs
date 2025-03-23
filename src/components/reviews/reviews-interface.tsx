"use client";

import { useState } from "react";
import { Star, ThumbsUp, Filter, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Mock review data for demonstration
const mockReviews = [
  {
    id: "1",
    businessId: "1",
    businessName: "Green Earth Cafe",
    userId: "user1",
    userName: "Alex Johnson",
    userDemographics: "30s, Vegetarian",
    rating: 5,
    content: "Amazing vegetarian options and the staff is incredibly friendly. The restaurant uses sustainable practices which aligns with my values. Highly recommend the mushroom burger!",
    date: "2023-12-15",
    helpfulCount: 12,
    userHelpful: false,
  },
  {
    id: "2",
    businessId: "2",
    businessName: "Community Bookstore",
    userId: "user2",
    userName: "Sam Rivera",
    userDemographics: "20s, Student",
    rating: 4,
    content: "Great selection of diverse authors and topics. The staff recommendations are always spot on. They host wonderful community events too. Only downside is limited seating.",
    date: "2023-11-28",
    helpfulCount: 8,
    userHelpful: true,
  },
  {
    id: "3",
    businessId: "3",
    businessName: "Halal Grill House",
    userId: "user3",
    userName: "Fatima Ahmed",
    userDemographics: "40s, Halal diet",
    rating: 5,
    content: "Finally found a place that serves authentic halal food! The flavors are incredible and portions are generous. The family who runs it is so welcoming. Best kebabs in town.",
    date: "2024-01-05",
    helpfulCount: 15,
    userHelpful: false,
  },
];

// Mock user's reviews
const mockUserReviews = [
  {
    id: "4",
    businessId: "3",
    businessName: "Halal Grill House",
    userId: "currentUser",
    userName: "You",
    rating: 4,
    content: "Great food and atmosphere. The lamb kebabs are exceptional. Service was a bit slow during peak hours, but the quality makes up for it.",
    date: "2024-02-10",
    helpfulCount: 3,
    userHelpful: false,
  },
];

export function ReviewsInterface() {
  const [reviews, setReviews] = useState(mockReviews);
  const [userReviews, setUserReviews] = useState(mockUserReviews);
  const [activeTab, setActiveTab] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Toggle helpful status
  const toggleHelpful = (reviewId: string) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        const newHelpful = !review.userHelpful;
        return {
          ...review,
          userHelpful: newHelpful,
          helpfulCount: newHelpful ? review.helpfulCount + 1 : review.helpfulCount - 1
        };
      }
      return review;
    }));
  };

  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="my">My Reviews</TabsTrigger>
              <TabsTrigger value="similar">Similar to Me</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h3 className="font-medium">Filter Reviews</h3>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Business Category</h4>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="restaurant">Restaurants</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Rating</h4>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Demographic Similarity</h4>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select similarity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Reviews</SelectItem>
                          <SelectItem value="high">High Similarity</SelectItem>
                          <SelectItem value="medium">Medium Similarity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => setFiltersOpen(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => setFiltersOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button>
                Write a Review
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <TabsContent value="all">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reviews found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{review.businessName}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.date}
                        </div>
                      </div>
                      
                      <p className="text-sm">{review.content}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{review.userName}</span>
                          {review.userDemographics && (
                            <span className="text-xs">({review.userDemographics})</span>
                          )}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => toggleHelpful(review.id)}
                        >
                          <ThumbsUp className={`h-4 w-4 ${review.userHelpful ? "fill-primary" : ""}`} />
                          <span>{review.helpfulCount}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my">
            {userReviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't written any reviews yet.</p>
                <Button className="mt-4">Write Your First Review</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userReviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{review.businessName}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <div className="text-sm text-muted-foreground self-center">
                            {review.date}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm">{review.content}</p>
                      
                      <div className="flex justify-end items-center">
                        <div className="text-sm text-muted-foreground">
                          <ThumbsUp className="h-4 w-4 inline mr-1" />
                          {review.helpfulCount} people found this helpful
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="similar">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Sign in to see reviews from people with similar demographics and preferences.
              </p>
              <Button className="mt-4">Sign In</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 