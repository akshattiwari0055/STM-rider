"use client";
import { useState, useEffect } from 'react';
import { Calendar, Phone, User, Timer, CheckCircle, Clock, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  Pending:   { color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30',  icon: AlertCircle },
  Active:    { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',      icon: Clock },
  Completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30',icon: CheckCircle },
  Cancelled: { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',        icon: XCircle },
};

function safeDate(d) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}
function fmtDate(d) {
  const dt = safeDate(d); if (!dt) return '—';
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(d) {
  const dt = safeDate(d); if (!dt) return '';
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function calcDropoff(b) {
  if (b.startDate && b.durationHours) {
    const d = new Date(b.startDate);
    if (!isNaN(d.getTime())) { d.setHours(d.getHours() + Number(b.durationHours)); return d; }
  }
  if (b.endDate) { const d = new Date(b.endDate); if (!isNaN(d.getTime())) return d; }
  return null;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('All');

  const fetchBookings = () => {
    setLoading(true);
    fetch('/api/bookings')
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => fetchBookings(), []);

  const updateStatus = async (bookingId, status) => {
    setUpdatingId(bookingId);
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    fetchBookings();
  };

  const counts = {
    All: bookings.length,
    Pending: bookings.filter(b => b.status === 'Pending').length,
    Active: bookings.filter(b => b.status === 'Active').length,
    Completed: bookings.filter(b => b.status === 'Completed').length,
    Cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  const displayed = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{bookings.length} total bookings</p>
        </div>
        <button onClick={fetchBookings} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === status
                  ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {status} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${filter === status ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No {filter !== 'All' ? filter.toLowerCase() : ''} bookings found.</div>
      ) : (
        <div className="space-y-3">
          {displayed.map(b => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.Pending;
            const Icon = cfg.icon;
            const dropoff = calcDropoff(b);
            const isUpdating = updatingId === b._id;

            return (
              <div key={b._id} className={`bg-[#111] border rounded-xl overflow-hidden transition-all ${
                b.status === 'Pending' ? 'border-yellow-500/30' : 'border-white/5 hover:border-white/10'
              }`}>
                {/* Pending warning bar */}
                {b.status === 'Pending' && (
                  <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-400 text-xs font-semibold">Awaiting payment confirmation — verify WhatsApp before confirming</span>
                  </div>
                )}

                <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Vehicle */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {b.vehicle?.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.vehicle.image} alt={b.vehicle?.name} className="w-16 h-12 object-cover rounded-lg" />
                    )}
                    <div>
                      <p className="text-white font-bold">{b.vehicle?.name || 'Unknown'}</p>
                      <p className="text-gray-500 text-xs">{b.vehicle?.type}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-10 bg-white/10 flex-shrink-0" />

                  {/* Customer */}
                  <div className="flex-shrink-0 w-48">
                    <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                      <User className="w-3.5 h-3.5 text-gray-500" />{b.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                      <Phone className="w-3 h-3" />{b.phone}
                    </div>
                    {(b.idCardImage || b.aadhaarCardImage || b.drivingLicenseImage) && (
                      <div className="mt-2 text-xs">
                        <details className="group cursor-pointer">
                          <summary className="text-blue-400 font-semibold hover:underline">View Uploaded IDs ▼</summary>
                          <div className="mt-2 space-y-2 relative z-50 flex flex-wrap gap-2">
                            {b.aadhaarCardImage && (
                              <div className="bg-black p-2 rounded border border-white/10 shadow-xl">
                                <p className="text-gray-400 mb-1">Aadhaar Card:</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={b.aadhaarCardImage} alt="Aadhaar" className="w-32 h-auto rounded" />
                              </div>
                            )}
                            {b.drivingLicenseImage && (
                              <div className="bg-black p-2 rounded border border-white/10 shadow-xl">
                                <p className="text-gray-400 mb-1">Driving License:</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={b.drivingLicenseImage} alt="DL" className="w-32 h-auto rounded" />
                              </div>
                            )}
                            {b.idCardImage && (
                              <div className="bg-black p-2 rounded border border-white/10 shadow-xl">
                                <p className="text-gray-400 mb-1">University / Alt ID:</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={b.idCardImage} alt="ID card" className="w-32 h-auto rounded" />
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-10 bg-white/10 flex-shrink-0" />

                  {/* Dates */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Pickup</p>
                        <p className="text-white font-medium">{fmtDate(b.startDate)}</p>
                        <p className="text-gray-500 text-xs">{fmtTime(b.startDate)}</p>
                      </div>
                      <div className="text-gray-600 font-bold">→</div>
                      <div>
                        <p className="text-gray-500 text-xs">Drop-off</p>
                        <p className="text-white font-medium">{fmtDate(dropoff)}</p>
                        <p className="text-gray-500 text-xs">{fmtTime(dropoff)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Duration + Amount */}
                  <div className="flex-shrink-0 text-right">
                    {b.durationHours && (
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm justify-end mb-1">
                        <Timer className="w-3.5 h-3.5 text-[#FFB300]" />{b.durationHours}h
                      </div>
                    )}
                    <span className="text-[#FFB300] font-black text-lg">₹{b.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-10 bg-white/10 flex-shrink-0" />

                  {/* Status + Actions */}
                  <div className="flex flex-col gap-2 items-end flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{b.status}
                    </span>
                    <div className="flex gap-1.5">
                      {b.status === 'Pending' && (
                        <button onClick={() => updateStatus(b._id, 'Active')} disabled={isUpdating}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40">
                          {isUpdating ? '...' : '✓ Confirm'}
                        </button>
                      )}
                      {b.status === 'Active' && (
                        <button onClick={() => updateStatus(b._id, 'Completed')} disabled={isUpdating}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-40">
                          {isUpdating ? '...' : 'Complete'}
                        </button>
                      )}
                      {(b.status === 'Pending' || b.status === 'Active') && (
                        <button onClick={() => updateStatus(b._id, 'Cancelled')} disabled={isUpdating}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40">
                          {isUpdating ? '...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
