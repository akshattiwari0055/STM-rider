"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Hero from '@/components/Hero';
import VehicleShowcase from '@/components/VehicleShowcase';
import OffersBanner from '@/components/OffersBanner';
import WhyChooseUs from '@/components/WhyChooseUs';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <OffersBanner />
      <VehicleShowcase />
      <WhyChooseUs />
      <Footer />
    </main>
  );
}
