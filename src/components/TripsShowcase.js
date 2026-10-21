"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { MapPin, Calendar, Clock, Users, ArrowRight, CheckCircle2, Compass } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function TripsShowcase() {
  const sectionRef = useRef(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trips')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrips(data.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && trips.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.trip-card',
          { y: 50, opacity: 0 },
          {
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
            y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', clearProps: 'all',
          }
        );
      }, sectionRef);
      return () => ctx.revert();
    }
  }, [loading, trips]);

  const getStatusBadge = (status, seatsAvailable) => {
    if (status === 'Sold Out' || seatsAvailable <= 0) {
      return { text: 'Sold Out', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
    }
    if (status === 'Filling Fast' || seatsAvailable <= 5) {
      return { text: 'Filling Fast', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
    }
    return { text: 'Seats Open', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  };

  return (
    <section ref={sectionRef} className="py-24 px-6 max-w-7xl mx-auto relative">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFB300]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB300]/10 border border-[#FFB300]/20 text-[#FFB300] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            Group Adventures & Getaways
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Curated <span className="text-gradient">Tour Trips</span>
          </h2>
          <p className="text-gray-400 mt-2 text-base max-w-xl">
            Book all-inclusive weekend trips with travel, luxury stays, meals, and experienced trip captains. Hassle-free group vibes.
          </p>
        </div>

        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#FFB300] hover:text-[#FF6A00] transition-colors group"
        >
          View All Trips
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-[460px] animate-pulse p-4">
              <div className="w-full h-48 bg-white/5 rounded-xl mb-4" />
              <div className="w-2/3 h-6 bg-white/5 rounded mb-3" />
              <div className="w-1/2 h-4 bg-white/5 rounded mb-6" />
              <div className="w-full h-10 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16 text-gray-500 glass rounded-2xl border border-white/5">
          <Compass className="w-12 h-12 mx-auto mb-3 text-gray-600 animate-spin" />
          <p className="text-lg font-semibold text-gray-400">Loading upcoming trips...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map(trip => {
            const badge = getStatusBadge(trip.status, trip.seatsAvailable);

            return (
              <div
                key={trip._id}
                className="trip-card glass rounded-2xl overflow-hidden border border-white/10 hover:border-[#FFB300]/40 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(255,106,0,0.15)] flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md border border-white/10 text-white">
                      <Clock className="w-3.5 h-3.5 text-[#FFB300]" />
                      {trip.duration}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${badge.bg} ${badge.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {badge.text}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <p className="text-xs font-semibold text-[#FFB300] flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destination}
                    </p>
                    <h3 className="text-xl font-black text-white group-hover:text-[#FFB300] transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-5">
                    {/* Departure Dates snippet */}
                    {trip.departureDates?.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                        <Calendar className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                        <span className="truncate">{trip.departureDates[0]}</span>
                      </div>
                    )}

                    {/* Quick Inclusions Highlights */}
                    {trip.inclusions?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {trip.inclusions.slice(0, 3).map((inc, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">
                          ₹{trip.price?.toLocaleString('en-IN')}
                        </span>
                        {trip.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{trip.originalPrice?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">per person all-inclusive</span>
                    </div>

                    <Link
                      href={`/trips/${trip._id}`}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,179,0,0.3)] shrink-0"
                    >
                      Book Trip
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
