"use client";

import { useState, useEffect } from 'react';
import {
  Compass, Plus, Edit2, Trash2, X, CheckCircle, Clock, XCircle,
  AlertCircle, RefreshCw, Calendar, Users, MapPin, Phone, MessageSquare,
  Search, ShieldCheck, Sparkles, ChevronRight, Tag, Download
} from 'lucide-react';

const STATUS_CONFIG = {
  Open: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  'Filling Fast': { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  'Sold Out': { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  Completed: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
};

const BOOKING_STATUS_CONFIG = {
  Pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: AlertCircle },
  Confirmed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
  Completed: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: CheckCircle },
  Cancelled: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
};

const emptyTripForm = {
  title: '',
  destination: '',
  price: '',
  originalPrice: '',
  duration: '3 Days / 2 Nights',
  departureDatesText: '',
  pickupLocation: 'LPU Law Gate / Chandigarh',
  dropLocation: 'LPU Law Gate / Chandigarh',
  seatsTotal: 20,
  seatsAvailable: 20,
  image: '',
  description: '',
  inclusionsText: '',
  exclusionsText: '',
  thingsToCarryText: '',
  cancellationPolicyText: '',
  termsAndConditionsText: '',
  status: 'Open',
  featured: true,
  itinerary: [
    { day: 1, title: '', details: '' },
    { day: 2, title: '', details: '' },
    { day: 3, title: '', details: '' },
  ],
};

export default function AdminTrips() {
  const [activeTab, setActiveTab] = useState('trips'); // 'trips' | 'bookings'
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trips Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyTripForm);
  const [saving, setSaving] = useState(false);

  // Bookings Filter
  const [bookingFilter, setBookingFilter] = useState('All');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, bookingsRes] = await Promise.all([
        fetch('/api/trips').then(r => r.json()),
        fetch('/api/trip-bookings').then(r => r.json()).catch(() => []),
      ]);
      setTrips(Array.isArray(tripsRes) ? tripsRes : []);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...emptyTripForm });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingId(t._id);
    setFormData({
      title: t.title || '',
      destination: t.destination || '',
      price: String(t.price || ''),
      originalPrice: t.originalPrice ? String(t.originalPrice) : '',
      duration: t.duration || '3 Days / 2 Nights',
      departureDatesText: Array.isArray(t.departureDates) ? t.departureDates.join(', ') : '',
      pickupLocation: t.pickupLocation || 'LPU Law Gate / Chandigarh',
      dropLocation: t.dropLocation || 'LPU Law Gate / Chandigarh',
      seatsTotal: t.seatsTotal || 20,
      seatsAvailable: t.seatsAvailable ?? t.seatsTotal ?? 20,
      image: t.image || '',
      description: t.description || '',
      inclusionsText: Array.isArray(t.inclusions) ? t.inclusions.join('\n') : '',
      exclusionsText: Array.isArray(t.exclusions) ? t.exclusions.join('\n') : '',
      thingsToCarryText: Array.isArray(t.thingsToCarry) ? t.thingsToCarry.join('\n') : '',
      cancellationPolicyText: Array.isArray(t.cancellationPolicy) ? t.cancellationPolicy.join('\n') : '',
      termsAndConditionsText: Array.isArray(t.termsAndConditions) ? t.termsAndConditions.join('\n') : '',
      status: t.status || 'Open',
      featured: Boolean(t.featured),
      itinerary: Array.isArray(t.itinerary) && t.itinerary.length > 0 ? t.itinerary : [
        { day: 1, title: '', details: '' },
      ],
    });
    setShowModal(true);
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.destination || !formData.price || !formData.image) {
      alert('Please fill in title, destination, price, and provide an image.');
      return;
    }

    setSaving(true);
    const departureDates = formData.departureDatesText
      ? formData.departureDatesText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const inclusions = formData.inclusionsText
      ? formData.inclusionsText.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const exclusions = formData.exclusionsText
      ? formData.exclusionsText.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const thingsToCarry = formData.thingsToCarryText
      ? formData.thingsToCarryText.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const cancellationPolicy = formData.cancellationPolicyText
      ? formData.cancellationPolicyText.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const termsAndConditions = formData.termsAndConditionsText
      ? formData.termsAndConditionsText.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const cleanItinerary = formData.itinerary
      .filter(item => item.title.trim())
      .map((item, index) => ({
        day: index + 1,
        title: item.title.trim(),
        details: item.details.trim(),
      }));

    const payload = {
      title: formData.title,
      destination: formData.destination,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      duration: formData.duration,
      departureDates,
      pickupLocation: formData.pickupLocation,
      dropLocation: formData.dropLocation,
      seatsTotal: Number(formData.seatsTotal),
      seatsAvailable: Number(formData.seatsAvailable),
      image: formData.image,
      description: formData.description,
      inclusions,
      exclusions,
      thingsToCarry,
      cancellationPolicy,
      termsAndConditions,
      status: formData.status,
      featured: formData.featured,
      itinerary: cleanItinerary,
    };

    const url = editingId ? `/api/trips/${editingId}` : '/api/trips';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Failed to save trip.');
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!confirm('Are you sure you want to delete this trip permanently?')) return;
    await fetch(`/api/trips/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleTripStatusToggle = async (trip, newStatus) => {
    await fetch(`/api/trips/${trip._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingBookingId(bookingId);
    const res = await fetch(`/api/trip-bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdatingBookingId(null);
    if (res.ok) {
      fetchData();
    } else {
      alert('Failed to update booking status.');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!confirm('Permanently delete this trip booking?')) return;
    await fetch(`/api/trip-bookings/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const pendingBookingCount = bookings.filter(b => b.status === 'Pending').length;
  const filteredBookings = bookingFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === bookingFilter);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFB300]" />
            Trips & Tour Expeditions
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Manage public tour packages, departure batches, seat availability, and customer bookings.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors text-xs sm:text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {activeTab === 'trips' && (
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(255,179,0,0.3)]"
            >
              <Plus className="w-4 h-4" /> Post New Trip
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'trips'
              ? 'bg-[#FF6A00]/20 text-[#FFB300] border border-[#FF6A00]/40'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4" />
          Manage Trips ({trips.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all relative ${
            activeTab === 'bookings'
              ? 'bg-[#FF6A00]/20 text-[#FFB300] border border-[#FF6A00]/40'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Trip Bookings ({bookings.length})
          {pendingBookingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-xs font-black flex items-center justify-center">
              {pendingBookingCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TRIPS LIST */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-x-auto shadow-xl">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">Trip Package</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Package Fare</th>
                  <th className="p-4">Seats Left</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      Loading trips...
                    </td>
                  </tr>
                ) : trips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No trips posted yet. Click &ldquo;Post New Trip&rdquo; to add your first package.
                    </td>
                  </tr>
                ) : (
                  trips.map(trip => {
                    const statusCfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.Open;

                    return (
                      <tr key={trip._id} className="hover:bg-white/3 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={trip.image}
                              alt={trip.title}
                              className="w-16 h-12 object-cover rounded-lg shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white text-sm">{trip.title}</p>
                              <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#FFB300]" />
                                {trip.destination}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-xs text-gray-300">
                          <span className="font-semibold text-white block">{trip.duration}</span>
                          <span className="text-gray-500 text-[11px] truncate max-w-[140px] block">
                            {trip.departureDates?.[0] || 'Flexible'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="text-sm font-black text-[#FFB300]">
                            ₹{trip.price?.toLocaleString('en-IN')}
                          </span>
                          {trip.originalPrice && (
                            <span className="text-xs text-gray-500 line-through block">
                              ₹{trip.originalPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-xs">
                          <span className={`font-bold ${trip.seatsAvailable <= 5 ? 'text-orange-400' : 'text-white'}`}>
                            {trip.seatsAvailable}
                          </span>
                          <span className="text-gray-500"> / {trip.seatsTotal}</span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color}`}>
                              {trip.status}
                            </span>
                            <select
                              value={trip.status}
                              onChange={e => handleTripStatusToggle(trip, e.target.value)}
                              className="bg-black/60 border border-white/10 text-xs rounded-lg p-1 text-gray-300 focus:outline-none"
                            >
                              <option value="Open">Open</option>
                              <option value="Filling Fast">Filling Fast</option>
                              <option value="Sold Out">Sold Out</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(trip)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit trip"
                            >
                              <Edit2 size={17} />
                            </button>
                            <button
                              onClick={() => handleDeleteTrip(trip._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete trip"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TRIP BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setBookingFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 sm:shrink ${
                  bookingFilter === st
                    ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {st} (
                {st === 'All'
                  ? bookings.length
                  : bookings.filter(b => b.status === st).length}
                )
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
              No {bookingFilter !== 'All' ? bookingFilter.toLowerCase() : ''} trip bookings found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map(b => {
                const cfg = BOOKING_STATUS_CONFIG[b.status] || BOOKING_STATUS_CONFIG.Pending;
                const StatusIcon = cfg.icon;
                const isUpdating = updatingBookingId === b._id;

                return (
                  <div
                    key={b._id}
                    className={`bg-[#111] border rounded-2xl p-4 sm:p-5 transition-all overflow-hidden ${
                      b.status === 'Pending'
                        ? 'border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      
                      {/* Trip & Customer Info */}
                      <div className="flex items-start gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFB300]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-white text-base">
                              {b.trip?.title || 'Trip Package'}
                            </h3>
                            <span className="text-xs font-mono text-gray-500">
                              #{b._id?.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-400 mt-1">
                            <span className="text-white font-semibold flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-[#FFB300]" />
                              {b.customerName} ({b.numberOfSeats} seat{b.numberOfSeats > 1 ? 's' : ''})
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#FF6A00]" />
                              {b.departureDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-500" />
                              {b.phone}
                            </span>
                            {b.couponCode && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                                <Tag className="w-3 h-3" /> {b.couponCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 sm:gap-6 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="text-left sm:text-left lg:text-right">
                            <p className="text-xs text-gray-500">Total Paid</p>
                            <p className="text-xl font-black text-[#FFB300]">
                              ₹{b.totalPrice?.toLocaleString('en-IN')}
                            </p>
                          </div>

                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {b.status}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {b.status === 'Pending' && (
                            <button
                              onClick={() => handleBookingStatusUpdate(b._id, 'Confirmed')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => handleBookingStatusUpdate(b._id, 'Completed')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/30 transition-colors"
                            >
                              Mark Completed
                            </button>
                          )}

                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleBookingStatusUpdate(b._id, 'Cancelled')}
                              disabled={isUpdating}
                              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors"
                              title="Cancel booking and release seats"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Voucher Download Link */}
                          <a
                            href={`/api/trip-bookings/${b._id}/receipt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                            title="Download PDF Voucher / Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* WhatsApp Link */}
                          <a
                            href={`https://wa.me/91${b.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${b.customerName}, regarding your booking for ${b.trip?.title} on STM RIDER:`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleDeleteBooking(b._id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] p-6 md:p-8 rounded-3xl w-full max-w-2xl border border-white/10 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-2xl font-black text-white">
                {editingId ? 'Edit Tour Trip' : 'Post New Tour Trip'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure full trip details, pricing, itinerary, and seat capacity.
              </p>
            </div>

            <form onSubmit={handleTripSubmit} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shimla Snow & Heritage Getaway"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shimla & Kufri, Himachal Pradesh"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Trip Price (₹ per person)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3499"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4999"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Days / 2 Nights"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* Departure Dates */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Departure Dates (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Every Weekend (Fri - Sun), 25 Oct 2026, 01 Nov 2026"
                  value={formData.departureDatesText}
                  onChange={e => setFormData({ ...formData, departureDatesText: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              {/* Seats & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Total Seats
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.seatsTotal}
                    onChange={e => setFormData({ ...formData, seatsTotal: Number(e.target.value) })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Seats Available
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.seatsAvailable}
                    onChange={e => setFormData({ ...formData, seatsAvailable: Number(e.target.value) })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Trip Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  >
                    <option>Open</option>
                    <option>Filling Fast</option>
                    <option>Sold Out</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              {/* Image Input (File or URL) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Trip Cover Image (Upload or Image URL)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image.startsWith('data:') ? 'Image uploaded from device' : formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_WIDTH = 1200;
                          let width = img.width;
                          let height = img.height;
                          if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, width, height);
                          setFormData({ ...formData, image: canvas.toDataURL('image/jpeg', 0.8) });
                        };
                        img.src = event.target.result;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FFB300] file:text-black hover:file:bg-[#FF6A00] file:cursor-pointer"
                />
                {formData.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={formData.image} alt="Preview" className="w-16 h-12 object-cover rounded-lg border border-white/10" />
                    <span className="text-xs text-emerald-400 font-medium">✓ Cover image ready</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Trip Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Overview of the journey, scenery, and vibe..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                />
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Inclusions (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Stay in 3-star hotel&#10;Breakfast & Dinner included&#10;Sightseeing Cab / Tempo"
                    value={formData.inclusionsText}
                    onChange={e => setFormData({ ...formData, inclusionsText: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Exclusions (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Personal cafe expenses&#10;Adventure sports charges"
                    value={formData.exclusionsText}
                    onChange={e => setFormData({ ...formData, exclusionsText: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* Custom Things to Carry, Cancellation Policy & Terms */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFB300]" />
                      Custom Policies & Things to Carry (Optional)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Leave blank to use STM Rider standard defaults, or customize per trip below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        thingsToCarryText: `Valid Original Govt Photo ID (Aadhaar / Passport / Voter ID)\nStudent / College ID Card\nHeavy Down Jacket / Windcheater\nThermal Inners (Top & Bottom)\nTrekking Shoes / Sturdy Sneakers with Rubber Grip\n10,000mAh+ Power Bank & Charging Cables\nPersonal Daily Medications & Motion Sickness Pills\nSPF 50+ Sunscreen, Lip Balm & Cold Cream\n15L - 25L Daypack & Insulated Water Bottle\nPolarized Sunglasses & Sufficient Physical Cash`,
                        cancellationPolicyText: `15+ Days Before Departure: 85% Cash Refund or 100% STM Trip Credit Voucher\n7 to 14 Days Before Departure: 50% Cash Refund or 60% STM Trip Credit Voucher\n3 to 6 Days Before Departure: 25% Cash Refund or 35% STM Trip Credit Voucher\nUnder 72 Hours / No-Show: 0% Refund (Free seat transfer to friend allowed)\nWeather / Landslide Guarantee: 100% Trip Credit Voucher if routes blocked by authority`,
                        termsAndConditionsText: `Original Govt Photo ID is mandatory for boarding checkpoints and hotel check-in.\nReporting time is 30 minutes before departure. Buses will not wait for late passengers.\nStrict zero-tolerance policy against illegal drugs, narcotics, or harassment of co-travelers.\nBaggage allowance is 1 main rucksack/trolley (max 15kg) and 1 small daypack per seat.\nItinerary routes may adapt dynamically for passenger safety in case of severe mountain weather.\nTravelers must be medically fit and disclose pre-existing cardiac or respiratory conditions.`,
                      }));
                    }}
                    className="text-xs text-[#FFB300] hover:text-[#FF6A00] font-bold px-3 py-1.5 rounded-lg bg-[#FFB300]/10 border border-[#FFB300]/30 hover:bg-[#FFB300]/20 transition-all self-start sm:self-auto shrink-0"
                  >
                    Load Standard Template
                  </button>
                </div>

                {/* Custom Things to Carry */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1 flex items-center justify-between">
                    <span>🎒 Custom Things to Carry (1 item per line)</span>
                    <span className="text-[11px] text-gray-500 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Heavy Down Jacket&#10;Thermal Inners&#10;Trekking Shoes&#10;Power Bank (10,000mAh+)&#10;Valid Govt ID Card"
                    value={formData.thingsToCarryText}
                    onChange={e => setFormData({ ...formData, thingsToCarryText: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                {/* Custom Cancellation Policy */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1 flex items-center justify-between">
                    <span>🛡️ Custom Cancellation Policy (1 clause per line)</span>
                    <span className="text-[11px] text-gray-500 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="15+ Days: 85% Cash Refund or 100% Credit Voucher&#10;7-14 Days: 50% Cash Refund&#10;Under 72 Hours: No refund (Free seat transfer allowed)"
                    value={formData.cancellationPolicyText}
                    onChange={e => setFormData({ ...formData, cancellationPolicyText: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                {/* Custom Terms & Conditions */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1 flex items-center justify-between">
                    <span>📜 Custom Terms & Conditions (1 rule per line)</span>
                    <span className="text-[11px] text-gray-500 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Original Govt ID is mandatory for boarding&#10;Reporting time is strictly 30 minutes before departure&#10;Zero tolerance policy for drugs or misconduct"
                    value={formData.termsAndConditionsText}
                    onChange={e => setFormData({ ...formData, termsAndConditionsText: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* Day-by-Day Itinerary Builder */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-gray-300 uppercase">
                    Day-by-Day Itinerary
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      itinerary: [
                        ...formData.itinerary,
                        { day: formData.itinerary.length + 1, title: '', details: '' },
                      ],
                    })}
                    className="text-xs text-[#FFB300] hover:text-[#FF6A00] font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Day
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.itinerary.map((day, idx) => (
                    <div key={idx} className="p-3 bg-black/60 border border-white/5 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#FFB300] shrink-0">Day {idx + 1}</span>
                        <input
                          type="text"
                          placeholder="Title (e.g. Arrival & Mall Road Sightseeing)"
                          value={day.title}
                          onChange={e => {
                            const updated = [...formData.itinerary];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, itinerary: updated });
                          }}
                          className="flex-1 bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FFB300]"
                        />
                        {formData.itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.itinerary.filter((_, i) => i !== idx);
                              setFormData({ ...formData, itinerary: updated });
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Day details and highlights..."
                        value={day.details}
                        onChange={e => {
                          const updated = [...formData.itinerary];
                          updated[idx].details = e.target.value;
                          setFormData({ ...formData, itinerary: updated });
                        }}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FFB300]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black hover:opacity-90 transition-opacity mt-4 shadow-[0_0_20px_rgba(255,179,0,0.3)]"
              >
                {saving ? 'Saving Trip...' : editingId ? 'Update Trip Package' : 'Publish Tour Trip'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
