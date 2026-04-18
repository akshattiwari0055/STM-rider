"use client";

import { Flame } from "lucide-react";

export default function OffersBanner() {
  return (
    <div className="bg-gradient-to-r from-[#FFB300]/20 to-[#FF6A00]/20 border-y border-[#FF6A00]/30 py-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="flex justify-center items-center gap-3 px-4 relative z-10 w-full animate-[pulse_3s_ease-in-out_infinite]">
        <Flame className="text-[#FF6A00] animate-bounce" size={28} />
        <h2 className="text-white text-lg md:text-xl font-bold tracking-wide text-center">
          <span className="text-gradient">FLAT 40% OFF</span> on 2 Rentals (Wed & Sat Only)
        </h2>
        <Flame className="text-[#FF6A00] animate-bounce" size={28} />
      </div>
    </div>
  );
}
