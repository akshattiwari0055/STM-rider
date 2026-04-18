"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Settings, ShoppingBag, Calendar, Clock, Timer,
  CheckCircle, XCircle, AlertCircle, ChevronRight, Eye, EyeOff,
  Save, Car, Edit3, Download, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const StatusBadge = ({ status }) => {
  const map = {
    Pending:   { color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30',  icon: AlertCircle },
    Active:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
    Completed: { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',       icon: CheckCircle },
    Cancelled: { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         icon: XCircle },
  };
  const config = map[status] || map.Pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
      <Icon className="w-3 h-3" />{status}
    </span>
  );
};

const formatDuration = (hours) => {
  if (hours === 168) return '1 Week';
  if (hours === 720) return '1 Month';
  return `${hours} Hours`;
};

// ── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptModal({ booking, onClose }) {
  const receiptRef = useRef(null);
  const vehicle = booking.vehicle;

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const dropoff = new Date(booking.startDate);
  dropoff.setHours(dropoff.getHours() + (booking.durationHours || 0));

  const downloadReceipt = () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const d = booking;
      const v = booking.vehicle || {};
      const startDt = new Date(d.startDate);
      const dropDt  = new Date(d.startDate);
      dropDt.setHours(dropDt.getHours() + (d.durationHours || 0));
      const fmt = (dt) => dt.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
      const fmtT = (dt) => dt.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

      // Top color bar
      pdf.setFillColor(255, 179, 0);
      pdf.rect(0, 0, w, 3, 'F');

      // Logo
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.setTextColor(0,0,0);
      pdf.text('STM', 15, 22);
      pdf.setTextColor(255, 106, 0);
      pdf.text('Riders', 31, 22);

      // Status badge
      pdf.setFillColor(220,252,231); pdf.roundedRect(w-55, 13, 42, 8, 2, 2, 'F');
      pdf.setFontSize(8); pdf.setTextColor(22,163,74);
      pdf.text('CONFIRMED', w-50, 18.5);

      // Booking ID
      pdf.setFontSize(8); pdf.setTextColor(160,160,160);
      pdf.text(`#${d._id?.slice(-10).toUpperCase() || ''}`, w-55, 27, { maxWidth: 50 });

      // Divider
      pdf.setDrawColor(230,230,230); pdf.line(15, 32, w-15, 32);

      // Vehicle
      pdf.setFontSize(9); pdf.setTextColor(130,130,130); pdf.setFont('helvetica','normal');
      pdf.text('VEHICLE', 15, 42);
      pdf.setFontSize(16); pdf.setFont('helvetica','bold'); pdf.setTextColor(0,0,0);
      pdf.text(v.name || d.vehicleName || 'Vehicle', 15, 51);

      // Customer
      pdf.setFontSize(9); pdf.setFont('helvetica','normal'); pdf.setTextColor(130,130,130);
      pdf.text('CUSTOMER', 15, 63);
      pdf.setFontSize(13); pdf.setFont('helvetica','bold'); pdf.setTextColor(0,0,0);
      pdf.text(d.customerName || '', 15, 71);
      pdf.setFontSize(10); pdf.setFont('helvetica','normal'); pdf.setTextColor(120,120,120);
      pdf.text(d.phone || '', 15, 77);

      // Divider
      pdf.setDrawColor(230,230,230); pdf.line(15, 83, w-15, 83);

      // Pickup / Drop-off
      pdf.setFontSize(9); pdf.setTextColor(130,130,130);
      pdf.text('PICKUP', 15, 92); pdf.text('DROP-OFF', w/2+5, 92);
      pdf.setFontSize(11); pdf.setFont('helvetica','bold'); pdf.setTextColor(0,0,0);
      pdf.text(fmt(startDt), 15, 100); pdf.text(fmt(dropDt), w/2+5, 100);
      pdf.setFontSize(10); pdf.setFont('helvetica','normal'); pdf.setTextColor(120,120,120);
      pdf.text(fmtT(startDt), 15, 107); pdf.text(fmtT(dropDt), w/2+5, 107);

      // Divider
      pdf.setDrawColor(230,230,230); pdf.line(15, 113, w-15, 113);

      // Duration
      pdf.setFontSize(11); pdf.setFont('helvetica','bold'); pdf.setTextColor(0,0,0);
      pdf.text(`Rental Duration: ${formatDuration(d.durationHours || 0)}`, 15, 123);

      // Price
      pdf.setFontSize(9); pdf.setFont('helvetica','normal'); pdf.setTextColor(150,150,150);
      pdf.text('Total Paid', w-15, 118, { align:'right' });
      pdf.setFontSize(22); pdf.setFont('helvetica','bold'); pdf.setTextColor(255,106,0);
      pdf.text(`Rs. ${d.totalPrice?.toLocaleString('en-IN') || ''}`, w-15, 128, { align:'right' });

      // Dashed divider
      pdf.setLineDashPattern([2,2],0); pdf.setDrawColor(220,220,220);
      pdf.line(15, 135, w-15, 135); pdf.setLineDashPattern([],0);

      // Footer
      pdf.setFontSize(9); pdf.setTextColor(160,160,160); pdf.setFont('helvetica','normal');
      pdf.text('Thank you for choosing Yellow Hut STM Riders  •  Have a safe journey!', w/2, 143, { align:'center' });

      // Bottom bar
      pdf.setFillColor(255,106,0);
      pdf.rect(0, pdf.internal.pageSize.getHeight()-3, w, 3, 'F');

      pdf.save(`STMRiders_Receipt_${d._id?.slice(-8).toUpperCase() || 'booking'}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF generation failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl scrollbar-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Receipt (white, print-friendly) */}
        <div ref={receiptRef} className="bg-white text-gray-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-[#FFB300] to-[#FF6A00]" />

          {/* Branding */}
          <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="text-2xl font-black tracking-tight">STM<span className="text-[#FF6A00]">Riders</span></p>
              <p className="text-xs text-gray-400 tracking-widest">YELLOW HUT STM RIDERS</p>
            </div>
            <div className="text-right">
              <StatusBadge status={booking.status} />
              <p className="text-xs text-gray-400 mt-1.5">#{booking._id?.slice(-10).toUpperCase()}</p>
            </div>
          </div>

          {/* Vehicle photo */}
          {vehicle && (
            <div className="relative h-36 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="text-xs font-bold text-black bg-[#FFB300] px-2 py-0.5 rounded-full uppercase tracking-wider">{vehicle.type}</span>
                <p className="text-white font-black text-xl mt-1">{vehicle.name}</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="px-8 py-6 space-y-4">
            {/* Customer */}
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer Details</p>
              <p className="font-bold text-lg">{booking.customerName}</p>
              <p className="text-gray-500 text-sm">{booking.phone}</p>
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
                <p className="font-bold text-sm text-gray-800">{fmtDate(booking.startDate)}</p>
                <p className="text-gray-500 text-sm">{fmtTime(booking.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Drop-off</p>
                <p className="font-bold text-sm text-gray-800">{fmtDate(dropoff)}</p>
                <p className="text-gray-500 text-sm">{fmtTime(dropoff)}</p>
              </div>
            </div>

            {/* Duration + Price */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5 text-gray-500 text-sm font-medium">
                <Timer className="w-4 h-4 text-[#FF6A00]" />
                {formatDuration(booking.durationHours || 0)} Rental
              </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Total Paid</p>
                <p className="text-4xl font-black text-[#FF6A00]">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-200 text-center text-xs text-gray-400">
              Thank you for choosing Yellow Hut STM Riders • Have a safe journey! 🏍️
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-[#FF6A00] to-[#FFB300]" />
        </div>

        {/* Download button (outside receipt for clean PDF) */}
        <button
          onClick={downloadReceipt}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black font-black py-3 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,179,0,0.3)]"
        >
          <Download className="w-5 h-5" /> Download PDF Receipt
        </button>
      </div>
    </div>
  );
}

// ── Booking Card ────────────────────────────────────────────────────────────
function BookingCard({ booking, onViewReceipt }) {
  const vehicle = booking.vehicle;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const dropoff = new Date(booking.startDate);
  dropoff.setHours(dropoff.getHours() + (booking.durationHours || 0));

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all group">
      {vehicle && (
        <div className="relative h-44 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute top-4 left-4 z-20">
            <span className="text-xs font-bold text-black bg-gradient-to-r from-[#FFB300] to-[#FF6A00] px-2.5 py-1 rounded-full uppercase tracking-wider">{vehicle.type}</span>
          </div>
          <div className="absolute bottom-4 left-4 z-20">
            <p className="text-white font-bold text-xl">{vehicle.name}</p>
          </div>
          <div className="absolute top-4 right-4 z-20">
            <StatusBadge status={booking.status} />
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Pickup / Dropoff */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Pickup</p>
            <p className="text-white text-sm font-semibold">{fmtDate(booking.startDate)}</p>
            <p className="text-gray-400 text-xs mt-0.5">{fmtTime(booking.startDate)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Drop-off</p>
            <p className="text-white text-sm font-semibold">{fmtDate(dropoff)}</p>
            <p className="text-gray-400 text-xs mt-0.5">{fmtTime(dropoff)}</p>
          </div>
        </div>

        {/* Duration, Price, Receipt */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 text-sm">{formatDuration(booking.durationHours || 0)}</span>
          </div>
          <div className="text-right">
            <p className="text-[#FFB300] font-black text-xl">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* View Receipt button */}
        <button
          onClick={() => onViewReceipt(booking)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#FFB300]/30 text-[#FFB300] text-sm font-semibold hover:bg-[#FFB300]/10 transition-all"
        >
          <Download className="w-4 h-4" /> View & Download Receipt
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [receiptBooking, setReceiptBooking] = useState(null); // booking to show in receipt modal

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) { window.location.href = '/login'; return; }
        setUser(data.user);
        setSettingsForm(p => ({ ...p, name: data.user.name, email: data.user.email }));
        setLoadingUser(false);
      })
      .catch(() => { window.location.href = '/login'; });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/bookings')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBookings(data); setLoadingBookings(false); })
      .catch(() => setLoadingBookings(false));
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg({ type: '', text: '' });
    const payload = { name: settingsForm.name, email: settingsForm.email };
    if (settingsForm.newPassword) {
      payload.currentPassword = settingsForm.currentPassword;
      payload.newPassword = settingsForm.newPassword;
    }
    try {
      const res = await fetch('/api/user/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSettingsMsg({ type: 'success', text: 'Profile updated successfully!' });
        setSettingsForm(p => ({ ...p, currentPassword: '', newPassword: '' }));
      } else {
        setSettingsMsg({ type: 'error', text: data.error || 'Failed to update.' });
      }
    } catch {
      setSettingsMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSettingsLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const activeBookings  = bookings.filter(b => b.status === 'Active');
  const pastBookings    = bookings.filter(b => b.status !== 'Active' && b.status !== 'Pending');

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      {/* Receipt modal */}
      {receiptBooking && <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />}

      {/* Ambient glows */}
      <div className="fixed top-40 left-10 w-72 h-72 bg-[#FFB300]/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-40 right-10 w-72 h-72 bg-[#FF6A00]/6 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── User Greeting ─────────────────────────── */}
        <div className="flex items-center gap-5 mb-10 pt-6">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,179,0,0.4)] ring-2 ring-[#FFB300]/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=FFB300,FF6A00,f97316&backgroundType=gradientLinear`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-gray-600 text-xs mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* ── Stats Bar ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
          { label: 'Total Bookings', value: bookings.length,         icon: ShoppingBag, color: 'text-[#FFB300]' },
            { label: 'Pending',        value: pendingBookings.length,  icon: AlertCircle, color: 'text-yellow-400' },
            { label: 'Completed',      value: pastBookings.filter(b => b.status === 'Completed').length, icon: Calendar, color: 'text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ──────────────────────────────────── */}
        <div className="flex gap-1 p-1 glass rounded-xl border border-white/5 mb-6 w-fit">
          {[
            { id: 'bookings', label: 'My Bookings', icon: ShoppingBag },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id} id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black shadow-[0_0_15px_rgba(255,106,0,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* ══ BOOKINGS TAB ══════════════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <div className="space-y-8">

            {/* Pending bookings — payment awaiting confirmation */}
            {pendingBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm">Payment Pending</p>
                    <p className="text-yellow-400/70 text-xs">Your booking is created. Please complete payment via QR and send WhatsApp confirmation. The admin will activate it shortly.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {pendingBookings.map(b => <BookingCard key={b._id} booking={b} onViewReceipt={setReceiptBooking} />)}
                </div>
              </div>
            )}

            {/* Active bookings */}
            {activeBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-lg font-bold text-white">Active Bookings</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {activeBookings.map(b => <BookingCard key={b._id} booking={b} onViewReceipt={setReceiptBooking} />)}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Booking History</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {pastBookings.map(b => <BookingCard key={b._id} booking={b} onViewReceipt={setReceiptBooking} />)}
                </div>
              </div>
            )}

            {loadingBookings && (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loadingBookings && bookings.length === 0 && (
              <div className="text-center py-20 glass rounded-2xl border border-white/5">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Car className="w-9 h-9 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                <p className="text-gray-500 mb-6">You haven&apos;t rented any vehicles yet. Explore our fleet!</p>
                <Link href="/vehicles" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Browse Vehicles <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ══ SETTINGS TAB ══════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFB300]/10 border border-[#FFB300]/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-[#FFB300]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Profile Settings</h2>
                  <p className="text-gray-500 text-sm">Update your name, email, or password</p>
                </div>
              </div>

              <form onSubmit={handleSettingsSave} className="p-8 space-y-6">
                {settingsMsg.text && (
                  <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 border ${
                    settingsMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {settingsMsg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {settingsMsg.text}
                  </div>
                )}

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" id="settings-name" required value={settingsForm.name}
                        onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#FFB300] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <input type="email" id="settings-email" required value={settingsForm.email}
                        onChange={e => setSettingsForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#FFB300] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-5">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Change Password <span className="text-gray-600 font-normal normal-case">(optional)</span>
                  </h3>
                  {[
                    { id: 'current', key: 'currentPassword', label: 'Current Password', show: showCurrentPw, toggle: () => setShowCurrentPw(p => !p) },
                    { id: 'new', key: 'newPassword', label: 'New Password', show: showNewPw, toggle: () => setShowNewPw(p => !p) },
                  ].map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                      <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <input
                          type={field.show ? 'text' : 'password'}
                          id={`settings-${field.id}-password`}
                          placeholder={field.id === 'new' ? 'Min. 6 characters' : 'Enter current password'}
                          value={settingsForm[field.key]}
                          onChange={e => setSettingsForm(p => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full bg-black/50 border border-white/10 rounded-lg pl-11 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFB300] transition-all"
                        />
                        <button type="button" onClick={field.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                          {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" id="settings-save" disabled={settingsLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] rounded-xl text-black font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,106,0,0.25)]"
                >
                  {settingsLoading ? (
                    <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" />Save Changes</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
