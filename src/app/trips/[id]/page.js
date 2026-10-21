"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Clock, Calendar, Users, CheckCircle, XCircle, ArrowLeft,
  Phone, User, ShieldCheck, Download, CreditCard, Loader2, Sparkles,
  Info, Compass, ChevronDown, CheckCircle2, Tag
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import Footer from '@/components/Footer';

// ── Payment Page Component ───────────────────────────────────────────────────
function TripPaymentPage({ booking, trip, onDone }) {
  const [loading, setLoading] = useState(false);

  const handlePaymentDone = () => {
    setLoading(true);

    const message = `Hello Admin! 🏔️\n\nI have just booked seats for *${trip.title}* on STM RIDER and completed the manual payment via UPI.\n\n*Booking Details:*\n- *Name:* ${booking.customerName}\n- *Phone:* ${booking.phone}\n- *Trip:* ${trip.title}\n- *Destination:* ${trip.destination}\n- *Departure Date:* ${booking.departureDate}\n- *Seats Booked:* ${booking.numberOfSeats} Person(s)\n- *Amount Paid:* ₹${booking.totalPrice?.toLocaleString('en-IN')}\n- *Booking ID:* #${booking._id?.slice(-10).toUpperCase()}\n\nPlease verify and confirm my trip booking!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919465853502?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      onDone();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#FFB300]/10 border-2 border-[#FFB300]/30 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-[#FFB300]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-1">Scan & Pay via UPI</h2>
        <p className="text-gray-400">Scan the QR code below to complete your trip booking payment.</p>
      </div>

      {/* Booking Summary Strip */}
      <div className="w-full glass border border-white/10 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <img src={trip.image} alt={trip.title} className="w-24 h-16 object-cover rounded-xl shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-white font-bold text-lg">{trip.title}</p>
          <p className="text-gray-400 text-sm">
            {booking.numberOfSeats} Seat(s) · {booking.departureDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
          <p className="text-3xl font-black text-[#FFB300]">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="w-full max-w-sm bg-white p-5 rounded-3xl mb-8 shadow-2xl flex flex-col items-center">
        <img src="/images/qr1.png" alt="Payment QR Code" className="w-full h-auto rounded-xl object-contain mb-2" />
        <p className="text-black font-bold">Mayank Jaiswal</p>
        <p className="text-xs text-gray-500">Scan with GPay, PhonePe, Paytm, or BHIM</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={handlePaymentDone}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black font-black text-xl rounded-2xl hover:opacity-90 transition-all shadow-[0_0_30px_rgba(255,179,0,0.3)] hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-6 h-6" />
              I Have Paid ₹{booking.totalPrice?.toLocaleString('en-IN')}
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FFB300]" />
          Admin will verify the payment and confirm your seats shortly.
        </p>
      </div>
    </div>
  );
}

// ── Receipt Component ────────────────────────────────────────────────────────
function TripReceiptView({ booking, trip, onDownload }) {
  return (
    <div className="flex flex-col items-center max-w-xl mx-auto py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
        <CheckCircle className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black text-white mb-2 text-center">Booking Submitted!</h2>
      <p className="text-gray-400 text-sm text-center mb-8">
        Your booking request has been submitted. Our team will verify the payment and send you final departure instructions.
      </p>

      {/* Card */}
      <div className="w-full bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl mb-8">
        <div className="flex justify-between items-start pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold text-[#FFB300] uppercase tracking-wider block mb-1">
              STM RIDER EXPEDITIONS
            </span>
            <h3 className="text-xl font-bold text-white">{trip.title}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{trip.destination}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
            PENDING APPROVAL
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-white/10">
          <div>
            <p className="text-xs text-gray-500 uppercase">Customer Name</p>
            <p className="font-semibold text-white mt-0.5">{booking.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Contact Phone</p>
            <p className="font-semibold text-white mt-0.5">{booking.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Departure Batch</p>
            <p className="font-semibold text-white mt-0.5">{booking.departureDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Seats Booked</p>
            <p className="font-semibold text-[#FFB300] mt-0.5">{booking.numberOfSeats} Person(s)</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div>
            <p className="text-xs text-gray-500">Booking Reference</p>
            <p className="text-xs font-mono text-gray-300">#{booking._id?.slice(-10).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-2xl font-black text-[#FFB300]">₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={onDownload}
          className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,179,0,0.3)]"
        >
          <Download className="w-4 h-4" />
          Download PDF Receipt
        </button>

        <Link
          href="/dashboard"
          className="py-3.5 px-6 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 text-center transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

// ── Main Trip Details Page ───────────────────────────────────────────────────
export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stage: 'details' | 'payment' | 'receipt'
  const [stage, setStage] = useState('details');
  const [booking, setBooking] = useState(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [departureDate, setDepartureDate] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [notes, setNotes] = useState('');
  const [idCardImage, setIdCardImage] = useState(null);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Fetch Trip & User
  useEffect(() => {
    Promise.all([
      fetch(`/api/trips/${id}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()).catch(() => ({ user: null })),
    ]).then(([tripData, authData]) => {
      if (tripData && !tripData.error) {
        setTrip(tripData);
        if (tripData.departureDates && tripData.departureDates.length > 0) {
          setDepartureDate(tripData.departureDates[0]);
        }
        setPickupPoint(tripData.pickupLocation || 'LPU Law Gate');
      }
      if (authData?.user) {
        setUser(authData.user);
        setCustomerName(authData.user.name || '');
        setEmail(authData.user.email || '');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      setCouponLoading(false);
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || 'Invalid or inactive coupon');
      }
    } catch {
      setCouponLoading(false);
      setCouponError('Error validating coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleImageUpload = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
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
        setter(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!trip) return;
    if (!customerName || !phone) {
      alert('Please enter your full name and phone number.');
      return;
    }
    if (!departureDate) {
      alert('Please select a departure batch date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/trip-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip: trip._id,
          customerName,
          customerEmail: email || null,
          phone,
          numberOfSeats,
          departureDate,
          pickupPoint,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          idCardImage,
          notes,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok) {
        setBooking(data);
        setStage('payment');
      } else {
        alert(data.error || 'Failed to submit trip booking. Please try again.');
      }
    } catch {
      setSubmitting(false);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const downloadReceipt = async () => {
    if (!booking || !trip) return;
    try {
      // Fetch official high-resolution PDF voucher from server
      const res = await fetch(`/api/trip-bookings/${booking._id}/receipt`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = (trip.title || 'Trip').replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `STM_RIDER_Trip_${safeTitle}_${booking._id.slice(-6)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn('API receipt fetch failed, using local generator:', err);
    }

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();

      // Top color bar
      pdf.setFillColor(255, 179, 0);
      pdf.rect(0, 0, w, 4, 'F');
      pdf.setFillColor(255, 106, 0);
      pdf.rect(0, 4, w, 1, 'F');

      // Header logo & branding
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(255, 106, 0);
      pdf.text('STM RIDER', 14, 20);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Tours, Expeditions & Self-Drive Rentals | Ph: +91 94658 53502', 14, 25);

      // Status Badge
      const isConfirmed = booking.status === 'Confirmed';
      pdf.setFillColor(isConfirmed ? 220 : 254, isConfirmed ? 252 : 243, isConfirmed ? 231 : 199);
      pdf.roundedRect(w - 56, 13, 42, 8, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(isConfirmed ? 22 : 146, isConfirmed ? 101 : 64, isConfirmed ? 52 : 14);
      pdf.text(isConfirmed ? 'PAYMENT CONFIRMED' : 'PENDING APPROVAL', w - 54, 18.5);

      // Reference
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`#STM-TRIP-${booking._id?.slice(-8).toUpperCase() || ''}`, w - 56, 26);

      pdf.setDrawColor(226, 232, 240);
      pdf.line(14, 30, w - 14, 30);

      // Passenger Details
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 34, (w - 34) / 2, 34, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 106, 0);
      pdf.text('PRIMARY PASSENGER', 18, 40);
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text(booking.customerName || '', 18, 47);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Phone: ${booking.phone || ''}`, 18, 53);
      pdf.text(`Email: ${booking.customerEmail || email || 'N/A'}`, 18, 58);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Seats Reserved: ${booking.numberOfSeats} Person(s)`, 18, 63);

      // Trip Overview
      const cardX = 14 + (w - 34) / 2 + 6;
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(cardX, 34, (w - 34) / 2, 34, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 106, 0);
      pdf.text('TOUR EXPEDITION', cardX + 4, 40);
      pdf.setFontSize(10.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(trip.title || '', cardX + 4, 47);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Destination: ${trip.destination} (${trip.duration})`, cardX + 4, 53);
      pdf.text(`Departure Batch: ${booking.departureDate}`, cardX + 4, 58);
      pdf.text(`Pickup Point: ${booking.pickupPoint || 'LPU Law Gate'}`, cardX + 4, 63);

      // Daywise Itinerary Section
      let curY = 74;
      pdf.setFillColor(15, 23, 42);
      pdf.roundedRect(14, curY, w - 28, 6.5, 1.5, 1.5, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text('DAY-BY-DAY TOUR PLAN & HIGHLIGHTS', 18, curY + 4.5);
      curY += 10;

      const itinerary = trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : [];
      itinerary.forEach((item, idx) => {
        pdf.setFillColor(255, 179, 0);
        pdf.roundedRect(14, curY, 15, 5, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Day ${item.day || (idx + 1)}`, 21.5, curY + 3.6, { align: 'center' });

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(item.title || '', 32, curY + 3.8);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
        const lines = pdf.splitTextToSize(item.details || '', w - 50);
        pdf.text(lines, 32, curY + 8);
        curY += Math.max(12, 9 + lines.length * 3.5);
      });

      // Price breakdown
      curY += 2;
      pdf.setFillColor(254, 243, 199);
      pdf.roundedRect(14, curY, w - 28, 8, 1.5, 1.5, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(146, 64, 14);
      pdf.text(`TOTAL AMOUNT PAID (${booking.numberOfSeats} Seat(s)):`, 18, curY + 5.5);
      pdf.setFontSize(12);
      pdf.setTextColor(255, 106, 0);
      pdf.text(`Rs. ${Number(booking.totalPrice || 0).toLocaleString('en-IN')}`, w - 18, curY + 5.5, { align: 'right' });

      // Footer
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(148, 163, 184);
      pdf.text('Thank you for traveling with STM RIDER! Contact +91 94658 53502 for 24/7 support.', 14, curY + 16);

      pdf.save(`STM_Trip_${trip.title?.replace(/[^a-zA-Z0-9]/g, '_')}_${booking._id?.slice(-6)}.pdf`);
    } catch (err) {
      alert('Could not generate PDF receipt.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white p-6">
        <Compass className="w-16 h-16 text-gray-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Trip Not Found</h1>
        <p className="text-gray-400 mb-6">The requested trip could not be found or has ended.</p>
        <Link href="/trips" className="bg-[#FFB300] text-black font-bold px-6 py-2.5 rounded-xl">
          Browse All Trips
        </Link>
      </div>
    );
  }

  const baseTotal = (trip.price || 0) * numberOfSeats;
  const discountAmount = appliedCoupon ? Math.round((baseTotal * appliedCoupon.discountPercentage) / 100) : 0;
  const finalPayable = Math.max(0, baseTotal - discountAmount);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col pt-20">
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 py-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Trips
          </Link>
        </div>

        {/* Stage 2: Payment */}
        {stage === 'payment' && booking && (
          <TripPaymentPage
            booking={booking}
            trip={trip}
            onDone={() => setStage('receipt')}
          />
        )}

        {/* Stage 3: Receipt */}
        {stage === 'receipt' && booking && (
          <TripReceiptView
            booking={booking}
            trip={trip}
            onDownload={downloadReceipt}
          />
        )}

        {/* Stage 1: Full Details & Booking Form */}
        {stage === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left 2 Cols: Trip Details, Itinerary, Inclusions */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Hero Image & Headings */}
              <div className="rounded-3xl overflow-hidden glass border border-white/10 relative">
                <div className="relative h-72 sm:h-96 w-full overflow-hidden">
                  <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FFB300]" />
                      {trip.duration}
                    </span>
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFB300]/20 border border-[#FFB300]/40 text-[#FFB300] backdrop-blur-md">
                      {trip.seatsAvailable} seats remaining
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-sm font-semibold text-[#FFB300] flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-4 h-4" />
                      {trip.destination}
                    </p>
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      {trip.title}
                    </h1>
                  </div>
                </div>

                {/* Key Quick Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 p-5 bg-white/2">
                  <div className="p-2 sm:px-4">
                    <p className="text-xs text-gray-500 uppercase">Duration</p>
                    <p className="font-bold text-sm text-white mt-0.5">{trip.duration}</p>
                  </div>
                  <div className="p-2 sm:px-4">
                    <p className="text-xs text-gray-500 uppercase">Pickup Location</p>
                    <p className="font-bold text-sm text-white mt-0.5 truncate">{trip.pickupLocation}</p>
                  </div>
                  <div className="p-2 sm:px-4">
                    <p className="text-xs text-gray-500 uppercase">Group Size</p>
                    <p className="font-bold text-sm text-white mt-0.5">Up to {trip.seatsTotal} People</p>
                  </div>
                  <div className="p-2 sm:px-4">
                    <p className="text-xs text-gray-500 uppercase">Price</p>
                    <p className="font-black text-lg text-[#FFB300] mt-0.5">
                      ₹{trip.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overview / Story */}
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFB300]" />
                  Trip Overview
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  {trip.description}
                </p>
              </div>

              {/* Day-by-Day Itinerary */}
              {trip.itinerary && trip.itinerary.length > 0 && (
                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#FF6A00]" />
                      Day-by-Day Detailed Itinerary
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">Planned meticulously for maximum fun and comfort.</p>
                  </div>

                  <div className="space-y-4">
                    {trip.itinerary.map(item => (
                      <div
                        key={item.day}
                        className="p-5 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-[#FFB300]/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB300] to-[#FF6A00] text-black font-black flex items-center justify-center text-xs shrink-0">
                            D{item.day}
                          </span>
                          <h3 className="font-bold text-white text-base">
                            Day {item.day}: {item.title}
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm pl-11 leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Inclusions */}
                <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    What&apos;s Included
                  </h3>
                  <ul className="space-y-3">
                    {trip.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions */}
                <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    What&apos;s Not Included
                  </h3>
                  <ul className="space-y-3">
                    {trip.exclusions?.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Sticky Booking Card & Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 glass rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6">
                
                {/* Price Display */}
                <div className="pb-5 border-b border-white/10">
                  <p className="text-xs text-gray-400 mb-1 uppercase font-semibold">Special Package Fare</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white">
                      ₹{trip.price?.toLocaleString('en-IN')}
                    </span>
                    {trip.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{trip.originalPrice?.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Save ₹{((trip.originalPrice || 0) - trip.price)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">per person (includes travel, stay & meals)</p>
                </div>

                {/* Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  
                  {/* Select Departure Batch */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Departure Batch
                    </label>
                    <select
                      value={departureDate}
                      onChange={e => setDepartureDate(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                    >
                      {trip.departureDates?.map((d, i) => (
                        <option key={i} value={d} className="bg-[#111]">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Seats */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Number of Passengers / Seats
                    </label>
                    <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-xl p-2">
                      <button
                        type="button"
                        onClick={() => setNumberOfSeats(Math.max(1, numberOfSeats - 1))}
                        className="w-9 h-9 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-lg text-white">
                        {numberOfSeats}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNumberOfSeats(Math.min(trip.seatsAvailable || 20, numberOfSeats + 1))}
                        className="w-9 h-9 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  {/* Optional Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  {/* Optional ID proof upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      ID Proof (Aadhaar / College ID)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageUpload(e.target.files[0], setIdCardImage)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FFB300] file:text-black hover:file:bg-[#FF6A00] file:cursor-pointer"
                    />
                    {idCardImage && (
                      <p className="text-[11px] text-emerald-400 mt-1 font-medium">✓ ID Proof uploaded</p>
                    )}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#FFB300]" />
                        Have a Coupon Code?
                      </span>
                      {appliedCoupon && (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-red-400 hover:text-red-300 transition-colors font-medium lowercase"
                        >
                          remove
                        </button>
                      )}
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponCode}
                        disabled={Boolean(appliedCoupon)}
                        onChange={e => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-[#FFB300] disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim() || Boolean(appliedCoupon)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : appliedCoupon ? (
                          'Applied ✓'
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>

                    {appliedCoupon && (
                      <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Coupon applied! {appliedCoupon.discountPercentage}% OFF (Code: {appliedCoupon.code})
                      </p>
                    )}

                    {couponError && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        {couponError}
                      </p>
                    )}
                  </div>

                  {/* Total calculation strip */}
                  <div className="bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-2xl p-4 flex justify-between items-center mt-2">
                    <div>
                      <p className="text-xs text-gray-400">Total Payable</p>
                      <p className="text-xs text-gray-500">
                        ₹{trip.price?.toLocaleString('en-IN')} × {numberOfSeats} {numberOfSeats === 1 ? 'person' : 'persons'}
                      </p>
                      {appliedCoupon && (
                        <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          - ₹{discountAmount.toLocaleString('en-IN')} ({appliedCoupon.discountPercentage}% OFF)
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {appliedCoupon && (
                        <p className="text-xs text-gray-500 line-through">
                          ₹{baseTotal.toLocaleString('en-IN')}
                        </p>
                      )}
                      <p className="text-2xl font-black text-[#FFB300]">
                        ₹{finalPayable.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* CTA Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || trip.seatsAvailable <= 0}
                    className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#FFB300] to-[#FF6A00] text-black hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,179,0,0.3)] hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : trip.seatsAvailable <= 0 ? (
                      'Sold Out'
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Book Now & Pay ₹{finalPayable.toLocaleString('en-IN')}
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-gray-500">
                    Guaranteed seat reservation • Instant UPI confirmation
                  </p>
                </form>

              </div>
            </div>

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
