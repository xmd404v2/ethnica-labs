"use client";

import { MapPin, Search, Star, Users, Store, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: "Discover on the Map",
    description: "Find businesses near you that align with your values using our interactive map.",
    icon: <MapPin className="h-10 w-10" />,
  },
  {
    title: "Demographic Matching",
    description: "See reviews from people with similar backgrounds and preferences first.",
    icon: <Users className="h-10 w-10" />,
  },
  {
    title: "Personalized Recommendations",
    description: "Get suggestions for businesses based on your unique profile and preferences.",
    icon: <Heart className="h-10 w-10" />,
  },
  {
    title: "Local Business Focus",
    description: "Support local economies and businesses that contribute to your community.",
    icon: <Store className="h-10 w-10" />,
  },
  {
    title: "Authentic Reviews",
    description: "Share your experiences and read reviews from people who share your values.",
    icon: <Star className="h-10 w-10" />,
  },
  {
    title: "Value-Based Search",
    description: "Filter businesses by ownership, practices, and values that matter to you.",
    icon: <Search className="h-10 w-10" />,
  },
];

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Ethnica Helps You Shop Your Values
          </h2>
          <p className="text-xl text-muted-foreground">
            Our platform connects you with businesses that match what matters most to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-xl p-6 shadow-sm border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 