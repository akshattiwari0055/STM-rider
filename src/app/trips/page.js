"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock, Calendar, CheckCircle2, Users, ArrowRight, Compass, Filter } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    fetch('/api/trips')
      .then(res => res.json())
      .then(data => {
        setTrips(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTrips([]);
        setLoading(false);
      });
  }, []);

  const durations = ['All', ...new Set(trips.map(t => t.duration).filter(Boolean))];

  const filteredTrips = trips
    .filter(t => {
      const matchSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDuration = selectedDuration === 'All' || t.duration === selectedDuration;
      return matchSearch && matchDuration;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

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
    <div className="min-h-screen bg-background flex flex-col pt-24 text-white">
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 mb-20">
        
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-14 mb-12 border border-white/10 bg-gradient-to-r from-black via-[#141414] to-black">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB300]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB300]/10 border border-[#FFB300]/20 text-[#FFB300] text-xs font-bold uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5" />
              STM Rider Expeditions
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
              Curated <span className="text-gradient">Tour Trips</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg">
              Explore the Himalayas with fellow travelers. Luxury stays, sightseeing, meals, and certified trip captains all organized for you.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10 items-stretch lg:items-center justify-between">
          {/* Duration Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {durations.map(dur => (
              <button
                key={dur}
                onClick={() => setSelectedDuration(dur)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedDuration === dur
                    ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black shadow-[0_0_15px_rgba(255,106,0,0.3)]'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
              <input
                type="text"
                placeholder="Search destination, trip..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB300] transition-colors"
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#FFB300]"
            >
              <option value="default" className="bg-[#111]">Featured First</option>
              <option value="price-low" className="bg-[#111]">Price: Low to High</option>
              <option value="price-high" className="bg-[#111]">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass rounded-2xl h-[480px] animate-pulse p-4">
                <div className="w-full h-56 bg-white/5 rounded-xl mb-4" />
                <div className="w-3/4 h-6 bg-white/5 rounded mb-3" />
                <div className="w-1/2 h-4 bg-white/5 rounded mb-4" />
                <div className="w-full h-12 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/5">
            <Compass className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">No trips match your search</h3>
            <p className="text-gray-400 text-sm mb-6">Try searching for a different destination or clear your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDuration('All'); }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map(trip => {
              const badge = getStatusBadge(trip.status, trip.seatsAvailable);

              return (
                <div
                  key={trip._id}
                  className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-[#FFB300]/40 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(255,106,0,0.15)] flex flex-col group"
                >
                  {/* Trip Card Image */}
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Top Status and Duration */}
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

                    {/* Destination Banner */}
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

                  {/* Trip Card Body */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4 mb-6">
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>

                      {/* Departure Date */}
                      {trip.departureDates?.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                          <Calendar className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                          <span className="truncate">{trip.departureDates[0]}</span>
                        </div>
                      )}

                      {/* Inclusions summary */}
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

                      {/* Seats info */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{trip.seatsAvailable} of {trip.seatsTotal} seats available</span>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center justify-between sm:block">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-black text-white">
                              ₹{trip.price?.toLocaleString('en-IN')}
                            </span>
                            {trip.originalPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{trip.originalPrice?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 block whitespace-nowrap">per person all-inclusive</span>
                        </div>
                      </div>

                      <Link
                        href={`/trips/${trip._id}`}
                        className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,179,0,0.3)] shrink-0 flex items-center justify-center"
                      >
                        Explore & Book
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
