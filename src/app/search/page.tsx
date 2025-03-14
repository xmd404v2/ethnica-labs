import { MainLayout } from "@/components/layout/main-layout";
import { SearchInterface } from "@/components/search/search-interface";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Businesses | Ethnica",
  description: "Search for businesses that align with your values and demographics.",
};

export default function SearchPage() {
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-4">Search Businesses</h1>
        <p className="text-muted-foreground mb-8">
          Find businesses that match your values and preferences. Results are personalized based on your profile.
        </p>
        
        <SearchInterface />
      </div>
    </MainLayout>
  );
} 