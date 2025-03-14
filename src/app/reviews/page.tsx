import { MainLayout } from "@/components/layout/main-layout";
import { ReviewsInterface } from "@/components/reviews/reviews-interface";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews | Ethnica",
  description: "Read and write reviews from people with similar values and demographics.",
};

export default function ReviewsPage() {
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-4">Reviews</h1>
        <p className="text-muted-foreground mb-8">
          Read reviews from people with similar backgrounds and preferences. Your reviews help others find businesses that align with their values.
        </p>
        
        <ReviewsInterface />
      </div>
    </MainLayout>
  );
} 