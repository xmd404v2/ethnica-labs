"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div 
          className="max-w-3xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Support Businesses That Align With Your Values?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join Ethnica today and start discovering local businesses that match your priorities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/map">
                Explore Without Account
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required. Create a profile in less than 2 minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 