"use client";

import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Toggle } from "@/components/ui/toggle";

// Mock business data for demonstration
const mockBusinesses = [
  {
    id: "1",
    name: "Green Earth Cafe",
    category: "Restaurant",
    description: "Sustainable, plant-based cafe with locally sourced ingredients.",
    address: "123 Main St, New York, NY",
    distance: "0.5 miles",
    rating: 4.5,
    reviewCount: 32,
    attributes: ["Minority Owned", "Vegan Options", "Sustainable"],
  },
  {
    id: "2",
    name: "Community Bookstore",
    category: "Retail",
    description: "Independent bookstore with diverse authors and community events.",
    address: "456 Park Ave, New York, NY",
    distance: "1.2 miles",
    rating: 4.8,
    reviewCount: 56,
    attributes: ["Locally Owned", "Woman Owned"],
  },
  {
    id: "3",
    name: "Halal Grill House",
    category: "Restaurant",
    description: "Family-owned restaurant serving authentic halal dishes.",
    address: "789 Broadway, New York, NY",
    distance: "0.8 miles",
    rating: 4.3,
    reviewCount: 28,
    attributes: ["Minority Owned", "Halal Options", "Family Owned"],
  },
];

export function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [businesses, setBusinesses] = useState(mockBusinesses);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter categories for demonstration
  const categories = ["All", "Restaurant", "Retail", "Services", "Entertainment"];
  
  // Filter values for demonstration
  const valueFilters = [
    { id: "minority-owned", label: "Minority Owned" },
    { id: "woman-owned", label: "Woman Owned" },
    { id: "locally-owned", label: "Locally Owned" },
    { id: "sustainable", label: "Sustainable Practices" },
    { id: "vegan", label: "Vegan Options" },
    { id: "vegetarian", label: "Vegetarian Options" },
    { id: "kosher", label: "Kosher Options" },
    { id: "halal", label: "Halal Options" },
  ];

  // Handle search (in a real app, this would query the database)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would fetch from API
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for businesses, categories, or keywords..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-medium">Filter Results</h3>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Category</h4>
                <Select defaultValue="All">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Values & Attributes</h4>
                <div className="grid grid-cols-2 gap-2">
                  {valueFilters.map((filter) => (
                    <Toggle key={filter.id} aria-label={filter.label} className="justify-start">
                      {filter.label}
                    </Toggle>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Distance</h4>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Within 1 mile</SelectItem>
                    <SelectItem value="5">Within 5 miles</SelectItem>
                    <SelectItem value="10">Within 10 miles</SelectItem>
                    <SelectItem value="25">Within 25 miles</SelectItem>
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
      </form>

      {/* Search Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Results</h2>
        
        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No businesses found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {businesses.map((business) => (
              <Card key={business.id} className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/4 aspect-video bg-muted rounded-md flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Business Image</span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{business.name}</h3>
                      <div className="text-sm">
                        ★ {business.rating} ({business.reviewCount} reviews)
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{business.description}</p>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {business.address} • {business.distance}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {business.attributes.map((attribute, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        >
                          {attribute}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 