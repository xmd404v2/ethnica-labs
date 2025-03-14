import { MapFullscreen } from "@/components/map-fullscreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map - Find Businesses | Ethnica",
  description: "Discover local businesses that align with your values and demographics on our interactive map.",
};

export default function MapPage() {
  return <MapFullscreen />;
} 