import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { CTA } from "@/components/home/cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ethnica - Support Your Tribe & Grow Local Economies",
  description: "Discover and support businesses that align with your values and demographics.",
};

export default function Home() {
  redirect("/map");
}
