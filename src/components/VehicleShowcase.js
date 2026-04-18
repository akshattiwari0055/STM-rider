"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function VehicleShowcase() {
  const sectionRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setVehicles(data.slice(0, 6));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && vehicles.length > 0) {
      let ctx = gsap.context(() => {
        gsap.fromTo('.vehicle-card',
          { y: 60, opacity: 0 },
          {
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
            y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', clearProps: 'all',
          }
        );
      }, sectionRef);
      return () => ctx.revert();
    }
  }, [loading, vehicles]);

  return (
    <section ref={sectionRef} className="py-20 px-6 max-w-7xl mx-auto relative cursor-default">
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-[#FF6A00]/5 rounded-full blur-[100px] z-0" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Elite <span className="text-gradient">Fleet</span></h2>
            <p className="text-gray-400">Choose from our premium selection of cars and bikes.</p>
          </div>
          <Link href="/vehicles" className="mt-6 md:mt-0 px-6 py-3 border border-[#FF6A00] text-[#FFB300] rounded-full hover:bg-[#FF6A00] hover:text-white transition-all">
            View All Vehicles
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map(v => {
              const minTier = (v.tieredPricing && v.tieredPricing.length > 0)
                ? v.tieredPricing.reduce((a, b) => a.price < b.price ? a : b)
                : null;

              return (
                <div key={v._id} className="vehicle-card glass rounded-2xl overflow-hidden group hover:shadow-[0_15px_40px_rgba(255,106,0,0.15)] transition-all duration-300">
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-black/50 border border-white/10"
                      style={{ color: v.status === 'Available' ? '#10B981' : v.status === 'Busy' ? '#EF4444' : '#F59E0B' }}>
                      {v.status}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-bold text-white">{v.name}</h3>
                      <span className="text-xs text-[#FFB300] bg-[#FFB300]/10 px-2 py-1 rounded border border-[#FFB300]/20">{v.type}</span>
                    </div>

                    {/* Tiered pricing preview */}
                    {v.tieredPricing && v.tieredPricing.length > 0 ? (
                      <div className="space-y-1 mb-5">
                        {v.tieredPricing.map(tier => (
                          <div key={tier.hours} className="flex justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#FFB300]" /> {tier.hours}h
                            </span>
                            <span className="text-white font-semibold">₹{tier.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        {minTier && (
                          <p className="text-xs text-gray-600 mt-1">Starting from ₹{minTier.price.toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 items-end mb-5">
                        <span className="text-2xl font-bold text-white">₹{v.pricePerDay}</span>
                        <span className="text-gray-400 text-sm mb-1">/ day</span>
                      </div>
                    )}

                    <Link
                      href={v.status === 'Available' ? `/book/${v._id}` : '#'}
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                        v.status === 'Available'
                          ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black hover:opacity-90'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {v.status === 'Available' ? 'Book Now' : 'Not Available'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
