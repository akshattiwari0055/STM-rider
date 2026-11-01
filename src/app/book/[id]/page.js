"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Clock, CheckCircle, Download, ArrowLeft,
  Phone, User, Timer, Wallet, CreditCard, ShieldCheck, Loader2
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { jsPDF } from 'jspdf';
import VehicleAvailabilityCalendar from '@/components/VehicleAvailabilityCalendar';

const FALLBACK_TIERS = {
  Car: [{ hours: 6, price: 999 }, { hours: 12, price: 1499 }, { hours: 24, price: 1999 }, { hours: 168, price: 6999 }, { hours: 720, price: 25000 }],
  Bike: [{ hours: 3, price: 399 }, { hours: 12, price: 799 }, { hours: 24, price: 999 }, { hours: 168, price: 4999 }, { hours: 720, price: 15000 }],
  Scooty: [{ hours: 3, price: 299 }, { hours: 12, price: 499 }, { hours: 24, price: 799 }, { hours: 168, price: 3999 }, { hours: 720, price: 12000 }],
};

const formatDuration = (hours) => {
  if (hours === 168) return '1 Week';
  if (hours === 720) return '1 Month';
  return `${hours} Hours`;
};

const formatDurationShort = (hours) => {
  if (hours === 168) return '1W';
  if (hours === 720) return '1M';
  return `${hours}h`;
};

function toLocalDatetimeValue(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function addHoursToDate(date, hours) {
  const next = new Date(date);
  next.setHours(next.getHours() + Number(hours || 0));
  return next;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ── Payment Gateway ───────────────────────────────────────────────────────────
// HOW IT WORKS (no email, no Razorpay, no 3rd party)
// 1. Each booking gets a unique transaction reference (tr = booking _id)
// 2. UPI deep links include &tr=<id>&url=<callbackURL>
// 3. GPay / PhonePe / Paytm redirect to /api/payment/upi-callback?Status=SUCCESS&txnId=<UTR>&txnRef=<id>
// 4. The callback API verifies Status=SUCCESS and activates the booking
// 5. Frontend polls /api/bookings/[id]/payment-status every 4 s → auto-confirms
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_S   = 600; // 10 minutes

function PaymentPage({ booking, vehicle, onDone }) {
  // phase: 'choose' | 'verifying' | 'success' | 'timeout'
  const [phase, setPhase]     = useState('choose');
  const [dots, setDots]       = useState('');
  const [elapsed, setElapsed] = useState(0);
  const pollRef               = useRef(null);
  const tickRef               = useRef(null);
  const startedAt             = useRef(null);

  const amt    = booking.uniquePaymentAmount || booking.totalPrice;
  const amtStr = typeof amt === 'number' ? amt.toFixed(2) : String(booking.totalPrice);

  const upiId      = process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || 'mayankjaiswal@upi';
  const mname      = process.env.NEXT_PUBLIC_MERCHANT_NAME   || 'STM RIDER';
  const note       = `STM RIDER #${booking._id?.slice(-6).toUpperCase()}`;
  const callbackURL = typeof window !== 'undefined'
    ? `${window.location.origin}/api/payment/upi-callback`
    : '';

  // tr = transaction reference = booking ID (lets our callback identify the booking)
  const baseQuery = [
    `pa=${encodeURIComponent(upiId)}`,
    `pn=${encodeURIComponent(mname)}`,
    `am=${amtStr}`,
    `cu=INR`,
    `tn=${encodeURIComponent(note)}`,
    `tr=${booking._id}`,
    callbackURL ? `url=${encodeURIComponent(callbackURL)}` : '',
  ].filter(Boolean).join('&');

  const links = {
    phonepe: `phonepe://pay?${baseQuery}`,
    gpay:    `tez://upi/pay?${baseQuery}`,
    paytm:   `paytmmp://pay?${baseQuery}`,
    upi:     `upi://pay?${baseQuery}`,
  };

  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=230x230&margin=6&data=${encodeURIComponent(links.upi)}`;

  // ── Polling ──────────────────────────────────────────────────────────────────
  const startPolling = () => {
    if (phase === 'verifying') return; // already polling
    setPhase('verifying');
    startedAt.current = Date.now();

    tickRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(s);
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
      if (s >= POLL_TIMEOUT_S) {
        clearInterval(tickRef.current);
        clearInterval(pollRef.current);
        setPhase('timeout');
      }
    }, 700);

    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/bookings/${booking._id}/payment-status`);
        const data = await res.json();
        if (data.status === 'confirmed') {
          clearInterval(pollRef.current);
          clearInterval(tickRef.current);
          setPhase('success');
          setTimeout(() => onDone(), 2500);
        }
      } catch { /* keep polling */ }
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => () => {
    clearInterval(pollRef.current);
    clearInterval(tickRef.current);
  }, []);

  const openApp = (link) => {
    window.open(link, '_blank');
    startPolling();
  };

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  if (phase === 'success') return (
    <div className="flex flex-col items-center max-w-lg mx-auto text-center py-12">
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-full bg-emerald-500/10 border-2 border-emerald-400/40 flex items-center justify-center mx-auto">
          <CheckCircle className="w-14 h-14 text-emerald-400" />
        </div>
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
      </div>
      <h2 className="text-3xl font-black text-white mb-2">Payment Verified! 🎉</h2>
      <p className="text-gray-400">Your booking is confirmed. Loading your receipt...</p>
    </div>
  );

  // ── VERIFYING ─────────────────────────────────────────────────────────────────
  if (phase === 'verifying') {
    const pct  = Math.min(100, Math.round((elapsed / POLL_TIMEOUT_S) * 100));
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const r    = 52;
    const circ = 2 * Math.PI * r;
    return (
      <div className="flex flex-col items-center max-w-lg mx-auto text-center py-10">
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={r} fill="none"
              stroke="#FFB300" strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#FFB300] animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">Verifying Payment{dots}</h2>
        <p className="text-gray-400 text-sm mb-1">Waiting for UPI confirmation on ₹{amtStr}</p>
        <p className="text-gray-600 text-xs mb-8">
          {mins > 0 ? `${mins}m ` : ''}{secs}s · checking every 4 seconds
        </p>

        <div className="w-full glass border border-white/10 rounded-2xl p-5 text-left space-y-3 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">How verification works</p>
          {[
            ['1', 'You pay ₹' + amtStr + ' in your UPI app', '#FFB300'],
            ['2', 'UPI app sends a payment response to our server', '#FFB300'],
            ['✓', 'We confirm payment instantly — no admin needed', '#34d399'],
          ].map(([num, text, color]) => (
            <div key={num} className="flex gap-3 items-start">
              <span style={{ color, backgroundColor: color + '22' }}
                className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {num}
              </span>
              <p className="text-sm text-gray-300">{text}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-600">Do <span className="text-white font-semibold">not</span> close or refresh this page</p>
      </div>
    );
  }

  // ── TIMEOUT ──────────────────────────────────────────────────────────────────
  if (phase === 'timeout') return (
    <div className="flex flex-col items-center max-w-lg mx-auto text-center py-10">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-400/30 flex items-center justify-center mx-auto mb-5">
        <Timer className="w-10 h-10 text-amber-400" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Verification Timed Out</h2>
      <p className="text-gray-400 text-sm mb-6">
        We didn&apos;t receive a payment callback within 10 minutes. If you paid, our team will manually verify and activate your booking.
      </p>
      <div className="flex gap-3 w-full">
        <button onClick={() => { setPhase('choose'); setElapsed(0); setDots(''); }}
          className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all">
          Try Again
        </button>
        <button onClick={onDone}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black font-black hover:opacity-90 transition-all">
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  // ── CHOOSE (default) ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FFB300]/10 border-2 border-[#FFB300]/30 flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-8 h-8 text-[#FFB300]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-1">Complete Your Payment</h2>
        <p className="text-gray-400 text-sm">
          Pay via UPI — booking confirms <span className="text-[#FFB300] font-semibold">automatically</span> once payment is received.
        </p>
      </div>

      {/* Amount strip */}
      <div className="w-full glass border border-[#FFB300]/20 rounded-2xl p-4 mb-6 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vehicle.image} alt={vehicle.name} className="w-20 h-14 object-cover rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white font-bold">{vehicle.name}</p>
          <p className="text-gray-500 text-sm">{booking.durationHours}h · {fmtDate(booking.startDate)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500">Pay Exactly</p>
          <p className="text-3xl font-black text-[#FFB300]">₹{amtStr}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">unique per booking</p>
        </div>
      </div>

      {/* QR + App buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-6 items-start mb-4">
        {/* QR */}
        <div className="flex flex-col items-center mx-auto sm:mx-0 flex-shrink-0">
          <div className="bg-white p-3 rounded-2xl shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrURL} alt="UPI QR Code" width={190} height={190} className="block rounded-lg" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
          <button onClick={startPolling}
            className="mt-2 text-xs text-[#FFB300] hover:underline">
            Scanned? Click to verify →
          </button>
        </div>

        {/* App buttons */}
        <div className="flex-1 w-full space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Open UPI app directly</p>
          {[
            { key: 'phonepe', label: 'PhonePe',   desc: 'Auto-fills amount & confirms back', emoji: '📲', hover: 'hover:bg-[#5f259f]/20 hover:border-[#5f259f]/50' },
            { key: 'gpay',    label: 'Google Pay', desc: 'Auto-fills amount & confirms back', emoji: '💙', hover: 'hover:bg-blue-600/20 hover:border-blue-500/50' },
            { key: 'paytm',   label: 'Paytm',      desc: 'Auto-fills amount & confirms back', emoji: '💳', hover: 'hover:bg-[#00BAF2]/20 hover:border-[#00BAF2]/50' },
            { key: 'upi',     label: 'Other UPI',  desc: 'BHIM, Amazon Pay, any UPI app',     emoji: '📱', hover: 'hover:bg-white/10 hover:border-white/20' },
          ].map(({ key, label, desc, emoji, hover }) => (
            <button key={key} onClick={() => openApp(links[key])}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-white/10 bg-white/5 transition-all group ${hover}`}>
              <span className="text-xl flex-shrink-0">{emoji}</span>
              <div className="text-left flex-1">
                <p className="text-white font-bold text-sm">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
              <span className="text-gray-500 text-xs group-hover:text-white transition-colors flex-shrink-0">Open →</span>
            </button>
          ))}
        </div>
      </div>

      {/* How it works badge */}
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mt-2">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-xs text-gray-400">
          <span className="text-white font-semibold">No fake confirmations</span> — payment is verified directly via UPI callback. You cannot confirm without actually paying.
        </p>
      </div>
    </div>
  );
}

// ── Receipt Component ────────────────────────────────────────────────────────


// ── Receipt Component ────────────────────────────────────────────────────────
function ReceiptView({ booking, vehicle, receiptRef }) {
  const dropoff = (() => {
    const d = new Date(booking.startDate);
    d.setHours(d.getHours() + booking.durationHours);
    return d;
  })();

  return (
    <div ref={receiptRef} className="bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg">
      <div className="h-2 bg-gradient-to-r from-[#FFB300] to-[#FF6A00]" />
      <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-gray-100">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/log.png" alt="STM RIDER Logo" className="h-16 w-16 object-contain" />
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> CONFIRMED
          </span>
          <p className="text-xs text-gray-400 mt-1">#{booking._id?.slice(-10).toUpperCase()}</p>
        </div>
      </div>
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-6">
          <span className="text-xs font-bold text-black bg-[#FFB300] px-2 py-0.5 rounded-full uppercase">{vehicle.type}</span>
          <p className="text-white font-black text-xl mt-1">{vehicle.name}</p>
        </div>
      </div>
      <div className="px-8 py-6 space-y-4">
        <div className="pb-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer</p>
          <p className="font-bold text-lg">{booking.customerName}</p>
          <p className="text-gray-500 text-sm">{booking.phone}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
            <p className="font-bold text-sm">{fmtDate(booking.startDate)}</p>
            <p className="text-gray-500 text-sm">{fmtTime(booking.startDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Drop-off</p>
            <p className="font-bold text-sm">{fmtDate(dropoff)}</p>
            <p className="text-gray-500 text-sm">{fmtTime(dropoff)}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#FF6A00]" />
            <span className="font-semibold text-gray-700">{booking.durationHours} Hours Rental</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Total Paid</p>
            <p className="text-3xl font-black text-[#FF6A00]">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-dashed border-gray-200 text-center text-xs text-gray-400">
          Thank you for choosing STM RIDER • Payment Confirmed ✅
        </div>
      </div>
      <div className="h-2 bg-gradient-to-r from-[#FF6A00] to-[#FFB300]" />
    </div>
  );
}

// ── Main Booking Page ────────────────────────────────────────────────────────
export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const receiptRef = useRef(null);

  const [vehicle, setVehicle] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availability, setAvailability] = useState(null);

  // stage: 'form' | 'payment' | 'pending'
  const [stage, setStage] = useState('form');
  const [booking, setBooking] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);

  const [isManualDuration, setIsManualDuration] = useState(false);
  const [dropoffDateTime, setDropoffDateTime] = useState('');
  const [manualPrice, setManualPrice] = useState(0);
  const [manualHours, setManualHours] = useState(0);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const [idCardImage, setIdCardImage] = useState(null);
  const [aadhaarCardImage, setAadhaarCardImage] = useState(null);
  const [drivingLicenseImage, setDrivingLicenseImage] = useState(null);

  const processImage = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setter(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/vehicles').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
      fetch(`/api/vehicles/${id}/availability`).then(r => r.json()),
    ]).then(([vehicles, authData, availabilityData]) => {
      const found = Array.isArray(vehicles) ? vehicles.find(v => v._id === id) : null;
      if (found) {
        if (!found.tieredPricing || found.tieredPricing.length === 0) {
          found.tieredPricing = FALLBACK_TIERS[found.type] || FALLBACK_TIERS.Car;
        }
        setVehicle(found);
      }
      if (authData.user) {
        setUser(authData.user);
        setCustomerName(authData.user.name);
      }
      if (!availabilityData?.error) {
        setAvailability(availabilityData);
        setAvailabilityError('');
      } else {
        setAvailabilityError(availabilityData.error);
      }
      setLoading(false);
      setAvailabilityLoading(false);
    }).catch(() => {
      setLoading(false);
      setAvailabilityLoading(false);
      setAvailabilityError('Availability calendar could not be loaded right now.');
    });
  }, [id]);

  const dropoffTime = (() => {
    if (isManualDuration && dropoffDateTime) return new Date(dropoffDateTime);
    if (!pickupDateTime || !selectedTier) return null;
    return addHoursToDate(new Date(pickupDateTime), selectedTier.hours);
  })();

  const blockedRanges = (availability?.blockedRanges || []).map((range) => ({
    ...range,
    startDate: new Date(range.start),
    endDate: new Date(range.end),
  }));

  const selectedRangeConflict =
    pickupDateTime && dropoffTime
      ? blockedRanges.find((range) =>
          rangesOverlap(new Date(pickupDateTime), dropoffTime, range.startDate, range.endDate)
        )
      : null;

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || 'Invalid coupon');
      }
    } catch (err) {
      setCouponError('Error validating coupon');
    }
  };

  useEffect(() => {
    if (isManualDuration && pickupDateTime && dropoffDateTime) {
      const start = new Date(pickupDateTime);
      const end = new Date(dropoffDateTime);
      const diffMs = end - start;
      if (diffMs > 0) {
        const hrs = Math.ceil(diffMs / (1000 * 60 * 60));
        setManualHours(hrs);
        if (vehicle && vehicle.tieredPricing) {
          let remaining = Math.max(0, hrs);
          let sortedTiers = [...vehicle.tieredPricing].sort((a, b) => b.hours - a.hours);
          let total = 0;
          for (let tier of sortedTiers) {
            if (remaining >= tier.hours) {
              let count = Math.floor(remaining / tier.hours);
              total += count * tier.price;
              remaining -= count * tier.hours;
            }
          }
          if (remaining > 0) {
            let smallest = sortedTiers[sortedTiers.length - 1];
            total += Math.ceil(remaining / smallest.hours) * smallest.price;
          }
          setManualPrice(total);
        }
      } else {
        setManualHours(0);
        setManualPrice(0);
      }
    }
  }, [pickupDateTime, dropoffDateTime, isManualDuration, vehicle]);

  const handleCalendarSelect = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const fallbackTime = pickupDateTime ? new Date(pickupDateTime) : new Date();
    const candidate = new Date(
      year,
      month - 1,
      day,
      fallbackTime.getHours() || 10,
      fallbackTime.getMinutes() || 0,
      0,
      0
    );
    const earliest = new Date(Date.now() + 15 * 60 * 1000);

    if (candidate < earliest) {
      candidate.setHours(earliest.getHours(), earliest.getMinutes(), 0, 0);
    }

    setPickupDateTime(toLocalDatetimeValue(candidate));
    if (!selectedTier && vehicle?.tieredPricing?.length) {
      setSelectedTier(vehicle.tieredPricing[0]);
    }

    if (dropoffDateTime && new Date(dropoffDateTime) <= candidate) {
      setDropoffDateTime(toLocalDatetimeValue(addHoursToDate(candidate, selectedTier?.hours || 1)));
    }
  };

  const doesTierConflict = (hours) => {
    if (!pickupDateTime) return false;
    const start = new Date(pickupDateTime);
    const end = addHoursToDate(start, hours);
    return blockedRanges.some((range) => rangesOverlap(start, end, range.startDate, range.endDate));
  };

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    if (!pickupDateTime) setPickupDateTime(toLocalDatetimeValue(new Date()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isManualDuration && !selectedTier) return alert('Please select a rental duration.');
    if (isManualDuration && (!dropoffDateTime || manualHours <= 0)) return alert('Please select a valid drop-off date & time.');
    if (!pickupDateTime) return alert('Please select pickup date & time.');
    if (selectedRangeConflict) {
      return alert('That time window overlaps with an existing booking. Please choose another slot.');
    }

    const durationHrs = isManualDuration ? manualHours : selectedTier.hours;
    const basePrice = isManualDuration ? manualPrice : selectedTier.price;

    setSubmitting(true);
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle: vehicle._id,
        customerName,
        phone,
        startDate: new Date(pickupDateTime).toISOString(),
        durationHours: durationHrs,
        totalPrice: basePrice,
        isManual: isManualDuration,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        idCardImage,
        aadhaarCardImage,
        drivingLicenseImage
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      setBooking({
        ...data,
        vehicleName: vehicle.name,
        vehicleImage: vehicle.image,
        vehicleType: vehicle.type,
      });
      setStage('payment'); // ← go to payment QR page
    } else {
      alert(data.error || 'Booking failed. Please try again.');
    }
  };

  const downloadReceipt = () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const d = booking;
      const v = vehicle || {};
      const startDt = new Date(d.startDate);
      const dropDt = new Date(d.startDate);
      dropDt.setHours(dropDt.getHours() + (d.durationHours || 0));
      const fmt = (dt) => dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const fmtT = (dt) => dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      // Top bar
      pdf.setFillColor(255, 179, 0); pdf.rect(0, 0, w, 3, 'F');

      // Logo
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(19); pdf.setTextColor(255, 106, 0);
      pdf.text('STM', 15, 22); pdf.setFontSize(10); pdf.setTextColor(21, 135, 194); pdf.text('RIDER', 15, 28);

      // Status
      pdf.setFillColor(255, 243, 205); pdf.roundedRect(w - 55, 13, 42, 8, 2, 2, 'F');
      pdf.setFontSize(8); pdf.setTextColor(255, 106, 0); pdf.text('PENDING', w - 46, 18.5);
      pdf.setFontSize(8); pdf.setTextColor(160, 160, 160);
      pdf.text(`#${d._id?.slice(-10).toUpperCase() || ''}`, w - 55, 27, { maxWidth: 50 });

      pdf.setDrawColor(230, 230, 230); pdf.line(15, 32, w - 15, 32);

      // Vehicle
      pdf.setFontSize(9); pdf.setTextColor(130, 130, 130); pdf.setFont('helvetica', 'normal');
      pdf.text('VEHICLE', 15, 42);
      pdf.setFontSize(16); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 0, 0);
      pdf.text(v.name || 'Vehicle', 15, 51);

      // Customer
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(130, 130, 130);
      pdf.text('CUSTOMER', 15, 63);
      pdf.setFontSize(13); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 0, 0);
      pdf.text(d.customerName || '', 15, 71);
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(120, 120, 120);
      pdf.text(d.phone || '', 15, 77);

      pdf.setDrawColor(230, 230, 230); pdf.line(15, 83, w - 15, 83);

      // Dates
      pdf.setFontSize(9); pdf.setTextColor(130, 130, 130);
      pdf.text('PICKUP', 15, 92); pdf.text('DROP-OFF', w / 2 + 5, 92);
      pdf.setFontSize(11); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 0, 0);
      pdf.text(fmt(startDt), 15, 100); pdf.text(fmt(dropDt), w / 2 + 5, 100);
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(120, 120, 120);
      pdf.text(fmtT(startDt), 15, 107); pdf.text(fmtT(dropDt), w / 2 + 5, 107);

      pdf.setDrawColor(230, 230, 230); pdf.line(15, 113, w - 15, 113);

      // Duration + Price
      pdf.setFontSize(11); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 0, 0);
      pdf.text(`Rental Duration: ${formatDuration(d.durationHours || 0)}`, 15, 123);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(150, 150, 150);
      pdf.text('Total Paid', w - 15, 118, { align: 'right' });
      pdf.setFontSize(22); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(255, 106, 0);
      pdf.text(`Rs. ${d.totalPrice?.toLocaleString('en-IN') || ''}`, w - 15, 128, { align: 'right' });

      pdf.setLineDashPattern([2, 2], 0); pdf.setDrawColor(220, 220, 220);
      pdf.line(15, 135, w - 15, 135); pdf.setLineDashPattern([], 0);

      pdf.setFontSize(9); pdf.setTextColor(160, 160, 160); pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for choosing STM RIDER  •  Pending Approval', w / 2, 143, { align: 'center' });

      pdf.setFillColor(255, 106, 0);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 3, w, 3, 'F');

      pdf.save(`STMRider_Receipt_${d._id?.slice(-8).toUpperCase() || 'booking'}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF generation failed: ' + err.message);
    }
  };

  const minDateTime = toLocalDatetimeValue(new Date(Date.now() - 5 * 60 * 1000));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!vehicle) return (
    <div className="min-h-screen text-center pt-32 text-white">
      <p className="text-gray-400 mb-4">Vehicle not found.</p>
      <Link href="/vehicles" className="text-[#FFB300] hover:underline">← Browse vehicles</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="mx-auto w-full max-w-5xl">
        {stage !== 'success' && (
          <Link href="/vehicles" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Fleet
          </Link>
        )}

        {/* ══ STAGE 1: Form ══════════════════════════════════════════════ */}
        {stage === 'form' && (
          <div className="glass rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] border border-white/5">
            <div className="relative h-[230px] sm:h-[280px] lg:h-[320px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vehicle.image} alt={vehicle.name} className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6">
                <span className="text-[#FFB300] font-semibold text-xs tracking-widest uppercase mb-2 block">{vehicle.type}</span>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">{vehicle.name}</h1>
                <div className="grid max-w-md grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                  {vehicle.tieredPricing.map(t => (
                    <div key={t.hours} className="text-sm">
                      <span className="text-gray-300 flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#FFB300]" /> {formatDurationShort(t.hours)}</span>
                      <span className="text-white font-bold">₹{t.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="relative w-full max-w-3xl mx-auto p-5 sm:p-7 md:p-9">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFB300]/5 rounded-full blur-[60px] pointer-events-none" />
              <h2 className="text-2xl font-bold text-white mb-0.5">Complete Your Booking</h2>
              {user && <p className="text-gray-500 text-sm mb-5">Booking as <span className="text-[#FFB300]">{user.email}</span></p>}

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#FFB300] transition-all" />
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="tel" required placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFB300] transition-all" />
                  </div>
                </div>
                {/* Pickup Date & Time */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pickup Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="datetime-local" required min={minDateTime} value={pickupDateTime} onChange={e => setPickupDateTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#FFB300] [color-scheme:dark] transition-all" />
                  </div>
                </div>

                <div className="space-y-3">
                  {availabilityLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">
                      Loading real-time calendar availability...
                    </div>
                  ) : availability ? (
                    <VehicleAvailabilityCalendar
                      availability={availability}
                      pickupDateTime={pickupDateTime}
                      selectedEndDateTime={dropoffTime}
                      onSelectDate={handleCalendarSelect}
                    />
                  ) : (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {availabilityError || 'Availability calendar is unavailable right now.'}
                    </div>
                  )}

                  {selectedRangeConflict && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                      The selected pickup and drop-off overlap with an existing booking from{' '}
                      <span className="font-semibold text-white">
                        {fmtDate(selectedRangeConflict.start)} {fmtTime(selectedRangeConflict.start)}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold text-white">
                        {fmtDate(selectedRangeConflict.end)} {fmtTime(selectedRangeConflict.end)}
                      </span>.
                    </div>
                  )}
                </div>
                {/* Mandatory Uploads */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Upload Aadhaar Card <span className="text-red-400">*</span>
                    </label>
                    <input type="file" required accept="image/*" onChange={e => processImage(e.target.files[0], setAadhaarCardImage)}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" />
                    {aadhaarCardImage && <p className="text-xs text-emerald-400 mt-1 font-medium">✓ Aadhaar Card ready</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Driving License <span className="text-red-400">*</span>
                    </label>
                    <input type="file" required accept="image/*" onChange={e => processImage(e.target.files[0], setDrivingLicenseImage)}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" />
                    {drivingLicenseImage && <p className="text-xs text-emerald-400 mt-1 font-medium">✓ Driving License ready</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      University ID / Other ID Proof <span className="text-red-400">*</span>
                    </label>
                    <input type="file" required accept="image/*" onChange={e => processImage(e.target.files[0], setIdCardImage)}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" />
                    {idCardImage && <p className="text-xs text-emerald-400 mt-1 font-medium">✓ ID Proof ready</p>}
                  </div>
                </div>

                {/* Duration Selection Mode */}
                <div className="flex gap-4 mb-4 border-b border-white/10 pb-4">
                  <button type="button" onClick={() => setIsManualDuration(false)}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${!isManualDuration ? 'border-[#FFB300] text-[#FFB300]' : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    Select Package
                  </button>
                  <button type="button" onClick={() => setIsManualDuration(true)}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${isManualDuration ? 'border-[#FFB300] text-[#FFB300]' : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    Custom Dates
                  </button>
                </div>

                {!isManualDuration ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Package Duration</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {vehicle.tieredPricing.map((tier) => {
                        const isSelected = selectedTier?.hours === tier.hours;
                        const isBlockedForPickup = doesTierConflict(tier.hours);

                        return (
                          <button
                            key={tier.hours}
                            type="button"
                            onClick={() => handleTierSelect(tier)}
                            disabled={isBlockedForPickup}
                            className={`relative flex flex-col items-center rounded-xl border p-4 transition-all duration-200 ${isBlockedForPickup ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'} ${isSelected
                              ? 'border-[#FFB300] bg-gradient-to-br from-[#FFB300]/20 to-[#FF6A00]/10 shadow-[0_0_20px_rgba(255,179,0,0.2)]'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                          >
                            {isSelected && (
                              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB300]">
                                <CheckCircle className="h-3 w-3 text-black" />
                              </span>
                            )}
                            <Timer className={`mb-1.5 h-5 w-5 ${isSelected ? 'text-[#FFB300]' : 'text-gray-500'}`} />
                            <span className={`text-lg font-black ${isSelected ? 'text-[#FFB300]' : 'text-white'}`}>
                              {formatDurationShort(tier.hours)}
                            </span>
                            <span className={`mt-0.5 text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                              Rs. {tier.price.toLocaleString('en-IN')}
                            </span>
                            {isBlockedForPickup && (
                              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300">
                                Busy slot
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Drop-off Date & Time</label>
                    <div className="relative mb-2">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="datetime-local" required={isManualDuration} min={pickupDateTime || minDateTime} value={dropoffDateTime} onChange={e => setDropoffDateTime(e.target.value)}
                        className={`w-full rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none [color-scheme:dark] transition-all ${selectedRangeConflict ? 'border border-red-500/40 bg-red-500/10 focus:border-red-400' : 'border border-white/10 bg-white/5 focus:border-[#FFB300]'}`} />
                    </div>
                    {manualHours > 0 && (
                      <p className="text-xs text-[#FFB300]">Total Duration: {manualHours} Hours</p>
                    )}
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="pt-4 mt-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Have a Coupon?</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" placeholder="Enter Code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFB300] uppercase" />
                    <button type="button" onClick={handleApplyCoupon}
                      className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold border border-white/10 transition-colors whitespace-nowrap">
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && <p className="text-xs text-green-400 mt-2">Coupon applied! {appliedCoupon.discountPercentage}% OFF</p>}
                  {couponError && <p className="text-xs text-red-400 mt-2">{couponError}</p>}
                </div>

                {/* Live Summary */}
                {((!isManualDuration && selectedTier) || (isManualDuration && manualHours > 0)) && pickupDateTime && (
                  <div className="bg-gradient-to-r from-[#FFB300]/10 to-[#FF6A00]/5 border border-[#FFB300]/20 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1 sm:gap-2">
                      <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0" /> Pickup</span>
                      <span className="text-white font-medium sm:text-right">{fmtDate(pickupDateTime)} · {fmtTime(pickupDateTime)}</span>
                    </div>
                    {dropoffTime && (
                      <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1 sm:gap-2">
                        <span className="text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0" /> Drop-off</span>
                        <span className="text-white font-medium sm:text-right">{fmtDate(dropoffTime)} · {fmtTime(dropoffTime)}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-3 flex justify-between items-end gap-2">
                      <span className="text-gray-300 font-semibold flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 text-[#FFB300] shrink-0" /> {formatDuration(isManualDuration ? manualHours : selectedTier.hours)}</span>
                      <div className="text-right shrink-0">
                        {appliedCoupon && (
                          <span className="text-gray-500 text-sm line-through block">₹{(isManualDuration ? manualPrice : selectedTier.price).toLocaleString('en-IN')}</span>
                        )}
                        <span className="text-[#FFB300] font-black text-2xl">
                          ₹{(appliedCoupon
                            ? Math.max(0, (isManualDuration ? manualPrice : selectedTier.price) * (1 - appliedCoupon.discountPercentage / 100))
                            : (isManualDuration ? manualPrice : selectedTier.price)
                          ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <button type="submit" disabled={submitting || (!isManualDuration && !selectedTier) || (isManualDuration && manualHours <= 0) || !pickupDateTime || !idCardImage || !aadhaarCardImage || !drivingLicenseImage || Boolean(selectedRangeConflict)}
                  className="w-full py-4 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] rounded-xl text-black font-black text-base hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Processing...</>
                    : <><Wallet className="w-5 h-5" /> Confirm Booking & Pay</>
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══ STAGE 2: Payment QR ════════════════════════════════════════ */}
        {stage === 'payment' && booking && (
          <PaymentPage
            booking={booking}
            vehicle={vehicle}
            onDone={() => setStage('success')}
          />
        )}

        {/* ══ STAGE 3: Success & Receipt ═════════════════════════════════ */}
        {stage === 'success' && booking && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-full bg-[#FFB300]/10 border-2 border-[#FFB300]/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-[#FFB300]" />
              </div>
              <h2 className="text-4xl font-black text-white mb-2">Booking Confirmed! 🎉</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-lg">
                Your payment has been verified and your booking is now <span className="text-emerald-400 font-bold">active</span>.
                A confirmation email has been sent to you. You&apos;re all set to pick up your vehicle!
              </p>
            </div>

            <div className="w-full flex justify-center mb-12">
              <ReceiptView booking={booking} vehicle={vehicle} receiptRef={receiptRef} />
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={downloadReceipt}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold border border-white/10 transition-all group"
              >
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Download PDF Receipt
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,179,0,0.3)]"
              >
                Go to My Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
