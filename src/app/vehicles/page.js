"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Clock } from 'lucide-react';
import Footer from '@/components/Footer';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setVehicles([]); setLoading(false); });
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    if (filterType !== 'All' && v.type !== filterType) return false;
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 text-white">
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 mb-20">
        <h1 className="text-4xl md:text-5xl font-black mb-2"><span className="text-gradient">Our Fleet</span></h1>
        <p className="text-gray-400 mb-8">{vehicles.length} vehicles available for rent</p>

        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
          <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
            {['All', 'Car', 'Bike', 'Scooty'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black font-bold shadow-[0_0_15px_rgba(255,106,0,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text" placeholder="Search vehicles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:w-80 bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#FFB300] transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.length > 0 ? filteredVehicles.map(v => {
              const minTier = v.tieredPricing?.length
                ? v.tieredPricing.reduce((a, b) => a.price < b.price ? a : b)
                : null;

              return (
                <div key={v._id} className="glass rounded-2xl overflow-hidden group hover:shadow-[0_15px_40px_rgba(255,106,0,0.15)] transition-all duration-300">
                  <div className="relative h-52 overflow-hidden">
                    <div
                      className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-black/50 border border-white/10"
                      style={{ color: v.status === 'Available' ? '#10B981' : v.status === 'Busy' ? '#EF4444' : '#F59E0B' }}
                    >
                      {v.status}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">{v.name}</h3>
                      <span className="text-xs text-[#FFB300] bg-[#FFB300]/10 px-2 py-1 rounded border border-[#FFB300]/20">{v.type}</span>
                    </div>

                    {/* Tiered pricing list */}
                    {v.tieredPricing?.length > 0 ? (
                      <div className="space-y-1.5 mb-5 border border-white/5 rounded-xl p-3 bg-white/3">
                        {v.tieredPricing.map(tier => (
                          <div key={tier.hours} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#FFB300]" />
                              {tier.hours} hours
                            </span>
                            <span className="text-white font-bold">₹{tier.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2 items-end mb-5">
                        <span className="text-2xl font-bold text-white">₹{v.pricePerDay}</span>
                        <span className="text-gray-400 text-sm mb-1">/ day</span>
                      </div>
                    )}

                    {minTier && (
                      <p className="text-xs text-gray-600 mb-4">Starting from <span className="text-[#FFB300] font-semibold">₹{minTier.price.toLocaleString('en-IN')}</span></p>
                    )}

                    <Link
                      href={v.status === 'Available' ? `/book/${v._id}` : '#'}
                      className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                        v.status === 'Available'
                          ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black hover:opacity-90 shadow-[0_0_15px_rgba(255,179,0,0.2)]'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {v.status === 'Available' ? 'Book Now' : 'Not Available'}
                    </Link>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-20 text-gray-400 text-lg">
                No vehicles found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
