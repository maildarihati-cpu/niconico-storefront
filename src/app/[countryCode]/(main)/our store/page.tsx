import React from "react";
import { Metadata } from "next";
import StoreSection from "@modules/home/components/store-location";

// Menambahkan Metadata SEO standar Medusa v2 biar website kamu terlihat profesional di Google
export const metadata: Metadata = {
  title: "Our Store Locator | NicoNico Resort",
  description: "Find and visit our official physical stores. Get directions and contact us directly.",
};

export default function OurStorePage() {
  return (
    <div className="w-full bg-white min-h-screen">
      
      <StoreSection isPage={true} />
    </div>
  );
}