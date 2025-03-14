"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Support Your Tribe <br />& Grow Local Economies
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Discover businesses that match your values and connect with a community that shares your priorities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/map">
                  Explore Map
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-muted-foreground">#shoplocal</span>
              <span className="text-muted-foreground">#votewithdollars</span>
            </div>
          </motion.div>
          
          <motion.div
            className="rounded-xl bg-gradient-to-br from-primary to-primary-foreground p-1 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-background rounded-lg p-6 h-full">
              <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Map Visualization</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 